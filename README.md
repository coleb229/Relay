# Relay

An internal LMS management platform built on Next.js. Provides a fully-featured admin control panel for managing courses, students, enrollments, and analytics — with a REST API and built-in live documentation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, shadcn/ui (Base UI) |
| Auth | NextAuth v5 — Google OAuth, JWT sessions |
| Database | MongoDB Atlas via Prisma 5 ORM |
| Hosting | Vercel |

## Features

- **Google OAuth** — internal team sign-in, role-based access (ADMIN / INSTRUCTOR / STUDENT)
- **Course management** — create, edit, publish courses with modules and lessons
- **Student management** — enrollment tracking, progress monitoring
- **Analytics** — completion rates, top courses, platform stats
- **REST API** — full CRUD endpoints with session auth and role guards
- **Live API docs** — `/docs` page auto-updates whenever route definitions change
- **Theme system** — light / dark / system via `next-themes`, persistent preference

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
# MongoDB Atlas
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/Relay"

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
| `GET` | `/api/docs/spec` | Machine-readable endpoint registry (JSON) |

## Deployment

1. Connect this repo to [Vercel](https://vercel.com/new)
2. Add environment variables in Vercel dashboard
3. Set MongoDB Atlas Network Access to `0.0.0.0/0`
4. Add `https://your-domain.vercel.app/api/auth/callback/google` to Google OAuth redirect URIs

## Changelog

<!-- CHANGELOG_START -->
| Commit | Date | Description |
|--------|------|-------------|
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
