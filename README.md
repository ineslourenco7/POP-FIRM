# POP-FIRM

Standalone prop firm platform using:

- React + Vite frontend
- Express API server
- PostgreSQL database
- Drizzle ORM
- pnpm workspace monorepo

## Repository Structure

```txt
artifacts/prop-firm     -> frontend
artifacts/api-server    -> backend API
lib/db                  -> database layer + schema
```

## Requirements

- Node.js 20+
- pnpm
- PostgreSQL database

## Install

```bash
pnpm install
```

## Environment Variables

Copy `.env.example` to `.env`.

Required:

```env
DATABASE_URL=postgresql://...
```

Optional:

```env
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
BASE_PATH=/
PORT=3000
NODE_ENV=production
```

## Development

Frontend:

```bash
PORT=20120 BASE_PATH=/ pnpm --filter @workspace/prop-firm run dev
```

Backend:

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

## Production Build

```bash
pnpm build
```

## Production Start

```bash
pnpm start
```

The backend serves the frontend build automatically in production.

## Database

Push schema with:

```bash
pnpm --filter @workspace/db run push
```

## Recommended Hosting

Frontend:
- Vercel
- Netlify

Backend/API:
- Railway
- Render
- Fly.io
- VPS

Database:
- Neon
- Supabase PostgreSQL
- Railway PostgreSQL

## Notes

This repository is now configured to run independently from Replit.
