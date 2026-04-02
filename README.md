# Snapform

A Tally.so-inspired form builder platform built with a modern TypeScript stack.

## Tech Stack

- **Monorepo**: npm workspaces
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, Zod, JWT
- **Frontend** (planned): Next.js App Router, TanStack Query
- **Payments**: Stripe (scaffold)

## Project Structure

```
snapform/
├── apps/
│   ├── api/          # Express backend
│   └── web/          # Next.js frontend (placeholder)
├── packages/
│   ├── shared/       # Shared types, schemas, utilities
│   └── config/       # Shared ESLint, Prettier, TS configs
├── prisma/           # Prisma schema & migrations
└── docker-compose.yml
```

## Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for PostgreSQL and Redis)
- npm

## Getting Started

### 1. Clone and install

```bash
cd snapform
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your settings. The defaults work with the Docker setup.

### 4. Set up database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate -- --name init

# Seed roles & permissions
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

The API starts at `http://localhost:4000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API dev server with hot reload |
| `npm run build` | Build the API |
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

Swagger UI is available at `http://localhost:4000/api/docs` when the server is running.

## Architecture

- **Controller** - Thin HTTP layer, calls service, uses response helpers
- **Service** - Business logic, throws `AppError` on failures
- **Repository** - Database access via Prisma
- **Schema** - Zod validation schemas per route
- **Middleware** - Auth (JWT), RBAC (workspace permissions), validation, error handling

## Auth Flow

1. Register with email/password -> receives verification OTP
2. Verify OTP -> email confirmed
3. Login -> receives JWT access token + httpOnly refresh token cookie
4. Access protected routes with `Authorization: Bearer <token>`
5. Refresh token rotation with reuse detection

## RBAC

Workspace-scoped roles: **OWNER**, **ADMIN**, **EDITOR**, **VIEWER**

Each role has a predefined set of permissions (seeded via `npm run db:seed`).
