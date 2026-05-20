// src/core/auth.ts
import config from 'config';
import type Router from '@koa/router';                      
import type { AlbumAppState, AlbumAppContext } from '../types/koa';  
import * as userService from '../service/user';

const AUTH_MAX_DELAY = config.get<number>('auth.maxDelay');

export const requireAuthentication: Router.Middleware<AlbumAppState, AlbumAppContext> = async (ctx, next) => {
  const { authorization } = ctx.headers;
  ctx.state.session = await userService.checkAndParseSession(authorization);
  await next();
};

export const optionalAuthentication: Router.Middleware<AlbumAppState, AlbumAppContext> = async (ctx, next) => {
  const { authorization } = ctx.headers;
  if (authorization) {
    try {
      ctx.state.session = await userService.checkAndParseSession(authorization);
    } catch {
      // ignore invalid tokens for public routes
      ctx.state.session = undefined;
    }
  }
  await next();
};

export const makeRequireRole = (role: string): Router.Middleware<AlbumAppState, AlbumAppContext> => {
  return async (ctx, next) => {
    const { roles = [] } = ctx.state.session ?? {};
    userService.checkRole(role, roles);
    await next();
  };
};

export const authDelay: Router.Middleware<AlbumAppState, AlbumAppContext> = async (_ctx, next) => {
  const delay = Math.round(Math.random() * AUTH_MAX_DELAY);
  await new Promise((resolve) => setTimeout(resolve, delay));
  await next();
};
