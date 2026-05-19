import Router from '@koa/router';
import Joi from 'joi';
import validate from '../core/validation';
import * as paymentService from '../service/payment';
import type { AlbumAppContext, AlbumAppState, KoaContext, KoaRouter } from '../types/koa';

const mollieWebhook = async (ctx: KoaContext<void>) => {
  const molliePaymentId = (ctx.request.body as any).id;
  await paymentService.syncFromMollie(molliePaymentId);
  ctx.status = 204;
};
mollieWebhook.validationScheme = {
  body: {
    id: Joi.string().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({ prefix: '/webhooks' });

  router.post('/mollie', validate(mollieWebhook.validationScheme), mollieWebhook);

  parent.use(router.routes()).use(router.allowedMethods());
};
