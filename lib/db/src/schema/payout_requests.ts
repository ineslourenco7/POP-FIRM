import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { virtualAccountsTable } from "./virtual_accounts";

export const payoutRequestsTable = pgTable("payout_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  accountId: integer("account_id").notNull().references(() => virtualAccountsTable.id),
  amount: real("amount").notNull(),
  walletAddress: text("wallet_address").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
export type PayoutRequest = typeof payoutRequestsTable.$inferSelect;
