import path from 'path';
import type { Express, RequestHandler } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env';

// Resolve paths relative to the api package root, not cwd
const apiRoot = path.resolve(__dirname, '../..');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Snapform API',
      version: '1.0.0',
      description: 'API documentation for Snapform - a form builder platform',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', nullable: true },
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            data: { type: 'object', nullable: true, example: null },
            message: { type: 'string' },
            errorCode: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis:
    env.NODE_ENV === 'production'
      ? [path.join(apiRoot, 'dist/modules/**/*.routes.js'), path.join(apiRoot, 'dist/routes/**/*.js')]
      : [path.join(apiRoot, 'src/modules/**/*.routes.ts'), path.join(apiRoot, 'src/routes/**/*.ts')],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerSetup(app: Express): void {
  app.use('/api/docs', ...(swaggerUi.serve as RequestHandler[]), swaggerUi.setup(swaggerSpec) as RequestHandler);
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
