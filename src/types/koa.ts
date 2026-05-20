// src/types/koa.ts
// src/types/koa.ts
import type Koa from 'koa';
import type { ParameterizedContext } from 'koa';
import type Router from '@koa/router';
import type { SessionInfo } from './auth';

export interface AlbumAppState {
  session?: SessionInfo | undefined;
}

export interface AlbumAppContext<
  Params = unknown,
  RequestBody = unknown,
  Query = unknown,
> {
  request: {
    body: RequestBody;
    query: Query;
  };
  params: Params;
}
export interface KoaContext<
  ResponseBody = unknown,
  Params = unknown,
  RequestBody = unknown,
  Query = unknown,
> extends ParameterizedContext<
    AlbumAppState,
    AlbumAppContext<Params, RequestBody, Query>,
    ResponseBody
  > {}

export type KoaApplication = Koa<AlbumAppState, AlbumAppContext>;
export type KoaRouter = Router<AlbumAppState, AlbumAppContext>;
