# Snapform

A Tally.so-inspired form builder platform built with a modern TypeScript stack.

## Tech Stack

- **Monorepo**: npm workspaces
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon), Redis (Upstash), Zod, JWT
- **Frontend**: Next.js 16 (App Router), React, TanStack Query, Tailwind CSS v4, shadcn/ui v4 (base-ui), TipTap
- **Shared**: Common types, schemas, utilities, RBAC constants
- **Payments**: Stripe Checkout, Customer Portal, Webhooks

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

## Features

### Form Builder
- TipTap-based rich text editor with custom form block nodes
- Slash command (`/`) to insert 16 field types across 4 categories
- Inline block configuration (label, description, placeholder, required, options)
- Drag-and-drop field reordering
- Live form preview mode
- Auto-save dirty state tracking with unsaved changes warning

### Field Types
- **Text & Input**: Short Text, Long Text, Email, Number, Phone, URL, Date
- **Choice**: Dropdown, Multi-Select, Checkbox, Radio
- **Special**: File Upload, Rating, Scale
- **Layout**: Statement, Page Break

### Templates
- 10 pre-built form templates across 5 categories (Feedback, Registration, Survey, Business, Other)
- Template preview with all fields rendered
- One-click "Use this template" creates a form with all fields pre-populated
- Multiple forms can be created from the same template

### Public Forms
- Published forms accessible at `/f/:slug` (no auth required)
- Password-protected forms
- Client-side field validation (required, email format)
- Customizable success page (message, redirect URL, resubmit option)
- Embeddable via iframe

### Submissions & Analytics
- View submissions in a list with detail dialog
- Delete individual submissions
- Analytics dashboard: total/completed counts, completion rate, submission timeline, field response rates

### Workspace & Team Management
- Create multiple workspaces
- Invite members by email with role assignment
- Role-based access control: Owner, Admin, Editor, Viewer
- Workspace settings (name, slug, delete)

### Dashboard
- Tally.so-style sidebar with grouped navigation sections
- Command palette (Ctrl+K / Cmd+K) for quick search and navigation
- Search across forms, workspaces, and navigation actions
- Clean list-based home page with relative timestamps
- Dark/light theme toggle

### Trash & Soft Delete
- Deleted forms move to trash instead of permanent deletion
- Restore forms from trash
- Permanently delete individual forms or empty entire trash
- Soft-deleted forms excluded from all active queries

### User Settings
- Profile management (name, avatar)
- Password change
- Email change with OTP verification
- Account deletion

### Billing & Subscriptions
- Stripe Checkout integration with monthly and yearly pricing
- Three plans: Free, Pro ($29/mo), Business ($89/mo)
- Per-workspace subscriptions — each workspace has its own plan and billing
- Stripe Customer Portal for managing subscriptions, payment methods, and invoices
- Webhook-driven subscription state sync (checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_succeeded/failed)
- Tally-style upgrade page with monthly/yearly toggle and feature comparison

### Plan Limits & Enforcement
- Free plan limits: 1 workspace, 3 forms, 100 submissions/month, 2 members per workspace
- Pro plan: unlimited workspaces, unlimited forms, 10,000 submissions/month, unlimited members
- Business plan: unlimited everything
- Backend enforcement on form creation, submission, member invite, workspace creation
- `GET /workspaces/:id/usage` endpoint exposes current usage and limits
- Frontend usage dashboard with progress bars on each workspace card
- Proactive gating — buttons redirect to upgrade page when at limit (no failed requests)
- Reactive gating — `redirectOnPlanLimit` helper handles backend errors at every call site

### Workspace Dashboard
- All workspaces shown as cards with plan badge, usage stats, and quick actions
- Per-workspace metrics: forms, submissions this month, members
- Free plans show progress bars; paid plans show unlimited indicators
- Open / Upgrade / Billing buttons contextual to the workspace plan

### Help & Onboarding
- Get Started page with 5-step onboarding guide
- How-to Guides organized by category
- Help Center with FAQ accordion
- Public roadmap (Shipped / In Progress / Planned)
- What's New changelog
- Rewards (referral program)

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

Edit `apps/api/.env` with your database, Redis, JWT, OAuth, and Stripe settings:

```env
# Database & cache
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email (Resend)
RESEND_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_YEARLY=price_...

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:3000
```

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
| `npm run build:render` | Build for Render deployment (includes migrations) |
| `npm run build:vercel` | Build for Vercel deployment |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:migrate:prod` | Deploy Prisma migrations (production) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database (drops all data) |

## API Endpoints

### Health
- `GET /api/v1/health` - Health check

### Auth
- `POST /api/v1/auth/register` - Register with email/password
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/verify-otp` - Verify OTP code
- `POST /api/v1/auth/request-otp` - Request OTP (login, verification, password reset)
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/reset-password` - Reset password via token
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/request-email-change` - Request email change (sends OTP)
- `POST /api/v1/auth/verify-email-change` - Verify email change with OTP
- `POST /api/v1/auth/complete-profile` - Complete profile after OAuth signup
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and revoke refresh token

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update profile (name, avatar)
- `DELETE /api/v1/users/me` - Delete account

### Workspaces
- `POST /api/v1/workspaces` - Create workspace (subject to free plan limit)
- `GET /api/v1/workspaces` - List user's workspaces
- `GET /api/v1/workspaces/:id` - Get workspace details
- `GET /api/v1/workspaces/:id/usage` - Get current usage and limits (forms, submissions, members)
- `PATCH /api/v1/workspaces/:id` - Update workspace
- `DELETE /api/v1/workspaces/:id` - Delete workspace
- `POST /api/v1/workspaces/:id/members` - Invite member (subject to plan limit)
- `PATCH /api/v1/workspaces/:id/members/:memberId` - Update member role
- `DELETE /api/v1/workspaces/:id/members/:memberId` - Remove member

### Forms
- `GET /api/v1/forms/:slug` - Get published form by slug (public, no auth)
- `POST /api/v1/forms/workspace/:workspaceId` - Create form (subject to plan limit)
- `GET /api/v1/forms/workspace/:workspaceId` - List forms (excludes trashed)
- `GET /api/v1/forms/workspace/:workspaceId/:formId` - Get form with fields
- `PATCH /api/v1/forms/workspace/:workspaceId/:formId` - Update form (title, description, settings)
- `PATCH /api/v1/forms/workspace/:workspaceId/:formId/status` - Update form status (Draft/Published/Closed)
- `PUT /api/v1/forms/workspace/:workspaceId/:formId/fields` - Replace all form fields
- `POST /api/v1/forms/workspace/:workspaceId/:formId/duplicate` - Duplicate form with fields (subject to plan limit)
- `DELETE /api/v1/forms/workspace/:workspaceId/:formId` - Soft delete form (moves to trash)

### Trash
- `GET /api/v1/forms/workspace/:workspaceId/trash` - List trashed forms
- `POST /api/v1/forms/workspace/:workspaceId/:formId/restore` - Restore form from trash
- `DELETE /api/v1/forms/workspace/:workspaceId/:formId/permanent` - Permanently delete form
- `DELETE /api/v1/forms/workspace/:workspaceId/trash` - Empty trash (delete all trashed forms)

### Submissions
- `POST /api/v1/submissions/:slug` - Submit form response (public, no auth, subject to monthly limit)
- `GET /api/v1/submissions/workspace/:workspaceId/forms/:formId` - List submissions
- `GET /api/v1/submissions/workspace/:workspaceId/forms/:formId/analytics` - Get form analytics
- `GET /api/v1/submissions/workspace/:workspaceId/forms/:formId/:submissionId` - Get submission
- `DELETE /api/v1/submissions/workspace/:workspaceId/forms/:formId/:submissionId` - Delete submission

### Billing
- `POST /api/v1/billing/checkout` - Create Stripe checkout session (body: `{ workspaceId, plan: 'PRO' | 'BUSINESS', period: 'monthly' | 'yearly' }`)
- `GET /api/v1/billing/subscription?workspaceId=:id` - Get subscription details for a workspace
- `GET /api/v1/billing/portal?workspaceId=:id` - Create Stripe customer portal session
- `POST /api/v1/billing/webhook` - Stripe webhook handler (signature verified, handles checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_succeeded/failed)

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

1. Register with email or login via Google OAuth
2. Email login sends a 6-digit OTP verification code
3. Verify OTP to complete login/registration
4. Receives JWT access token + httpOnly refresh token cookie
5. Access protected routes with `Authorization: Bearer <token>`
6. Refresh token rotation with reuse detection
7. Password reset via email token

## RBAC

Workspace-scoped roles: **OWNER**, **ADMIN**, **EDITOR**, **VIEWER**

Each role has a predefined set of permissions (seeded via `npm run db:seed`).

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| form:create | Yes | Yes | Yes | No |
| form:edit | Yes | Yes | Yes | No |
| form:delete | Yes | Yes | Yes | No |
| form:publish | Yes | Yes | Yes | No |
| form:view | Yes | Yes | Yes | Yes |
| submission:view | Yes | Yes | Yes | Yes |
| submission:delete | Yes | Yes | No | No |
| submission:export | Yes | Yes | Yes | Yes |
| member:invite | Yes | Yes | No | No |
| member:manage_role | Yes | Yes | No | No |
| member:remove | Yes | Yes | No | No |
| workspace:manage | Yes | Yes | No | No |
| workspace:delete | Yes | No | No | No |
| billing:manage | Yes | Yes | No | No |

## Plan Limits

Each workspace has its own plan and limits. Limits are enforced server-side and surfaced to the client via `GET /workspaces/:id/usage`.

| Resource | Free | Pro | Business |
|----------|------|-----|----------|
| Workspaces per user | 1 | Unlimited | Unlimited |
| Forms per workspace | 3 | Unlimited | Unlimited |
| Submissions per month | 100 | 10,000 | Unlimited |
| Members per workspace | 2 | Unlimited | Unlimited |

A user is considered "free" if all their owned workspaces are on the FREE plan. Once any workspace upgrades, the user can create unlimited additional workspaces (each starting on FREE, individually upgradable).

## Deployment

- **Backend (API)**: Deployed on [Render](https://render.com) with `build:render` script
- **Frontend (Web)**: Deployed on [Vercel](https://vercel.com) with `build:vercel` script
- **Database**: PostgreSQL on [Neon](https://neon.tech)
- **Cache**: Redis on [Upstash](https://upstash.com)
