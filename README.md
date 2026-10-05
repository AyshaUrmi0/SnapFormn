# Snapform

A modern, Notion/Tally-style form builder platform built with a full-stack TypeScript architecture. Create dynamic, interactive forms with a block-based rich text editor, real-time preview, conditional logic, formula calculations, signed media uploads, and Stripe monetization.

[Live Web Demo](https://snap-formn-web.vercel.app/) · [API Documentation](https://snapformn.onrender.com/api/docs)

---

## Highlights

- **Block-Based Form Editor**: Built on TipTap with custom form-node blocks, slash commands (`/`), drag-and-drop reordering, keyboard navigation, and live preview.
- **36 Rich Field Types**: Questions (Text, Number, Date, Matrix, Ranking, Signature, File Upload), Layout (Headings, Dividers, Page Breaks), Media (Image, Video, Audio, Embed), and Advanced blocks.
- **Logic & Calculation Engine**: Tally-style `@mention` answer piping, conditional show/hide branching, and client-side formula evaluation for dynamic forms.
- **Respondent Runtime**: Public form pages (`/f/:slug`), password protection, scheduling limits (start/end dates + response caps), and seamless iframe embedding.
- **Direct-to-Cloudinary Uploads**: Secure signed direct uploads for respondents and form creators—zero file payload overhead on the backend API server.
- **Multi-Tenant Workspaces & RBAC**: Team workspaces with Owner, Admin, Editor, and Viewer roles, invite management, and soft-delete trash restoration.
- **Subscription Billing**: Stripe Checkout and Customer Portal integration with multi-tier plan limits (Free, Pro, Business) enforced across workspaces, forms, and monthly submissions.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TipTap, Tailwind CSS v4, shadcn/ui, TanStack Query |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon), Redis (Upstash) |
| **Security & Auth** | JWT (HttpOnly refresh cookies + access tokens), Google OAuth, OTP verification, RBAC |
| **Integrations** | Stripe (Checkout, Customer Portal, Webhooks), Cloudinary (Signed Direct Uploads), Resend |
| **Monorepo** | npm workspaces (`apps/web`, `apps/api`, `packages/shared`) |

---

## Project Structure

```
snapform/
├── apps/
│   ├── api/          # Express REST API, Prisma repositories, and Swagger specs
│   └── web/          # Next.js frontend, TipTap block editor, and dashboard
├── packages/
│   └── shared/       # Shared types, Zod schemas, constants, and error utilities
└── prisma/           # PostgreSQL schema and database seed scripts
```

---

## Quick Start

### 1. Prerequisites
- **Node.js** >= 18
- **PostgreSQL** & **Redis** instance

### 2. Installation
```bash
git clone https://github.com/AyshaUrmi0/SnapFormn.git
cd SnapFormn
npm install
```

### 3. Environment Setup
Copy the environment template in `apps/api` and configure your credentials:
```bash
cp apps/api/.env.example apps/api/.env
```
*(Required: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Optional: Stripe, Google OAuth, Cloudinary keys).*

For the frontend, configure `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 4. Database Initialization
```bash
npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Apply migrations
npm run db:seed       # Seed system roles & permissions
```

### 5. Run Locally
```bash
npm run dev:all       # Runs both Web (port 3000) and API (port 4000)
```

---

## API & Documentation

The backend exposes a modular REST API with centralized error handling, Zod validation, and rate limiting:

- **Auth**: Email/password, Google OAuth, 6-digit OTP verification, token refresh rotation.
- **Workspaces & Members**: Team collaboration with role-based permission enforcement.
- **Forms & Fields**: Form builder CRUD, block layout upserts, duplicate, status lifecycle, and trash recovery.
- **Submissions & Analytics**: Public response ingestion, completion metrics, timeline charts, and IP geo-detection.
- **Billing**: Stripe sessions, webhooks, and subscription tier synchronization.
- **Uploads**: Signed preset generation for direct client-to-Cloudinary media pipelines.

Interactive OpenAPI documentation is generated via `swagger-jsdoc`:
- **Swagger UI**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs) (or production [https://snapformn.onrender.com/api/docs](https://snapformn.onrender.com/api/docs))
- **OpenAPI Schema**: `GET /api/docs.json`

---

## Plan Limits & Enforcement

| Feature | Free | Pro | Business |
| :--- | :---: | :---: | :---: |
| **Workspaces per User** | 1 | Unlimited | Unlimited |
| **Forms per Workspace** | 3 | Unlimited | Unlimited |
| **Submissions / Month** | 100 | 10,000 | Unlimited |
| **Members per Workspace** | 2 | Unlimited | Unlimited |

*Limits are enforced server-side at the route layer and reflected client-side via `GET /api/v1/workspaces/:id/usage`.*

---

## Deployment

- **Backend (API)**: Deployed on [Render](https://render.com) (`npm run build:render`)
- **Frontend (Web)**: Deployed on [Vercel](https://vercel.com) (`npm run build:vercel`)
- **Database**: PostgreSQL on [Neon](https://neon.tech)
- **Cache**: Redis on [Upstash](https://upstash.com)

---

## License

This project is licensed under the MIT License.
