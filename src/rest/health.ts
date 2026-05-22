import Router from '@koa/router';
import * as healthService from '../service/health';
import type { AlbumAppContext, AlbumAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type { PingResponse, VersionResponse } from '../types/health';
import validate from '../core/validation';
import config from 'config';

const withCommonHeaders = (ctx: KoaContext) => {
  try {
    const v = healthService.getVersion?.();
    if (v?.version) ctx.set('X-API-Version', String(v.version));
  } catch {
    // ignore
  }
  ctx.set('Cache-Control', 'no-store, max-age=0');
};

const rejectUnknownQuery = (ctx: KoaContext) => {
  if (Object.keys(ctx.query ?? {}).length > 0) {
    ctx.status = 400;
    ctx.body = { code: 'VALIDATION_FAILED', details: { query: ctx.query } };
    return true;
  }
  return false;
};

/**
 * @openapi
 * tags:
 *   - name: Health
 *     description: Health check endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     PingResponse:
 *       type: object
 *       required: [pong]
 *       properties:
 *         pong:
 *           type: boolean
 *     VersionResponse:
 *       type: object
 *       required: [env, version, name]
 *       properties:
 *         env:
 *           type: string
 *         version:
 *           type: string
 *         name:
 *           type: string
 *     StatusResponse:
 *       type: object
 *       required: [status, timestamp, uptimeSec, responseTimeMs]
 *       properties:
 *         status:
 *           type: string
 *           enum: [ok, degraded, error]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptimeSec:
 *           type: integer
 *         responseTimeMs:
 *           type: number
 *         version:
 *           $ref: '#/components/schemas/VersionResponse'
 */

/**
 * @openapi
 * /api/health/ping:
 *   get:
 *     summary: Ping the server (liveness)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server pongs back
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PingResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
const ping = async (ctx: KoaContext<PingResponse>) => {
  if (rejectUnknownQuery(ctx)) return;
  const start = performance.now();
  try {
    ctx.status = 200;
    ctx.body = healthService.ping();
  } finally {
    withCommonHeaders(ctx);
    ctx.set('X-Response-Time', (performance.now() - start).toFixed(1) + 'ms');
  }
};
ping.validationScheme = null;

/**
 * @openapi
 * /api/health/version:
 *   get:
 *     summary: Get the server's version information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: The server's running version information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */

const getVersion = async (ctx: KoaContext<VersionResponse>) => {
  if (rejectUnknownQuery(ctx)) return;
  const start = performance.now();
  try {
    const v = healthService.getVersion();

    const envFromConfig = ((): string => {
      try {
        return config.get<string>('env');
      } catch {
        const nodeEnv = process.env.NODE_ENV ?? 'development';
        return nodeEnv === 'test' ? 'testing' : nodeEnv;
      }
    })();

    ctx.status = 200;
    ctx.body = {
      env: envFromConfig,
      version: v.version,
      name: v.name,
    };
  } finally {
    withCommonHeaders(ctx);
    ctx.set('X-Response-Time', (performance.now() - start).toFixed(1) + 'ms');
  }
};
getVersion.validationScheme = null;

/**
 * @openapi
 * /api/health/status:
 *   get:
 *     summary: Combined liveness/readiness-lite (no DB call)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Basic server status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 */
const getStatus = async (ctx: KoaContext) => {
  const start = performance.now();
  try {
    const version = (() => {
      try {
        return healthService.getVersion?.();
      } catch {
        return undefined;
      }
    })();

    ctx.status = 200;
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      responseTimeMs: Number((performance.now() - start).toFixed(1)),
      ...(version ? { version } : {}),
    };
  } finally {
    withCommonHeaders(ctx);
    ctx.set('X-Response-Time', (performance.now() - start).toFixed(1) + 'ms');
  }
};
getStatus.validationScheme = null;

export default function installHealthRoutes(parent: KoaRouter) {
  const router = new Router<AlbumAppState, AlbumAppContext>({ prefix: '/health' });

  const maybeValidate = (schema: unknown) => (schema ? validate(schema) : async (_ctx: any, next: any) => next());

  router.get('/ping', maybeValidate(ping.validationScheme), ping);
  router.get('/version', maybeValidate(getVersion.validationScheme), getVersion);
  router.get('/status', maybeValidate(getStatus.validationScheme), getStatus);

  parent.use(router.routes()).use(router.allowedMethods());
}
