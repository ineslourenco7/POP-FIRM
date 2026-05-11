import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, virtualAccountsTable, challengesTable, ordersTable, equitySnapshotsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  GetAccountParams,
  GetAccountPerformanceParams,
  ListAccountsResponse,
  GetAccountResponse,
  GetAccountPerformanceResponse,
} from "@workspace/api-zod";
import { getCurrentPrice } from "../lib/market";

const router: IRouter = Router();

function computeFloatingPnl(orders: typeof ordersTable.$inferSelect[], currentPrices: Record<string, number>) {
  return orders
    .filter((o) => o.status === "open")
    .reduce((sum, o) => {
      const currentPrice = currentPrices[o.symbol] ?? o.openPrice;
      const pnl = o.side === "buy"
        ? (currentPrice - o.openPrice) * o.size
        : (o.openPrice - currentPrice) * o.size;
      return sum + pnl;
    }, 0);
}

async function enrichAccount(account: typeof virtualAccountsTable.$inferSelect) {
  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, account.challengeId));
  const openOrders = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.accountId, account.id), eq(ordersTable.status, "open")));

  const prices: Record<string, number> = {};
  for (const o of openOrders) {
    prices[o.symbol] = getCurrentPrice(o.symbol);
  }

  const floatingPnl = computeFloatingPnl(openOrders, prices);
  const equity = account.currentBalance + floatingPnl;

  return {
    id: account.id,
    userId: account.userId,
    challengeId: account.challengeId,
    challengeName: challenge?.name ?? null,
    status: account.status,
    initialBalance: account.initialBalance,
    currentBalance: account.currentBalance,
    equity,
    floatingPnl,
    totalPnl: account.totalPnl,
    dailyPnl: account.dailyPnl,
    maxDrawdownReached: account.maxDrawdownReached,
    profitTargetReached: account.profitTargetReached,
    tradingDays: account.tradingDays,
    profitTarget: challenge?.profitTarget ?? 8,
    maxDailyDrawdown: challenge?.maxDailyDrawdown ?? 5,
    maxTotalDrawdown: challenge?.maxTotalDrawdown ?? 10,
    minTradingDays: challenge?.minTradingDays ?? 5,
    createdAt: account.createdAt.toISOString(),
  };
}

router.get("/accounts", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const accounts = await db.select().from(virtualAccountsTable)
    .where(eq(virtualAccountsTable.userId, user.id));
  const enriched = await Promise.all(accounts.map(enrichAccount));
  res.json(ListAccountsResponse.parse(enriched));
});

router.get("/accounts/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAccountParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [account] = await db.select().from(virtualAccountsTable)
    .where(and(eq(virtualAccountsTable.id, params.data.id), eq(virtualAccountsTable.userId, user.id)));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const enriched = await enrichAccount(account);
  res.json(GetAccountResponse.parse(enriched));
});

router.get("/accounts/:id/performance", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAccountPerformanceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [account] = await db.select().from(virtualAccountsTable)
    .where(and(eq(virtualAccountsTable.id, params.data.id), eq(virtualAccountsTable.userId, user.id)));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const snapshots = await db.select().from(equitySnapshotsTable)
    .where(eq(equitySnapshotsTable.accountId, account.id))
    .orderBy(equitySnapshotsTable.snapshotAt);

  const equityCurve = snapshots.map((s) => ({
    time: s.snapshotAt.toISOString(),
    equity: s.equity,
  }));

  // Group by day for daily stats
  const dailyMap = new Map<string, { pnl: number; trades: number }>();
  for (const s of snapshots) {
    const date = s.snapshotAt.toISOString().split("T")[0];
    const existing = dailyMap.get(date) ?? { pnl: 0, trades: 0 };
    dailyMap.set(date, { pnl: existing.pnl + s.pnl, trades: existing.trades + s.trades });
  }

  const dailyStats = Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    pnl: stats.pnl,
    trades: stats.trades,
  }));

  if (equityCurve.length === 0) {
    equityCurve.push({ time: account.createdAt.toISOString(), equity: account.initialBalance });
    equityCurve.push({ time: new Date().toISOString(), equity: account.currentBalance });
  }

  res.json(GetAccountPerformanceResponse.parse({
    accountId: account.id,
    equityCurve,
    dailyStats,
  }));
});

export default router;
