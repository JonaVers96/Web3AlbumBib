import Router from '@koa/router';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';
import * as paymentService from '../service/payment';
import type {
  AlbumAppContext,
  AlbumAppState,
  KoaContext,
  KoaRouter,
} from '../types/koa';
import type {
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  GetPaymentResponse,
} from '../types/payment';

const createCheckout = async (
  ctx: KoaContext<CreateCheckoutResponse, void, CreateCheckoutRequest>,
) => {
  const { albumIds } = ctx.request.body;
  ctx.body = await paymentService.createCheckout(
    ctx.state.session!.userId,
    albumIds,
  );
  ctx.status = 201;
};
createCheckout.validationScheme = {
  body: {
    albumIds: Joi.array()
      .items(Joi.number().integer().positive())
      .min(1)
      .required(),
  },
};

const getPaymentByReference = async (
  ctx: KoaContext<GetPaymentResponse, { reference: string }>,
) => {
  ctx.body = (await paymentService.getByReference(
    ctx.params.reference,
    ctx.state.session!.userId,
    ctx.state.session!.roles,
  )) as any;
};
getPaymentByReference.validationScheme = {
  params: { reference: Joi.string().min(10).max(64).required() },
};

const syncPaymentByReference = async (
  ctx: KoaContext<GetPaymentResponse, { reference: string }>,
) => {
  await paymentService.syncByReference(ctx.params.reference);
  ctx.body = (await paymentService.getByReference(
    ctx.params.reference,
    ctx.state.session!.userId,
    ctx.state.session!.roles,
  )) as any;
};
syncPaymentByReference.validationScheme =
  getPaymentByReference.validationScheme;

export default (parent: KoaRouter) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({
    prefix: '/payments',
  });

  router.post(
    '/checkout',
    requireAuthentication,
    validate(createCheckout.validationScheme),
    createCheckout,
  );
  router.get(
    '/:reference',
    requireAuthentication,
    validate(getPaymentByReference.validationScheme),
    getPaymentByReference,
  );
  router.get(
    '/:reference/sync',
    requireAuthentication,
    validate(syncPaymentByReference.validationScheme),
    syncPaymentByReference,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
