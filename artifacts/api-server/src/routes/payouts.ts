import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, payoutRequestsTable, virtualAccountsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListMyPayoutsResponse,
  RequestPayoutBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatPayout(p: typeof payoutRequestsTable.$inferSelect) {
  return {
    id: p.id,
    userId: p.userId,
    accountId: p.accountId,
    userEmail: null as string | null,
    amount: p.amount,
    walletAddress: p.walletAddress,
    status: p.status as "pending" | "approved" | "rejected",
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/payouts", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const payouts = await db.select().from(payoutRequestsTable)
    .where(eq(payoutRequestsTable.userId, user.id))
    .orderBy(payoutRequestsTable.createdAt);
  res.json(ListMyPayoutsResponse.parse(payouts.map(formatPayout)));
});

router.post("/payouts", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const body = RequestPayoutBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [account] = await db.select().from(virtualAccountsTable)
    .where(eq(virtualAccountsTable.id, body.data.accountId));

  if (!account || account.userId !== user.id) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  if (account.status !== "passed" && account.status !== "funded") {
    res.status(400).json({ error: "Account must have passed the challenge to request a payout" });
    return;
  }

  if (body.data.amount > account.totalPnl) {
    res.status(400).json({ error: "Payout amount exceeds available profit" });
    return;
  }

  const [payout] = await db.insert(payoutRequestsTable).values({
    userId: user.id,
    accountId: body.data.accountId,
    amount: body.data.amount,
    walletAddress: body.data.walletAddress,
    status: "pending",
  }).returning();

  res.status(201).json(formatPayout(payout));
});

export default router;
