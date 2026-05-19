import config from 'config';
import crypto from 'node:crypto';
import { createMollieClient } from '@mollie/api-client';
import Role from '../core/roles';
import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { PaymentItem, PaymentStatus } from '../types/payment';
import handleDBError from './_handleDBError';

const MOLLIE_API_KEY = config.get<string>('mollie.apiKey');
const PUBLIC_BASE_URL = config.get<string>('urls.publicBaseUrl');
const FRONTEND_BASE_URL = config.get<string>('urls.frontendBaseUrl');

const getMollieClient = () => {
  if (!MOLLIE_API_KEY) {
    return null;
  }
  return createMollieClient({ apiKey: MOLLIE_API_KEY });
};

const formatEur = (amountCents: number) => {
  const euros = Math.floor(amountCents / 100);
  const cents = Math.abs(amountCents % 100);
  return `${euros}.${String(cents).padStart(2, '0')}`;
};

const mapMollieStatus = (status: string): PaymentStatus => {
  switch (status) {
    case 'open': return 'open';
    case 'paid': return 'paid';
    case 'failed': return 'failed';
    case 'canceled': return 'canceled';
    case 'expired': return 'expired';
    default: return 'open';
  }
};

export const createCheckout = async (userId: number, albumIds: number[]) => {
  if (!Array.isArray(albumIds) || albumIds.length === 0) {
    throw ServiceError.validationFailed('You must provide at least one album id');
  }

  // Remove duplicates
  const uniqueIds = Array.from(new Set(albumIds.map((id) => Number(id)))).filter((id) => Number.isFinite(id));
  if (uniqueIds.length === 0) {
    throw ServiceError.validationFailed('Invalid album ids');
  }

  const albums = await prisma.album.findMany({
    where: { id: { in: uniqueIds } },
    include: { artist: { select: { name: true } } },
  });

  if (albums.length !== uniqueIds.length) {
    throw ServiceError.validationFailed('One or more albums do not exist');
  }

  const items: PaymentItem[] = albums.map((a) => ({
    albumId: a.id,
    title: a.title,
    artistName: a.artist.name,
    priceCents: a.priceCents,
    coverImageUrl: a.coverImageUrl,
  }));

  const amountCents = items.reduce((sum, it) => sum + it.priceCents, 0);

  const reference = crypto.randomUUID().replace(/-/g, '').slice(0, 32);

  // Create payment in DB first
  const payment = await prisma.payment.create({
    data: {
      reference,
      userId,
      status: 'created',
      amountCents,
      items: items as any,
    },
  });

  const mollieClient = getMollieClient();
  if (!mollieClient) {
    // Dev fallback (no Mollie key): instantly mark as paid and grant albums.
    const fakeCheckoutUrl = `${FRONTEND_BASE_URL}/payment/return?reference=${reference}`;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        checkoutUrl: fakeCheckoutUrl,
      },
    });

    await grantAlbumsToUser(userId, items);

    return { reference, checkoutUrl: fakeCheckoutUrl };
  }

  try {
    const molliePayment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: formatEur(amountCents),
      },
      description: `Webify checkout (${reference})`,
      redirectUrl: `${FRONTEND_BASE_URL}/payment/return?reference=${reference}`,
      webhookUrl: `${PUBLIC_BASE_URL}/api/webhooks/mollie`,
      metadata: { reference, userId },
    } as any);

    const checkoutUrl = (molliePayment as any)?._links?.checkout?.href ?? null;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        molliePaymentId: (molliePayment as any).id ?? null,
        status: mapMollieStatus(String((molliePayment as any).status ?? 'open')),
        checkoutUrl,
      },
    });

    if (!checkoutUrl) {
      throw ServiceError.internalServerError('Mollie did not return a checkout URL');
    }

    return { reference, checkoutUrl };
  } catch (error) {
    // If Mollie fails, remove DB payment to avoid dangling records
    await prisma.payment.delete({ where: { id: payment.id } }).catch(() => undefined);
    throw handleDBError(error);
  }
};

export const getByReference = async (reference: string, requesterUserId: number, roles: string[]) => {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) {
    throw ServiceError.notFound('Payment not found');
  }

  const isAdmin = roles.includes(Role.ADMIN);
  if (!isAdmin && payment.userId !== requesterUserId) {
    throw ServiceError.forbidden('You do not have access to this payment');
  }

  return {
    id: payment.id,
    reference: payment.reference,
    status: payment.status as any,
    amountCents: payment.amountCents,
    checkoutUrl: payment.checkoutUrl,
    items: payment.items as any,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
};

const grantAlbumsToUser = async (userId: number, items: PaymentItem[]) => {
  if (items.length === 0) return;
  await prisma.userAlbum.createMany({
    data: items.map((it) => ({ userId, albumId: it.albumId })),
    skipDuplicates: true,
  });
};

export const syncFromMollie = async (molliePaymentId: string) => {
  const payment = await prisma.payment.findFirst({ where: { molliePaymentId } });
  if (!payment) {
    throw ServiceError.notFound('Payment not found');
  }

  // Dev fallback: treat as paid if no Mollie client
  const mollieClient = getMollieClient();
  if (!mollieClient) {
    if (payment.status !== 'paid') {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'paid' } });
      await grantAlbumsToUser(payment.userId, payment.items as any);
    }
    return;
  }

  const molliePayment = await mollieClient.payments.get(molliePaymentId as any);
  const newStatus = mapMollieStatus(String((molliePayment as any).status));

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: newStatus },
  });

  if (updated.status === 'paid') {
    await grantAlbumsToUser(updated.userId, updated.items as any);
  }
};

export const syncByReference = async (reference: string) => {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) {
    throw ServiceError.notFound('Payment not found');
  }

  if (!payment.molliePaymentId) {
    return;
  }

  await syncFromMollie(payment.molliePaymentId);
};

