import Router from '@koa/router';
import Joi from 'joi';
import Role from '../core/roles';
import validate from '../core/validation';
import { makeRequireRole, requireAuthentication } from '../core/auth';
import * as artistService from '../service/artist';
import type { AlbumAppContext, AlbumAppState, KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateArtistRequest,
  CreateArtistResponse,
  GetAllArtistsResponse,
  GetArtistByIdResponse,
  UpdateArtistRequest,
  UpdateArtistResponse,
} from '../types/artist';
import type { IdParams } from '../types/common';

const querySchema = {
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25),
  q: Joi.string().allow('').optional(),
};

const getAllArtists = async (ctx: KoaContext<GetAllArtistsResponse>) => {
  ctx.body = await artistService.getAll(ctx.query as any);
};
getAllArtists.validationScheme = { query: querySchema };

const getArtistById = async (ctx: KoaContext<GetArtistByIdResponse, IdParams>) => {
  ctx.body = await artistService.getById(ctx.params.id);
};
getArtistById.validationScheme = { params: { id: Joi.number().integer().positive().required() } };

const createArtist = async (ctx: KoaContext<CreateArtistResponse, void, CreateArtistRequest>) => {
  const artist = await artistService.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = artist;
};
createArtist.validationScheme = {
  body: {
    name: Joi.string().min(2).max(255).required(),
    genre: Joi.string().max(255).allow(null).optional(),
  },
};

const updateArtist = async (ctx: KoaContext<UpdateArtistResponse, IdParams, UpdateArtistRequest>) => {
  ctx.body = await artistService.updateById(ctx.params.id, ctx.request.body);
};
updateArtist.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
  body: createArtist.validationScheme.body,
};

const deleteArtist = async (ctx: KoaContext<void, IdParams>) => {
  await artistService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteArtist.validationScheme = { params: { id: Joi.number().integer().positive().required() } };

export default (parent: KoaRouter) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({ prefix: '/artists' });

  router.get('/', validate(getAllArtists.validationScheme), getAllArtists);
  router.get('/:id', validate(getArtistById.validationScheme), getArtistById);

  const requireAdmin = makeRequireRole(Role.ADMIN);
  router.post('/', requireAuthentication, requireAdmin, validate(createArtist.validationScheme), createArtist);
  router.put('/:id', requireAuthentication, requireAdmin, validate(updateArtist.validationScheme), updateArtist);
  router.delete('/:id', requireAuthentication, requireAdmin, validate(deleteArtist.validationScheme), deleteArtist);

  parent.use(router.routes()).use(router.allowedMethods());
};
