# Relay

A modern LMS platform built to surpass LearnWorlds in both feature depth and UX quality. Provides a full admin control panel, course builder, visual page builder, e-commerce, certificates, and a developer API — all with a fluid, modern interface.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS v4, Base UI v1.2, CVA |
| Auth | NextAuth v5 — Google OAuth, JWT sessions |
| Database | PostgreSQL (Supabase) via Prisma 5 ORM |
| Payments | Stripe (checkout, webhooks, subscriptions) |
| Uploads | UploadThing |
| Hosting | Vercel |

## Features

### Core Platform
- **Google OAuth** — team sign-in, role-based access (ADMIN / INSTRUCTOR / STUDENT)
- **Course management** — create, edit, publish courses with modules and lessons (TEXT / VIDEO / QUIZ)
- **Course builder** — two-panel editor with drag-and-drop reordering, rich text (Tiptap), bulk publish, duplicate, image upload, file attachments
- **Quiz system** — multiple question types, grading, attempt tracking
- **Category management** — color-coded categories with ordering
- **Student management** — enrollment tracking, progress monitoring, user profiles, role management

### Website & Pages
- **Visual page builder** — drag-and-drop landing page editor with 14 section types (Hero, Features Grid, Rich Text, Image Block, Instructor Bio, Curriculum Preview, CTA, Testimonials, FAQ Accordion, Pricing Table, Stats Bar, Logo Wall, Video Embed, Divider/Spacer)
- **Course catalog** — public-facing course browser with filters, search, and landing pages
- **Website management** — pages, navigation, and site settings

### E-Commerce
- **Stripe checkout** — cart, checkout flow, payment processing with webhooks
- **Order management** — order history, payment status tracking
- **Coupons** — percentage and fixed-amount discount codes
- **Revenue analytics** — payment and revenue reporting

### Certificates
- **Certificate generation** — course completion certificates
- **Public verification** — shareable certificate URLs

### Navigation & UX
- **Collapsible sidebar** — smooth animated expand/collapse sections using Base UI Collapsible, with localStorage persistence and auto-expand on navigation
- **Analytics dashboard** — completion rates, top courses, platform stats with stat cards
- **Loading states** — skeleton loaders for all dashboard pages
- **Progress bar** — page transition progress indicator
- **Theme system** — light / dark / system via `next-themes`, persistent preference

### Developer
- **REST API** — full CRUD endpoints with session auth and role guards
- **Live API docs** — `/docs` page auto-generates from route definitions
- **API-first** — every feature has corresponding documented API endpoints

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.local.example below)
cp .env.local.example .env.local

# Generate Prisma client
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
# PostgreSQL (Supabase)
DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/postgres"

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# NextAuth v5
AUTH_SECRET="<generate with: npx auth secret>"
AUTH_URL="https://your-domain.vercel.app"  # omit in development
```

## API Reference

All endpoints live under `/api` and require an active session.
The full interactive reference is available at `/docs` when signed in.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/courses` | List courses (filter by status, paginated) |
| `POST` | `/api/courses` | Create a course *(admin/instructor)* |
| `GET` | `/api/courses/{id}` | Get course with modules + lessons |
| `PATCH` | `/api/courses/{id}` | Update course fields *(admin/instructor)* |
| `DELETE` | `/api/courses/{id}` | Delete course *(admin only)* |
| `GET` | `/api/students` | List students (search, paginated) |
| `GET` | `/api/enrollments` | List enrollments (filter by course/user/status) |
| `POST` | `/api/enrollments` | Enroll a user in a course *(admin/instructor)* |
| `GET` | `/api/analytics` | Platform-wide aggregate statistics |
| `GET/POST` | `/api/cart` | Cart management |
| `POST` | `/api/checkout` | Stripe checkout session creation |
| `GET` | `/api/orders` | Order history (paginated) |
| `GET/POST` | `/api/coupons` | Coupon management *(admin)* |
| `GET/POST` | `/api/certificates` | Certificate generation and listing |
| `GET/POST` | `/api/pages` | Page builder pages CRUD |
| `GET/PATCH` | `/api/site` | Site settings |
| `GET` | `/api/revenue` | Revenue analytics |
| `POST` | `/api/webhooks/stripe` | Stripe webhook handler |
| `GET` | `/api/docs/spec` | Machine-readable endpoint registry (JSON) |

## Deployment

1. Connect this repo to [Vercel](https://vercel.com/new)
2. Add environment variables in Vercel dashboard
3. Configure Supabase project and add `DATABASE_URL`
4. Add `https://your-domain.vercel.app/api/auth/callback/google` to Google OAuth redirect URIs
5. Add Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)

## Changelog

<!-- CHANGELOG_START -->
| Commit | Date | Description |
|--------|------|-------------|
| | 2026-03-29 | feat: collapsible sidebar navigation with smooth animations and state persistence |
| `3efacfd` | 2026-03-28 | feat: visual page builder, course catalog, categories, enrollments, and Base UI button fix |
| `50369db` | 2026-03-11 | feat: course builder phase 3 — duplicate, bulk publish, image upload, attachments |
| `53cfcbe` | 2026-03-11 | feat: admin user profile editing and role management |
| `8d0d1d1` | 2026-03-11 | feat: quiz system with grading and attempt tracking |
| `6635463` | 2026-03-11 | fix: suppress dnd-kit aria-describedby hydration mismatch |
| `cfdcf42` | 2026-03-11 | fix: resolve Tiptap hydration mismatch with mounted guard |
| `de98994` | 2026-03-11 | fix: suppress Tiptap SSR hydration mismatch warning |
| `ef7e981` | 2026-03-11 | feat: phase 2 — drag-and-drop reordering + rich text editor |
| `bac1f1c` | 2026-03-11 | feat: redirect after saving course settings |
| `715906b` | 2026-03-11 | fix: resolve Base UI nativeButton warnings and fix Back navigation |
| `445cf21` | 2026-03-11 | feat: add Create Course button and dialog to courses page |
| `c87559b` | 2026-03-11 | feat: course builder — two-panel editor with module/lesson CRUD |
| `0bb1678` | 2026-03-11 | feat: automated README changelog via GitHub Actions |
| `1b5dd6d` | 2026-03-11 | feat: automated API documentation system with REST endpoints |
| `175bb30` | 2026-03-11 | fix: add Vercel Linux binary target for Prisma |
| `01eb551` | 2026-03-11 | feat: full LMS platform with auth, UI, and theme system |
| `b20465b` | 2026-03-10 | feat: initial commit |
| `65f9952` | 2026-03-10 | Initial commit from Create Next App |
| `aabf6b1` | 2026-03-10 | Initial commit |
<!-- CHANGELOG_END -->
