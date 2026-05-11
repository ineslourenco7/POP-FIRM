import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, virtualAccountsTable, ordersTable, equitySnapshotsTable, challengesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListOrdersParams,
  CreateOrderParams,
  CreateOrderBody,
  CloseOrderParams,
  ListOrdersResponse,
  CloseOrderResponse,
} from "@workspace/api-zod";
import { getCurrentPrice } from "../lib/market";

const router: IRouter = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    accountId: order.accountId,
    symbol: order.symbol,
    side: order.side as "buy" | "sell",
    size: order.size,
    openPrice: order.openPrice,
    closePrice: order.closePrice ?? null,
    currentPrice: order.status === "open" ? getCurrentPrice(order.symbol) : (order.closePrice ?? null),
    stopLoss: order.stopLoss ?? null,
    takeProfit: order.takeProfit ?? null,
    pnl: order.pnl ?? null,
    status: order.status as "open" | "closed",
    openedAt: order.openedAt.toISOString(),
    closedAt: order.closedAt?.toISOString() ?? null,
  };
}

async function checkDrawdownRules(account: typeof virtualAccountsTable.$inferSelect, challenge: typeof challengesTable.$inferSelect, newPnl: number) {
  const newBalance = account.currentBalance + newPnl;
  const drawdownFromInitial = ((account.initialBalance - newBalance) / account.initialBalance) * 100;
  const dailyDrawdown = ((account.currentBalance - newBalance) / account.currentBalance) * 100;

  const violations = [];

  if (dailyDrawdown > challenge.maxDailyDrawdown) {
    violations.push(`Daily drawdown limit of ${challenge.maxDailyDrawdown}% exceeded`);
  }

  if (drawdownFromInitial > challenge.maxTotalDrawdown) {
    violations.push(`Total drawdown limit of ${challenge.maxTotalDrawdown}% exceeded`);
  }

  return violations;
}

router.get("/accounts/:accountId/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const raw = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
  const params = ListOrdersParams.safeParse({ accountId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [account] = await db.select().from(virtualAccountsTable)
    .where(and(eq(virtualAccountsTable.id, params.data.accountId), eq(virtualAccountsTable.userId, user.id)));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.accountId, account.id))
    .orderBy(ordersTable.openedAt);

  res.json(ListOrdersResponse.parse(orders.map(formatOrder)));
});

router.post("/accounts/:accountId/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const raw = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
  const params = CreateOrderParams.safeParse({ accountId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [account] = await db.select().from(virtualAccountsTable)
    .where(and(eq(virtualAccountsTable.id, params.data.accountId), eq(virtualAccountsTable.userId, user.id)));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  if (account.status !== "active") {
    res.status(400).json({ error: "Account is not active" });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, account.challengeId));
  if (!challenge.instruments.includes(body.data.symbol)) {
    res.status(400).json({ error: `Symbol ${body.data.symbol} is not allowed. Allowed: ${challenge.instruments.join(", ")}` });
    return;
  }

  const openPrice = getCurrentPrice(body.data.symbol);

  const [order] = await db.insert(ordersTable).values({
    accountId: account.id,
    symbol: body.data.symbol,
    side: body.data.side,
    size: body.data.size,
    openPrice,
    stopLoss: body.data.stopLoss ?? null,
    takeProfit: body.data.takeProfit ?? null,
    status: "open",
    openedAt: new Date(),
  }).returning();

  // Update trading days if first order today
  const today = new Date().toDateString();
  const lastOrderDate = (account.updatedAt as Date).toDateString();
  let tradingDays = account.tradingDays;
  if (today !== lastOrderDate) {
    tradingDays = account.tradingDays + 1;
    await db.update(virtualAccountsTable)
      .set({ tradingDays })
      .where(eq(virtualAccountsTable.id, account.id));
  }

  res.status(201).json(formatOrder(order));
});

router.post("/accounts/:accountId/orders/:orderId/close", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const rawAccount = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
  const rawOrder = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const params = CloseOrderParams.safeParse({
    accountId: parseInt(rawAccount, 10),
    orderId: parseInt(rawOrder, 10),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [account] = await db.select().from(virtualAccountsTable)
    .where(and(eq(virtualAccountsTable.id, params.data.accountId), eq(virtualAccountsTable.userId, user.id)));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, params.data.orderId), eq(ordersTable.accountId, account.id), eq(ordersTable.status, "open")));

  if (!order) {
    res.status(404).json({ error: "Open order not found" });
    return;
  }

  const closePrice = getCurrentPrice(order.symbol);
  const pnl = order.side === "buy"
    ? (closePrice - order.openPrice) * order.size * 1000
    : (order.openPrice - closePrice) * order.size * 1000;

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, account.challengeId));

  const newBalance = account.currentBalance + pnl;
  const drawdownFromInitial = ((account.initialBalance - newBalance) / account.initialBalance) * 100;
  const profitPercent = ((newBalance - account.initialBalance) / account.initialBalance) * 100;

  let newStatus = account.status;
  if (drawdownFromInitial >= challenge.maxTotalDrawdown) {
    newStatus = "failed";
  } else if (profitPercent >= challenge.profitTarget && account.tradingDays >= challenge.minTradingDays) {
    newStatus = "passed";
  }

  const [closedOrder] = await db.update(ordersTable).set({
    status: "closed",
    closePrice,
    pnl,
    closedAt: new Date(),
  }).where(eq(ordersTable.id, order.id)).returning();

  // Snapshot equity
  await db.insert(equitySnapshotsTable).values({
    accountId: account.id,
    equity: newBalance,
    pnl,
    trades: 1,
  });

  await db.update(virtualAccountsTable).set({
    currentBalance: newBalance,
    equity: newBalance,
    totalPnl: account.totalPnl + pnl,
    dailyPnl: account.dailyPnl + pnl,
    maxDrawdownReached: Math.max(account.maxDrawdownReached, drawdownFromInitial),
    profitTargetReached: profitPercent >= challenge.profitTarget,
    status: newStatus,
  }).where(eq(virtualAccountsTable.id, account.id));

  res.json(CloseOrderResponse.parse(formatOrder(closedOrder)));
});

export default router;
