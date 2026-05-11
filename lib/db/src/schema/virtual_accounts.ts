import { pgTable, text, serial, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { challengesTable } from "./challenges";

export const virtualAccountsTable = pgTable("virtual_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  challengeId: integer("challenge_id").notNull().references(() => challengesTable.id),
  status: text("status").notNull().default("active"),
  initialBalance: real("initial_balance").notNull(),
  currentBalance: real("current_balance").notNull(),
  equity: real("equity").notNull(),
  floatingPnl: real("floating_pnl").notNull().default(0),
  totalPnl: real("total_pnl").notNull().default(0),
  dailyPnl: real("daily_pnl").notNull().default(0),
  maxDrawdownReached: real("max_drawdown_reached").notNull().default(0),
  profitTargetReached: boolean("profit_target_reached").notNull().default(false),
  tradingDays: integer("trading_days").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVirtualAccountSchema = createInsertSchema(virtualAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVirtualAccount = z.infer<typeof insertVirtualAccountSchema>;
export type VirtualAccount = typeof virtualAccountsTable.$inferSelect;
