import { Router, type IRouter } from "express";
import { eq, count, sum } from "drizzle-orm";
import { db, usersTable, virtualAccountsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  GetMeResponse,
  GetMyStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  res.json(GetMeResponse.parse({
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }));
});

router.get("/users/me/stats", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;

  const accounts = await db
    .select()
    .from(virtualAccountsTable)
    .where(eq(virtualAccountsTable.userId, user.id));

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const passedAccounts = accounts.filter((a) => a.status === "passed" || a.status === "funded").length;
  const totalPnl = accounts.reduce((sum, a) => sum + a.totalPnl, 0);
  const bestAccount = accounts.length > 0
    ? accounts.reduce((best, a) => a.totalPnl > best.totalPnl ? a : best, accounts[0])
    : null;

  res.json(GetMyStatsResponse.parse({
    totalAccounts,
    activeAccounts,
    totalPnl,
    bestAccount: bestAccount ? `Account #${bestAccount.id}` : null,
    passedAccounts,
  }));
});

export default router;
