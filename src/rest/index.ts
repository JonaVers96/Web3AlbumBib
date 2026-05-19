import Router from '@koa/router';
import installAlbumRouter from './album';
import installHealthRouter from './health';
import installArtistRouter from './artist';
import installUserRouter from './user';
import installSessionRouter from './session';
import installPaymentRouter from './payment';
import installWebhookRouter from './webhook';
import installUploadRouter from './upload';
import type { AlbumAppContext, AlbumAppState, KoaApplication } from '../types/koa';

/**
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *           format: "int32"
 *   parameters:
 *     idParam:
 *       in: path
 *       name: id
 *       description: Id of the item to fetch/update/delete
 *       required: true
 *       schema:
 *         type: integer
 *         format: "int32"
 *   securitySchemes:
 *     bearerAuth: # arbitrary name for the security scheme
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT # optional, arbitrary value for documentation purposes
 *   responses:
 *     400BadRequest:
 *       description: You provided invalid data
 *     401Unauthorized:
 *       description: You need to be authenticated to access this resource
 *     403Forbidden:
 *       description: You don't have access to this resource
 *     404NotFound:
 *       description: The requested resource could not be found
 */

export default (app: KoaApplication) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({
    prefix: '/api',
  });

  installAlbumRouter(router);
  installHealthRouter(router);
  installArtistRouter(router);
  installUserRouter(router);
  installSessionRouter(router);

  installPaymentRouter(router);
  installWebhookRouter(router);
  installUploadRouter(router);

  app.use(router.routes())
    .use(router.allowedMethods());
};