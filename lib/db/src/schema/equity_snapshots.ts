import { pgTable, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { virtualAccountsTable } from "./virtual_accounts";

export const equitySnapshotsTable = pgTable("equity_snapshots", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => virtualAccountsTable.id),
  equity: real("equity").notNull(),
  pnl: real("pnl").notNull().default(0),
  trades: integer("trades").notNull().default(0),
  snapshotAt: timestamp("snapshot_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEquitySnapshotSchema = createInsertSchema(equitySnapshotsTable).omit({ id: true });
export type InsertEquitySnapshot = z.infer<typeof insertEquitySnapshotSchema>;
export type EquitySnapshot = typeof equitySnapshotsTable.$inferSelect;
