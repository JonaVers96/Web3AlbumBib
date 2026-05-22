import type Router from '@koa/router';
import { koaSwagger } from 'koa2-swagger-ui';
import swaggerJSDoc from 'swagger-jsdoc';

export const buildOpenApiSpec = () => {
  const definition = {
    openapi: '3.0.3',
    info: {
      title: 'Music API',
      description: 'API voor users, artists en albums',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:9000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'VALIDATION_FAILED' },
            message: { type: 'string' },
            details: { type: 'object', nullable: true },
            stack: { type: 'string', nullable: true },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            count: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 25 },
          },
        },

        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
          required: ['id', 'firstName', 'lastName', 'email'],
        },
        Artist: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            genre: { type: 'string', nullable: true },
          },
          required: ['id', 'name'],
        },
        Album: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            dateReleased: { type: 'string', format: 'date-time' },
            trackCount: { type: 'integer', nullable: true },
            lengthSeconds: { type: 'integer', nullable: true },
            priceCents: { type: 'integer' },
            coverImageUrl: { type: 'string', nullable: true },
            artist: { $ref: '#/components/schemas/Artist' },
          },
          required: ['id', 'title', 'dateReleased','priceCents', 'artist'],
        },

        PaginatedUsers: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/UserPublic' } },
            count: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
          },
        },
        PaginatedArtists: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Artist' } },
            count: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
          },
        },
        PaginatedAlbums: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Album' } },
            count: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
          },
        },

        CreateUserBody: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
          required: ['firstName', 'lastName', 'email', 'password'],
        },
        UpdateUserBody: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            password: { type: 'string', minLength: 8 },
            email: { type: 'string', format: 'email' }, // alleen als jij het toestaat
          },
        },
        CreateArtistBody: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            genre: { type: 'string', nullable: true },
          },
          required: ['name'],
        },
        UpdateArtistBody: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            genre: { type: 'string', nullable: true },
          },
        },
        CreateAlbumBody: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            dateReleased: { type: 'string', format: 'date-time' },
            artistId: { type: 'integer' },
            trackCount: { type: 'integer' },
            lengthSeconds: { type: 'integer' },
            priceCents: { type: 'integer' },
            coverImageUrl: { type: 'string', nullable: true },
          },
          required: ['title', 'dateReleased', 'artistId'],
        },
        UpdateAlbumBody: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            dateReleased: { type: 'string', format: 'date-time' },
            artistId: { type: 'integer' },
            trackCount: { type: 'integer' },
            lengthSeconds: { type: 'integer' },
            priceCents: { type: 'integer' },
            coverImageUrl: { type: 'string', nullable: true },
          },
        },
      },
    },
  };

  const options = {
    definition,
    apis: ['src/rest/**/*.ts', 'src/createServer.ts'],
  };

  return swaggerJSDoc(options);
};

export const registerSwagger = (app: any, router: Router) => {
  const spec = buildOpenApiSpec();

  // JSON endpoint
  router.get('/openapi.json', (ctx) => {
    ctx.body = spec;
  });

  app.use(
    koaSwagger({
      routePrefix: '/api/docs',
      swaggerOptions: { spec: spec as Record<string, unknown> },
    }),
  );
};