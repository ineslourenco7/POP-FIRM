import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, virtualAccountsTable, usersTable } from "@workspace/db";
import { GetLeaderboardResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const accounts = await db
    .select({
      accountId: virtualAccountsTable.id,
      userId: virtualAccountsTable.userId,
      initialBalance: virtualAccountsTable.initialBalance,
      totalPnl: virtualAccountsTable.totalPnl,
      tradingDays: virtualAccountsTable.tradingDays,
      status: virtualAccountsTable.status,
      displayName: usersTable.displayName,
      email: usersTable.email,
    })
    .from(virtualAccountsTable)
    .leftJoin(usersTable, eq(virtualAccountsTable.userId, usersTable.id))
    .orderBy(desc(virtualAccountsTable.totalPnl))
    .limit(50);

  const entries = accounts.map((a, i) => ({
    rank: i + 1,
    displayName: a.displayName ?? a.email?.split("@")[0] ?? "Trader",
    accountSize: a.initialBalance,
    totalPnl: a.totalPnl,
    pnlPercent: a.initialBalance > 0 ? (a.totalPnl / a.initialBalance) * 100 : 0,
    tradingDays: a.tradingDays,
    status: a.status,
  }));

  res.json(GetLeaderboardResponse.parse(entries));
});

export default router;
