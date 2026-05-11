import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  paymentsTable,
  payoutRequestsTable,
  virtualAccountsTable,
  challengesTable,
} from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAuth";
import {
  AdminListUsersResponse,
  AdminListPaymentsResponse,
  AdminApprovePaymentParams,
  AdminRejectPaymentParams,
  AdminRejectPaymentBody,
  AdminApprovePaymentResponse,
  AdminRejectPaymentResponse,
  AdminListPayoutsResponse,
  AdminApprovePayoutParams,
  AdminRejectPayoutParams,
  AdminRejectPayoutBody,
  AdminApprovePayoutResponse,
  AdminRejectPayoutResponse,
  AdminCreateChallengeBody,
  AdminGetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  const usersWithStats = await Promise.all(users.map(async (u) => {
    const accounts = await db.select().from(virtualAccountsTable).where(eq(virtualAccountsTable.userId, u.id));
    const totalPnl = accounts.reduce((s, a) => s + a.totalPnl, 0);
    return {
      id: u.id,
      clerkId: u.clerkId,
      email: u.email,
      displayName: u.displayName ?? null,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      accountCount: accounts.length,
      totalPnl,
    };
  }));

  res.json(AdminListUsersResponse.parse(usersWithStats));
});

// ─── ADMIN PAYMENTS ───────────────────────────────────────────────────────────
router.get("/admin/payments", requireAdmin, async (_req, res): Promise<void> => {
  const payments = await db
    .select({
      id: paymentsTable.id,
      userId: paymentsTable.userId,
      challengeId: paymentsTable.challengeId,
      amount: paymentsTable.amount,
      status: paymentsTable.status,
      method: paymentsTable.method,
      proofUrl: paymentsTable.proofUrl,
      notes: paymentsTable.notes,
      createdAt: paymentsTable.createdAt,
      email: usersTable.email,
      challengeName: challengesTable.name,
    })
    .from(paymentsTable)
    .leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
    .leftJoin(challengesTable, eq(paymentsTable.challengeId, challengesTable.id))
    .orderBy(paymentsTable.createdAt);

  const formatted = payments.map((p) => ({
    id: p.id,
    userId: p.userId,
    challengeId: p.challengeId,
    challengeName: p.challengeName ?? null,
    userEmail: p.email ?? null,
    amount: p.amount,
    status: p.status as "pending" | "approved" | "rejected",
    method: p.method,
    proofUrl: p.proofUrl ?? null,
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(AdminListPaymentsResponse.parse(formatted));
});

router.post("/admin/payments/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminApprovePaymentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, params.data.id));
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, payment.challengeId));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  await db.update(paymentsTable).set({ status: "approved" }).where(eq(paymentsTable.id, payment.id));

  const [account] = await db.insert(virtualAccountsTable).values({
    userId: payment.userId,
    challengeId: payment.challengeId,
    status: "active",
    initialBalance: challenge.accountSize,
    currentBalance: challenge.accountSize,
    equity: challenge.accountSize,
    floatingPnl: 0,
    totalPnl: 0,
    dailyPnl: 0,
    maxDrawdownReached: 0,
    profitTargetReached: false,
    tradingDays: 0,
  }).returning();

  res.json(AdminApprovePaymentResponse.parse({
    id: account.id,
    userId: account.userId,
    challengeId: account.challengeId,
    challengeName: challenge.name,
    status: account.status as "active",
    initialBalance: account.initialBalance,
    currentBalance: account.currentBalance,
    equity: account.equity,
    floatingPnl: account.floatingPnl,
    totalPnl: account.totalPnl,
    dailyPnl: account.dailyPnl,
    maxDrawdownReached: account.maxDrawdownReached,
    profitTargetReached: account.profitTargetReached,
    tradingDays: account.tradingDays,
    createdAt: account.createdAt.toISOString(),
  }));
});

router.post("/admin/payments/:id/reject", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminRejectPaymentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AdminRejectPaymentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [updated] = await db.update(paymentsTable)
    .set({ status: "rejected", notes: body.data.notes })
    .where(eq(paymentsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, updated.challengeId));
  res.json(AdminRejectPaymentResponse.parse({
    id: updated.id,
    userId: updated.userId,
    challengeId: updated.challengeId,
    challengeName: challenge?.name ?? null,
    userEmail: null,
    amount: updated.amount,
    status: "rejected" as const,
    method: updated.method,
    proofUrl: updated.proofUrl ?? null,
    notes: updated.notes ?? null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

// ─── ADMIN PAYOUTS ────────────────────────────────────────────────────────────
router.get("/admin/payouts", requireAdmin, async (_req, res): Promise<void> => {
  const payouts = await db
    .select({
      id: payoutRequestsTable.id,
      userId: payoutRequestsTable.userId,
      accountId: payoutRequestsTable.accountId,
      amount: payoutRequestsTable.amount,
      walletAddress: payoutRequestsTable.walletAddress,
      status: payoutRequestsTable.status,
      notes: payoutRequestsTable.notes,
      createdAt: payoutRequestsTable.createdAt,
      email: usersTable.email,
    })
    .from(payoutRequestsTable)
    .leftJoin(usersTable, eq(payoutRequestsTable.userId, usersTable.id))
    .orderBy(payoutRequestsTable.createdAt);

  const formatted = payouts.map((p) => ({
    id: p.id,
    userId: p.userId,
    accountId: p.accountId,
    userEmail: p.email ?? null,
    amount: p.amount,
    walletAddress: p.walletAddress,
    status: p.status as "pending" | "approved" | "rejected",
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(AdminListPayoutsResponse.parse(formatted));
});

router.post("/admin/payouts/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminApprovePayoutParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db.update(payoutRequestsTable)
    .set({ status: "approved" })
    .where(eq(payoutRequestsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Payout not found" });
    return;
  }

  res.json(AdminApprovePayoutResponse.parse({
    id: updated.id,
    userId: updated.userId,
    accountId: updated.accountId,
    userEmail: null,
    amount: updated.amount,
    walletAddress: updated.walletAddress,
    status: "approved" as const,
    notes: updated.notes ?? null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

router.post("/admin/payouts/:id/reject", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminRejectPayoutParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AdminRejectPayoutBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [updated] = await db.update(payoutRequestsTable)
    .set({ status: "rejected", notes: body.data.notes })
    .where(eq(payoutRequestsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Payout not found" });
    return;
  }

  res.json(AdminRejectPayoutResponse.parse({
    id: updated.id,
    userId: updated.userId,
    accountId: updated.accountId,
    userEmail: null,
    amount: updated.amount,
    walletAddress: updated.walletAddress,
    status: "rejected" as const,
    notes: updated.notes ?? null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

// ─── ADMIN CHALLENGES ─────────────────────────────────────────────────────────
router.post("/admin/challenges", requireAdmin, async (req, res): Promise<void> => {
  const body = AdminCreateChallengeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [challenge] = await db.insert(challengesTable).values(body.data).returning();

  res.status(201).json({
    id: challenge.id,
    name: challenge.name,
    accountSize: challenge.accountSize,
    price: challenge.price,
    profitTarget: challenge.profitTarget,
    maxDailyDrawdown: challenge.maxDailyDrawdown,
    maxTotalDrawdown: challenge.maxTotalDrawdown,
    minTradingDays: challenge.minTradingDays,
    maxTradingDays: challenge.maxTradingDays,
    leverage: challenge.leverage,
    instruments: challenge.instruments,
    createdAt: challenge.createdAt.toISOString(),
  });
});

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [userCount] = await db.select({ c: sql<number>`count(*)` }).from(usersTable);
  const allAccounts = await db.select().from(virtualAccountsTable);
  const allPayments = await db.select().from(paymentsTable);
  const allPayouts = await db.select().from(payoutRequestsTable);

  const totalRevenue = allPayments
    .filter((p) => p.status === "approved")
    .reduce((s, p) => s + p.amount, 0);

  res.json(AdminGetStatsResponse.parse({
    totalUsers: userCount?.c ?? 0,
    totalAccounts: allAccounts.length,
    activeAccounts: allAccounts.filter((a) => a.status === "active").length,
    totalRevenue,
    pendingPayments: allPayments.filter((p) => p.status === "pending").length,
    pendingPayouts: allPayouts.filter((p) => p.status === "pending").length,
    passedAccounts: allAccounts.filter((a) => a.status === "passed" || a.status === "funded").length,
    failedAccounts: allAccounts.filter((a) => a.status === "failed").length,
  }));
});

export default router;
