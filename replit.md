# QuantFund — Prop Trading Firm Platform

A simulated prop trading firm platform where traders buy challenges and receive virtual accounts to trade within the platform. 100% web-based, no MT5 or broker required.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/prop-firm run dev` — run the frontend (port 20120)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth keys (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui
- Auth: Clerk (Replit-managed)
- API: Express 5 + OpenAPI contract-first
- DB: PostgreSQL + Drizzle ORM
- Charts: TradingView Lightweight Charts
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema (users, challenges, virtual_accounts, orders, payments, payout_requests, equity_snapshots)
- `artifacts/api-server/src/routes/` — Backend routes (users, challenges, accounts, orders, payments, payouts, leaderboard, market, admin)
- `artifacts/api-server/src/lib/market.ts` — Simulated market price generator
- `artifacts/api-server/src/middlewares/requireAuth.ts` — Clerk auth middleware
- `artifacts/prop-firm/src/` — React frontend

## Architecture decisions

- **Paper trading only** — All prices are simulated via `market.ts` with realistic volatility. No external broker or market data feed needed.
- **Contract-first API** — OpenAPI spec in `lib/api-spec/openapi.yaml` gates all frontend hooks via Orval codegen.
- **Manual payments** — Admin reviews and approves payment proofs manually, then the system auto-creates the virtual account.
- **Drawdown enforcement** — Automatic on order close: daily drawdown, total drawdown, profit target checks with status transitions (active → passed/failed).
- **Clerk proxy** — Auth proxied through `/api/__clerk` for cookie-based sessions; no token handling needed on the frontend.

## Product

- **Landing page** — Professional FTMO-style hero, challenge pricing plans, leaderboard preview
- **Authentication** — Email/password via Clerk with branded dark theme
- **User dashboard** — Account cards with equity, PnL, drawdown progress bars
- **Webtrader** — TradingView Lightweight Charts candlestick chart, order panel, live positions
- **Challenge purchase** — Plan cards → checkout → payment proof upload → admin approval → virtual account
- **Admin panel** — Approve/reject payments and payouts, view all users and platform stats
- **Leaderboard** — Global ranking of traders by PnL
- **Payout requests** — Funded traders can request withdrawals

## User preferences

- Dark blue/black design theme
- All trading is simulated (paper trading)
- Portuguese language in conversations

## Gotchas

- After OpenAPI spec changes, always run codegen before building routes or frontend
- Seed data: 5 challenge plans already seeded (10K, 25K, 50K, 100K, 200K)
- To make a user admin: update `role` column in `users` table to `'admin'`
- The Clerk "development keys" warning in console is normal and expected in dev mode

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
