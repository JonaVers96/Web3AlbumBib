import Koa from 'koa';
import config from 'config';
import { getLogger } from './core/logging';
import { shutdownData } from './data';
import installMiddlewares from './core/installMiddlewares';
import installRest from './rest';
import type { KoaApplication, AlbumAppContext, AlbumAppState } from './types/koa';
import Router from '@koa/router';
import { registerSwagger } from './core/swagger';
import mount from 'koa-mount';
import serve from 'koa-static';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT ?? config.get<number>('server.port'));

export interface Server {
  getApp(): KoaApplication;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export default async function createServer(): Promise<Server> {
  const app = new Koa<AlbumAppState, AlbumAppContext>();

  // Static uploads (album covers, ...)
  const uploadRoot = path.resolve(process.cwd(), 'uploads');
  const coversDir = path.join(uploadRoot, 'covers');
  fs.mkdirSync(coversDir, { recursive: true });
  app.use(mount('/uploads', serve(uploadRoot)));

  installMiddlewares(app);
  installRest(app);

  const swaggerRouter = new Router({ prefix: '/api' });
  registerSwagger(app, swaggerRouter);
  app.use(swaggerRouter.routes()).use(swaggerRouter.allowedMethods());

  return {
    getApp() {
      return app;
    },
    start() {
      return new Promise<void>((resolve) => {
        app.listen(PORT, () => {
          getLogger().info(`🚀 Server listening on http://localhost:${PORT}`);
          resolve();
        });
      });
    },
    async stop() {
      app.removeAllListeners();
      await shutdownData();
      getLogger().info('Goodbye! 👋');
    },
  };
}
