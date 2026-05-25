# Supabase setup for POP-FIRM

Use Supabase as the production PostgreSQL database.

## 1. Create the Supabase project

1. Open Supabase.
2. Create a new project.
3. Save the database password somewhere secure.
4. Wait until the database is ready.

## 2. Get the PostgreSQL connection string

In Supabase:

```txt
Project Settings -> Database -> Connection string
```

Use the URI connection string format.

It should look like this:

```txt
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

## 3. Configure environment variables

Set this in your deploy provider:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
BASE_PATH=/
```

Optional authentication variables:

```env
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Never commit `.env` or real secrets to GitHub.

## 4. Push the database schema

After installing dependencies:

```bash
pnpm install
pnpm --filter @workspace/db run push
```

This uses Drizzle and the `DATABASE_URL` variable.

## 5. Build and start the app

```bash
pnpm build
pnpm start
```

The backend serves the frontend build in production.

## 6. Migration notes

The database data itself is not stored in GitHub.

To move data from Replit PostgreSQL to Supabase:

1. Export the Replit PostgreSQL database with `pg_dump`.
2. Import into Supabase with `psql` or Supabase SQL tools.
3. Set `DATABASE_URL` to Supabase in the production hosting provider.
4. Run the app against Supabase.
5. Verify login, challenges, checkout, payments, payouts and admin pages.

## Recommended production stack

- Code: GitHub
- Database: Supabase PostgreSQL
- API/backend: Railway, Render, Fly.io or VPS
- Frontend: served by the backend or deployed separately to Vercel
