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
      description:
        'REST API for Snapform — a form builder platform with workspaces, ' +
        'team collaboration, plan-based limits, Stripe billing, Cloudinary ' +
        'media uploads, and submission analytics. All authenticated endpoints ' +
        'require a Bearer JWT in the `Authorization` header.',
    },
    servers: [
      { url: '/api/v1', description: 'Current server (relative)' },
    ],
    tags: [
      { name: 'Auth', description: 'Registration, login, OTP, password reset' },
      { name: 'Users', description: 'Current user profile' },
      { name: 'Workspaces', description: 'Workspaces, members, and usage' },
      { name: 'Forms', description: 'Form CRUD, fields, status, trash, restore' },
      { name: 'Submissions', description: 'Public form submission and owner-side analytics' },
      { name: 'Uploads', description: 'Signed Cloudinary upload presets' },
      { name: 'Billing', description: 'Stripe Checkout, Customer Portal, and webhooks' },
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
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object', nullable: true },
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            data: { type: 'object', nullable: true, example: null },
            message: { type: 'string', example: 'Resource not found' },
            errorCode: {
              type: 'string',
              example: 'NOT_FOUND',
              description: 'Stable machine-readable code (e.g. NOT_FOUND, UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, PLAN_LIMIT_EXCEEDED)',
            },
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
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            plan: { type: 'string', enum: ['FREE', 'PRO', 'BUSINESS'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkspaceUsage: {
          type: 'object',
          properties: {
            plan: { type: 'string', enum: ['FREE', 'PRO', 'BUSINESS'] },
            forms: {
              type: 'object',
              properties: {
                current: { type: 'integer' },
                limit: { type: 'integer', nullable: true, description: 'null = unlimited' },
              },
            },
            submissionsThisMonth: {
              type: 'object',
              properties: {
                current: { type: 'integer' },
                limit: { type: 'integer', nullable: true },
              },
            },
            members: {
              type: 'object',
              properties: {
                current: { type: 'integer' },
                limit: { type: 'integer', nullable: true },
              },
            },
          },
        },
        FieldType: {
          type: 'string',
          enum: [
            'SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'NUMBER', 'PHONE', 'URL',
            'DATE', 'TIME', 'DROPDOWN', 'MULTI_SELECT', 'CHECKBOX', 'RADIO',
            'MATRIX', 'RANKING', 'FILE_UPLOAD', 'RATING', 'SCALE', 'SIGNATURE',
            'STATEMENT', 'PAGE_BREAK', 'THANK_YOU_PAGE',
            'HEADING_1', 'HEADING_2', 'HEADING_3',
            'DIVIDER', 'TITLE', 'LABEL',
            'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
            'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
          ],
        },
        FormField: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { $ref: '#/components/schemas/FieldType' },
            label: { type: 'string' },
            description: { type: 'string', nullable: true },
            placeholder: { type: 'string', nullable: true },
            required: { type: 'boolean' },
            order: { type: 'integer' },
            options: { nullable: true },
            validations: { nullable: true },
            conditionals: { nullable: true },
          },
        },
        Form: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            workspaceId: { type: 'string' },
            title: { type: 'string' },
            slug: {
              type: 'string',
              description: 'URL-safe identifier auto-generated from the title. Used in /f/{slug}.',
            },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED'] },
            settings: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            fields: {
              type: 'array',
              items: { $ref: '#/components/schemas/FormField' },
            },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            formId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fieldId: { type: 'string' },
                  value: {},
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
