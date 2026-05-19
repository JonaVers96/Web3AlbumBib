import config from 'config';
import bodyParser from 'koa-bodyparser';
import koaCors from '@koa/cors';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import { koaSwagger } from 'koa2-swagger-ui';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from '../swagger.config';
import type { KoaApplication } from '../types/koa';
import { getLogger } from './logging';
import ServiceError from './serviceError';

const NODE_ENV = config.get<string>('env');
const CORS_ORIGINS = config.get<string[]>('cors.origins');
const CORS_MAX_AGE = config.get<number>('cors.maxAge');
const isDevelopment = NODE_ENV === 'development';

const allowCorsMiddleware = cors({
  origin: (requestContext) => {
    const requestOriginHeader = requestContext.request.header.origin;

    // Requests zonder Origin (bv. curl, Postman) mogen ook.
    if (!requestOriginHeader) {
      return '*';
    }

    // In development willen we alle localhost poorten toelaten.
    const isLocalhostOrigin =
      requestOriginHeader.startsWith('http://localhost:') ||
      requestOriginHeader.startsWith('http://127.0.0.1:');

    if (isLocalhostOrigin) {
      return requestOriginHeader;
    }

    // In productie kan je hier stricter zijn.
    return requestOriginHeader;
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

export default function installMiddlewares(app: KoaApplication) {
  app.use(allowCorsMiddleware);
  app.use(
    koaCors({
      origin: (ctx) => {
        const requestOrigin = ctx.request.header.origin;

        // Geen Origin header (bv. curl / swagger / server-to-server):
        // laat dit toe en stuur '*' terug.
        if (!requestOrigin) {
          return '*';
        }

        // Browser requests: enkel toestaan als de origin in de allowlist zit.
        if (CORS_ORIGINS.includes(requestOrigin)) {
          return requestOrigin;
        }

        // Onbekende origin: geef een geldige waarde terug zodat de CORS middleware niet crasht.
        return CORS_ORIGINS[0] || requestOrigin;
      },
      allowHeaders: ['Accept', 'Content-Type', 'Authorization'],
      maxAge: CORS_MAX_AGE,
    }),
  );

  app.use(async (ctx, next) => {
    getLogger().info(`⏩ ${ctx.method} ${ctx.url}`);

    const getStatusEmoji = () => {
      if (ctx.status >= 500) return '💀';
      if (ctx.status >= 400) return '❌';
      if (ctx.status >= 300) return '🔀';
      if (ctx.status >= 200) return '✅';
      return '🔄';
    };

    await next();

    getLogger().info(
      `${getStatusEmoji()} ${ctx.method} ${ctx.status} ${ctx.url}`,
    );
  });

  app.use(bodyParser());
  app.use(
    helmet({
      contentSecurityPolicy: !isDevelopment,
    }),
  );

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error: any) {
      getLogger().error('Error occured while handling a request', { error });

      let statusCode = error.status || 500;
      const errorBody = {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        // Do not expose the error message in production
        message:
          error.message || 'Unexpected error occurred. Please try again later.',
        details: error.details,
        stack: NODE_ENV !== 'production' ? error.stack : undefined,
      };

      if (error instanceof ServiceError) {
        errorBody.message = error.message;

        if (error.isNotFound) {
          statusCode = 404;
        }

        if (error.isValidationFailed) {
          statusCode = 400;
        }

        if (error.isUnauthorized) {
          statusCode = 401;
        }

        if (error.isForbidden) {
          statusCode = 403;
        }

        if (error.isConflict) {
          statusCode = 409;
        }
      }

      ctx.status = statusCode;
      ctx.body = errorBody;
    }
  });

  if (isDevelopment) {
    const spec = swaggerJsdoc(swaggerOptions) as Record<string, unknown>;

    app.use(
      koaSwagger({
        routePrefix: '/swagger',
        specPrefix: '/swagger.json',
        exposeSpec: true,
        swaggerOptions: { spec },
      }),
    );
  }

  app.use(async (ctx, next) => {
    await next();

    if (ctx.status === 404) {
      ctx.status = 404;
      ctx.body = {
        code: 'NOT_FOUND',
        message: `Unknown resource: ${ctx.url}`,
      };
    }
  });
}
