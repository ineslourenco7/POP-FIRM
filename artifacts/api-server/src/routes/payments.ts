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

const cryptoCheckoutPlans: Record<string, { name: string; account: string; price: number }> = {
  "1": { name: "Rookie", account: "$10K", price: 99 },
  "2": { name: "Ascend", account: "$25K", price: 149 },
  "3": { name: "Velocity", account: "$50K", price: 249 },
  "4": { name: "Apex", account: "$100K", price: 399 },
  "5": { name: "Dominance", account: "$200K", price: 749 },
  "6": { name: "Legacy", account: "$400K", price: 1299 },
  "7": { name: "Sovereign", account: "$1M", price: 2499 },
  "8": { name: "Infinity", account: "$3M", price: 4999 },
};

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

router.post("/payments/crypto-invoice", async (req, res): Promise<void> => {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "NOWPAYMENTS_API_KEY is missing" });
      return;
    }

    const planId = String(req.body?.planId ?? "1");
    const plan = cryptoCheckoutPlans[planId] ?? cryptoCheckoutPlans["1"];
    const origin = req.get("origin") ?? `${req.protocol}://${req.get("host")}`;
    const orderId = `pop-firm-${planId}-${Date.now()}`;

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: plan.price,
        price_currency: "usd",
        order_id: orderId,
        order_description: `POP FIRM ${plan.name} ${plan.account}`,
        ipn_callback_url: `${origin}/api/payments/nowpayments-webhook`,
        success_url: `${origin}/terminal`,
        cancel_url: `${origin}/challenges`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      res.status(response.status).json({ error: "NOWPayments invoice failed", details: data });
      return;
    }

    res.json({
      invoiceUrl: data.invoice_url ?? data.invoiceUrl ?? data.url,
      orderId,
      plan,
      raw: data,
    });
  } catch (error) {
    res.status(500).json({ error: "Crypto checkout error" });
  }
});

router.post("/payments/nowpayments-webhook", async (req, res): Promise<void> => {
  console.log("NOWPayments IPN", req.body);
  res.json({ ok: true });
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
