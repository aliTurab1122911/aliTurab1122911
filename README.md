# CSV Team Board (Monolithic Next.js)

A lightweight, Jira-inspired team task board for small teams.

## Features
- Credentials login/logout with secure cookie session
- Dashboard (my tasks, due today, overdue, recently updated)
- Project management
- Kanban board (Backlog, To Do, In Progress, Review, Done)
- Task create/edit/assign/move/delete + activity log
- Month calendar view with filters
- Profile update + password change
- Server-side CSV persistence with queued atomic rewrites

## Stack
- Next.js App Router + TypeScript
- Node fs + Papa Parse for CSV storage
- Node.js crypto scrypt for password hashing
- date-fns for date handling

## Quick start
1. Copy `.env.example` to `.env` and set a strong `SESSION_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed CSV files:
   ```bash
   npm run seed
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

Seed login:
- username: `admin`
- password: `admin12345`

## Deployment notes
Because this app writes to local CSV files, deploy it to a host with persistent filesystem.
Using Vercel for read-only previews is fine, but write-heavy production should run on VPS/Node host.

## File layout
- `app/` pages + API routes
- `lib/` auth, CSV, services, permissions
- `components/` UI building blocks
- `data/` CSV files
- `scripts/seed.ts` seed script
