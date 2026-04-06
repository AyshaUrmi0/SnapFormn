# Snapform

A Tally.so-inspired form builder platform built with a modern TypeScript stack.

## Tech Stack

- **Monorepo**: npm workspaces
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, Zod, JWT
- **Frontend**: Next.js (App Router), React, TanStack Query, Tailwind CSS, shadcn/ui
- **Shared**: Common types, schemas, utilities, RBAC constants
- **Payments**: Stripe (scaffold)

## Project Structure

```
snapform/
├── apps/
│   ├── api/          # Express backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared types, schemas, utilities
└── prisma/           # Prisma schema & migrations
```

## Prerequisites

- Node.js >= 18
- PostgreSQL
- Redis
- npm

## Getting Started

### 1. Clone and install

```bash
cd snapform
npm install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your database, Redis, JWT, and OAuth settings.

### 3. Set up database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate -- --name init

# Seed roles & permissions
npm run db:seed
```

### 4. Start development

```bash
# Backend only
npm run dev

# Frontend only
npm run dev:web

# Both (parallel)
npm run dev:all
```

- API: `http://localhost:4000`
- Web: `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API dev server with hot reload |
| `npm run dev:web` | Start Next.js frontend dev server |
| `npm run dev:all` | Start both API and frontend |
| `npm run build` | Build shared package and API |
| `npm run build:web` | Build the frontend |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database (drops all data) |

## API Endpoints

### Health
- `GET /api/v1/health` - Health check

### Auth
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/request-otp` - Request OTP
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/complete-profile` - Complete profile after OAuth
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Get profile
- `PATCH /api/v1/users/me` - Update profile
- `DELETE /api/v1/users/me` - Delete account

### Workspaces
- `POST /api/v1/workspaces` - Create workspace
- `GET /api/v1/workspaces` - List workspaces
- `GET /api/v1/workspaces/:id` - Get workspace
- `PATCH /api/v1/workspaces/:id` - Update workspace
- `DELETE /api/v1/workspaces/:id` - Delete workspace
- `POST /api/v1/workspaces/:id/members` - Invite member
- `PATCH /api/v1/workspaces/:id/members/:memberId` - Update member role
- `DELETE /api/v1/workspaces/:id/members/:memberId` - Remove member

### Forms
- `GET /api/v1/forms/:slug` - Get published form (public)
- `POST /api/v1/forms/workspace/:workspaceId` - Create form
- `GET /api/v1/forms/workspace/:workspaceId` - List forms
- `GET /api/v1/forms/workspace/:workspaceId/:formId` - Get form
- `PATCH /api/v1/forms/workspace/:workspaceId/:formId` - Update form
- `PATCH /api/v1/forms/workspace/:workspaceId/:formId/status` - Update form status
- `PUT /api/v1/forms/workspace/:workspaceId/:formId/fields` - Update form fields
- `DELETE /api/v1/forms/workspace/:workspaceId/:formId` - Delete form

### Submissions
- `POST /api/v1/submissions/:slug` - Submit form (public)
- `GET /api/v1/submissions/workspace/:workspaceId/forms/:formId` - List submissions
- `GET /api/v1/submissions/workspace/:workspaceId/forms/:formId/:submissionId` - Get submission
- `DELETE /api/v1/submissions/workspace/:workspaceId/forms/:formId/:submissionId` - Delete submission

### Billing (stubs)
- `POST /api/v1/billing/checkout` - Create checkout session
- `GET /api/v1/billing/portal` - Create portal session
- `POST /api/v1/billing/webhook` - Stripe webhook

## API Documentation

Swagger UI is available at [https://snapformn.onrender.com/api/docs](https://snapformn.onrender.com/api/docs).

## Architecture

- **Controller** - Thin HTTP layer, calls service, uses response helpers
- **Service** - Business logic, throws `AppError` on failures
- **Repository** - Database access via Prisma
- **Schema** - Zod validation schemas per route
- **Middleware** - Auth (JWT), RBAC (workspace permissions), validation, error handling

## Shared Package (`@snapform/shared`)

Both `apps/api` and `apps/web` depend on `@snapform/shared` which provides:

- **Types**: `ApiResponse`, `PaginationMeta`, `JwtPayload`, `TokenPair`, `OtpPurpose`
- **Constants**: `PERMISSIONS`, `ROLE_PERMISSIONS`, `PAGINATION_DEFAULTS`
- **Errors**: `AppError` class with `ErrorCode` enum
- **Helpers**: `slugify`, `generateOtp`, `paginate`, `buildPaginationMeta`
- **Schemas**: Common Zod schemas for pagination, ID params, slugs

## Auth Flow

1. Register with email -> receives verification OTP
2. Verify OTP -> email confirmed
3. Login with email/password -> receives JWT access token + httpOnly refresh token cookie
4. Google OAuth login supported as alternative
5. Access protected routes with `Authorization: Bearer <token>`
6. Refresh token rotation with reuse detection

## RBAC

Workspace-scoped roles: **OWNER**, **ADMIN**, **EDITOR**, **VIEWER**

Each role has a predefined set of permissions (seeded via `npm run db:seed`).
