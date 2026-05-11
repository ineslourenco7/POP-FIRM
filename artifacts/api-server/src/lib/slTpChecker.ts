import { eq, and, isNotNull, or } from "drizzle-orm";
import { db, ordersTable, virtualAccountsTable, challengesTable, equitySnapshotsTable } from "@workspace/db";
import { getCurrentPrice } from "./market";
import { logger } from "./logger";

async function closeOrder(
  order: typeof ordersTable.$inferSelect,
  account: typeof virtualAccountsTable.$inferSelect,
  challenge: typeof challengesTable.$inferSelect,
  reason: string
) {
  const closePrice = getCurrentPrice(order.symbol);
  const pnl =
    order.side === "buy"
      ? (closePrice - order.openPrice) * order.size
      : (order.openPrice - closePrice) * order.size;

  const newBalance = account.currentBalance + pnl;
  const drawdownFromInitial =
    ((account.initialBalance - newBalance) / account.initialBalance) * 100;
  const profitPercent =
    ((newBalance - account.initialBalance) / account.initialBalance) * 100;

  let newStatus = account.status;
  if (drawdownFromInitial >= challenge.maxTotalDrawdown) {
    newStatus = "failed";
  } else if (
    profitPercent >= challenge.profitTarget &&
    account.tradingDays >= challenge.minTradingDays
  ) {
    newStatus = "passed";
  }

  await db
    .update(ordersTable)
    .set({ status: "closed", closePrice, pnl, closedAt: new Date() })
    .where(eq(ordersTable.id, order.id));

  await db.insert(equitySnapshotsTable).values({
    accountId: account.id,
    equity: newBalance,
    pnl,
    trades: 1,
  });

  await db
    .update(virtualAccountsTable)
    .set({
      currentBalance: newBalance,
      equity: newBalance,
      totalPnl: account.totalPnl + pnl,
      dailyPnl: account.dailyPnl + pnl,
      maxDrawdownReached: Math.max(account.maxDrawdownReached, drawdownFromInitial),
      profitTargetReached: profitPercent >= challenge.profitTarget,
      status: newStatus,
    })
    .where(eq(virtualAccountsTable.id, account.id));

  logger.info({ orderId: order.id, reason, pnl }, "Order auto-closed by SL/TP");
}

export function startSlTpChecker() {
  setInterval(async () => {
    try {
      const openOrders = await db
        .select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.status, "open"),
            or(isNotNull(ordersTable.stopLoss), isNotNull(ordersTable.takeProfit))
          )
        );

      for (const order of openOrders) {
        const currentPrice = getCurrentPrice(order.symbol);
        const sl = order.stopLoss;
        const tp = order.takeProfit;

        let triggered = false;
        let reason = "";

        if (order.side === "buy") {
          if (sl !== null && currentPrice <= sl) { triggered = true; reason = "stop_loss"; }
          else if (tp !== null && currentPrice >= tp) { triggered = true; reason = "take_profit"; }
        } else {
          if (sl !== null && currentPrice >= sl) { triggered = true; reason = "stop_loss"; }
          else if (tp !== null && currentPrice <= tp) { triggered = true; reason = "take_profit"; }
        }

        if (!triggered) continue;

        const [account] = await db
          .select()
          .from(virtualAccountsTable)
          .where(eq(virtualAccountsTable.id, order.accountId));

        if (!account || account.status !== "active") continue;

        const [challenge] = await db
          .select()
          .from(challengesTable)
          .where(eq(challengesTable.id, account.challengeId));

        if (!challenge) continue;

        await closeOrder(order, account, challenge, reason);
      }
    } catch (err) {
      logger.error({ err }, "SL/TP checker error");
    }
  }, 2000);
}
