import Router from '@koa/router';
import Joi from 'joi';
import Role from '../core/roles';
import validate from '../core/validation';
import {
  makeRequireRole,
  optionalAuthentication,
  requireAuthentication,
} from '../core/auth';
import * as AlbumService from '../service/album';
import type {
  AlbumAppContext,
  AlbumAppState,
  KoaContext,
  KoaRouter,
} from '../types/koa';
import type {
  CreateAlbumRequest,
  CreateAlbumResponse,
  GetAdminAlbumsResponse,
  GetAlbumByIdResponse,
  GetCatalogAlbumsResponse,
  GetOwnedAlbumsResponse,
  UpdateAlbumRequest,
  UpdateAlbumResponse,
} from '../types/album';
import type { IdParams } from '../types/common';

const catalogQuerySchema = {
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(12),
  q: Joi.string().allow('').optional(),
  artistId: Joi.number().integer().positive().optional(),
};

const getCatalog = async (ctx: KoaContext<GetCatalogAlbumsResponse>) => {
  const userId = ctx.state.session?.userId;
  ctx.body = await AlbumService.getCatalog(ctx.query as any, userId);
};
getCatalog.validationScheme = { query: catalogQuerySchema };

const getCatalogById = async (
  ctx: KoaContext<GetAlbumByIdResponse, IdParams>,
) => {
  const userId = ctx.state.session?.userId;
  ctx.body = await AlbumService.getCatalogById(ctx.params.id, userId);
};
getCatalogById.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
};

const getOwned = async (ctx: KoaContext<GetOwnedAlbumsResponse>) => {
  ctx.body = { items: await AlbumService.getOwned(ctx.state.session!.userId) };
};
getOwned.validationScheme = null;

const removeOwned = async (ctx: KoaContext<void, IdParams>) => {
  await AlbumService.removeOwned(ctx.state.session!.userId, ctx.params.id);
  ctx.status = 204;
};
removeOwned.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
};

const getAdminList = async (ctx: KoaContext<GetAdminAlbumsResponse>) => {
  ctx.body = await AlbumService.getAdminList(ctx.query as any);
};
getAdminList.validationScheme = { query: catalogQuerySchema };

const exportAdminCsv = async (ctx: KoaContext) => {
  const csv = await AlbumService.exportCatalogCsv();
  ctx.set('Content-Type', 'text/csv; charset=utf-8');
  ctx.set('Content-Disposition', 'attachment; filename="albums.csv"');
  ctx.body = csv;
};
exportAdminCsv.validationScheme = null;

const createAlbum = async (
  ctx: KoaContext<CreateAlbumResponse, void, CreateAlbumRequest>,
) => {
  const album = await AlbumService.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = album;
};
createAlbum.validationScheme = {
  body: {
    title: Joi.string().min(2).max(255).required(),
    dateReleased: Joi.date().iso().required(),
    lengthSeconds: Joi.number().integer().min(0).allow(null).optional(),
    trackCount: Joi.number().integer().min(0).allow(null).optional(),
    priceCents: Joi.number().integer().min(0).required(),
    coverImageUrl: Joi.string().max(2048).allow(null).optional(),
    artistId: Joi.number().integer().positive().required(),
  },
};

const updateAlbum = async (
  ctx: KoaContext<UpdateAlbumResponse, IdParams, UpdateAlbumRequest>,
) => {
  ctx.body = await AlbumService.updateById(ctx.params.id, ctx.request.body);
};
updateAlbum.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
  body: createAlbum.validationScheme.body,
};

const deleteAlbum = async (ctx: KoaContext<void, IdParams>) => {
  await AlbumService.deleteCatalogById(ctx.params.id);
  ctx.status = 204;
};
deleteAlbum.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
};

export default (parent: KoaRouter) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({
    prefix: '/albums',
  });

  // Public catalog
  router.get(
    '/catalog',
    optionalAuthentication,
    validate(getCatalog.validationScheme),
    getCatalog,
  );
  router.get(
    '/catalog/:id',
    optionalAuthentication,
    validate(getCatalogById.validationScheme),
    getCatalogById,
  );

  // User library
  router.get(
    '/',
    requireAuthentication,
    validate(getOwned.validationScheme),
    getOwned,
  );
  router.delete(
    '/me/:id',
    requireAuthentication,
    validate(removeOwned.validationScheme),
    removeOwned,
  );

  // Admin
  const requireAdmin = makeRequireRole(Role.ADMIN);
  router.get(
    '/admin',
    requireAuthentication,
    requireAdmin,
    validate(getAdminList.validationScheme),
    getAdminList,
  );
  router.get(
    '/admin/export',
    requireAuthentication,
    requireAdmin,
    validate(exportAdminCsv.validationScheme),
    exportAdminCsv,
  );
  router.post(
    '/',
    requireAuthentication,
    requireAdmin,
    validate(createAlbum.validationScheme),
    createAlbum,
  );
  router.put(
    '/:id',
    requireAuthentication,
    requireAdmin,
    validate(updateAlbum.validationScheme),
    updateAlbum,
  );
  router.delete(
    '/:id',
    requireAuthentication,
    requireAdmin,
    validate(deleteAlbum.validationScheme),
    deleteAlbum,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
