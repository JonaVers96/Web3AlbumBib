export default {
  failOnErrors: true,
  apis: ['./src/rest/*.ts'],
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Album API with Swagger',
      version: '0.1.0',
      description:
        'This is a simple CRUD API application made with Koa and documented with Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    servers: [{ url: 'http://localhost:9000/' }],
  },
};
