import Router from '@koa/router';
import Joi from 'joi';
import Role from '../core/roles';
import * as userService from '../service/user';
import validate from '../core/validation';
import {
  authDelay,
  makeRequireRole,
  requireAuthentication,
} from '../core/auth';
import type {
  AlbumAppContext,
  AlbumAppState,
  KoaContext,
  KoaRouter,
} from '../types/koa';
import type {
  AuthResponse,
  GetAllUsersResponse,
  GetUserByIdResponse,
  RegisterUserRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateUserRoleRequest,
  GetUserRequest,
} from '../types/user';

const registerUser = async (
  ctx: KoaContext<AuthResponse, void, RegisterUserRequest>,
) => {
  ctx.body = await userService.register(ctx.request.body);
  ctx.status = 200;
};
registerUser.validationScheme = {
  body: {
    firstName: Joi.string().max(255).required(),
    lastName: Joi.string().max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(12).max(128).required(),
  },
};

const getAllUsers = async (ctx: KoaContext<GetAllUsersResponse>) => {
  ctx.body = { items: await userService.getAll() };
};
getAllUsers.validationScheme = null;

const getUserById = async (
  ctx: KoaContext<GetUserByIdResponse, GetUserRequest>,
) => {
  const requestedId =
    ctx.params.id === 'me' ? ctx.state.session!.userId : Number(ctx.params.id);

  const isAdmin = ctx.state.session!.roles.includes(Role.ADMIN);
  if (!isAdmin && requestedId !== ctx.state.session!.userId) {
    ctx.throw(403, 'Forbidden', { code: 'FORBIDDEN' });
  }

  ctx.body = await userService.getById(requestedId);
};
getUserById.validationScheme = {
  params: {
    id: Joi.alternatives()
      .try(Joi.number().integer().positive(), Joi.string().valid('me'))
      .required(),
  },
};

const updateUserById = async (
  ctx: KoaContext<UpdateUserResponse, { id: number }, UpdateUserRequest>,
) => {
  const isAdmin = ctx.state.session!.roles.includes(Role.ADMIN);
  if (!isAdmin && ctx.params.id !== ctx.state.session!.userId) {
    ctx.throw(403, 'Forbidden', { code: 'FORBIDDEN' });
  }

  ctx.body = await userService.updateById(ctx.params.id, ctx.request.body);
};
updateUserById.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
  body: {
    firstName: Joi.string().max(255).required(),
    lastName: Joi.string().max(255).required(),
    email: Joi.string().email().required(),
  },
};

const updateUserRole = async (
  ctx: KoaContext<GetUserByIdResponse, { id: number }, UpdateUserRoleRequest>,
) => {
  ctx.body = await userService.updateRoleById(
    ctx.params.id,
    ctx.request.body.role,
  );
};
updateUserRole.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
  body: { role: Joi.string().valid(Role.ADMIN, Role.USER).required() },
};

const deleteUserById = async (ctx: KoaContext<void, { id: number }>) => {
  await userService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteUserById.validationScheme = {
  params: { id: Joi.number().integer().positive().required() },
};

export default (parent: KoaRouter) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({
    prefix: '/users',
  });

  router.post(
    '/',
    authDelay,
    validate(registerUser.validationScheme),
    registerUser,
  );

  const requireAdmin = makeRequireRole(Role.ADMIN);

  router.get(
    '/',
    requireAuthentication,
    requireAdmin,
    validate(getAllUsers.validationScheme),
    getAllUsers,
  );

  router.get(
    '/:id',
    requireAuthentication,
    validate(getUserById.validationScheme),
    getUserById,
  );
  router.put(
    '/:id',
    requireAuthentication,
    validate(updateUserById.validationScheme),
    updateUserById,
  );

  router.put(
    '/:id/role',
    requireAuthentication,
    requireAdmin,
    validate(updateUserRole.validationScheme),
    updateUserRole,
  );
  router.delete(
    '/:id',
    requireAuthentication,
    requireAdmin,
    validate(deleteUserById.validationScheme),
    deleteUserById,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
