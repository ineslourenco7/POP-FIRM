import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { virtualAccountsTable } from "./virtual_accounts";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => virtualAccountsTable.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  size: real("size").notNull(),
  openPrice: real("open_price").notNull(),
  closePrice: real("close_price"),
  currentPrice: real("current_price"),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  pnl: real("pnl"),
  status: text("status").notNull().default("open"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
