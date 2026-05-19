import Router from '@koa/router';
import Joi from 'joi';
import validate from '../core/validation';
import * as userService from '../service/user';
import { authDelay } from '../core/auth';
import type { KoaContext, KoaRouter, AlbumAppState, AlbumAppContext } from '../types/koa';
import type { AuthResponse, LoginRequest } from '../types/user';

const login = async (ctx: KoaContext<AuthResponse, void, LoginRequest>) => {
  const { email, password } = ctx.request.body;
  ctx.body = await userService.login(email, password);
  ctx.status = 200;
};
login.validationScheme = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  },
};

export default function installSessionRoutes(parent: KoaRouter) {
  const router = new Router<AlbumAppState, AlbumAppContext>({ prefix: '/sessions' });

  router.post('/', authDelay, validate(login.validationScheme), login);

  parent.use(router.routes()).use(router.allowedMethods());
}
