import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable, challengesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListMyPaymentsResponse,
  SubmitPaymentBody,
  UploadPaymentProofParams,
  UploadPaymentProofBody,
  UploadPaymentProofResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function formatPayment(p: typeof paymentsTable.$inferSelect) {
  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, p.challengeId));
  return {
    id: p.id,
    userId: p.userId,
    challengeId: p.challengeId,
    challengeName: challenge?.name ?? null,
    userEmail: null as string | null,
    amount: p.amount,
    status: p.status as "pending" | "approved" | "rejected",
    method: p.method,
    proofUrl: p.proofUrl ?? null,
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/payments", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.userId, user.id))
    .orderBy(paymentsTable.createdAt);
  const formatted = await Promise.all(payments.map(formatPayment));
  res.json(ListMyPaymentsResponse.parse(formatted));
});

router.post("/payments", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const body = SubmitPaymentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, body.data.challengeId));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const [payment] = await db.insert(paymentsTable).values({
    userId: user.id,
    challengeId: body.data.challengeId,
    amount: body.data.amount,
    method: body.data.method,
    status: "pending",
  }).returning();

  const formatted = await formatPayment(payment);
  res.status(201).json(formatted);
});

router.post("/payments/:id/proof", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).currentUser;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UploadPaymentProofParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UploadPaymentProofBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [payment] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, params.data.id));

  if (!payment || payment.userId !== user.id) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const [updated] = await db.update(paymentsTable)
    .set({ proofUrl: body.data.proofUrl })
    .where(eq(paymentsTable.id, payment.id))
    .returning();

  const formatted = await formatPayment(updated);
  res.json(UploadPaymentProofResponse.parse(formatted));
});

export default router;
