import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accountSize: real("account_size").notNull(),
  price: real("price").notNull(),
  profitTarget: real("profit_target").notNull(),
  maxDailyDrawdown: real("max_daily_drawdown").notNull(),
  maxTotalDrawdown: real("max_total_drawdown").notNull(),
  minTradingDays: integer("min_trading_days").notNull().default(5),
  maxTradingDays: integer("max_trading_days").notNull().default(30),
  leverage: integer("leverage").notNull().default(100),
  instruments: text("instruments").array().notNull().default(["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
