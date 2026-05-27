type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const plans: Record<string, { name: string; price: number }> = {
  "1": { name: "POP Launch $10K", price: 99 },
  "2": { name: "POP Starter $25K", price: 149 },
  "3": { name: "POP Growth $50K", price: 249 },
  "4": { name: "POP Pro $100K", price: 399 },
  "5": { name: "POP Elite $200K", price: 749 },
  "6": { name: "POP Titan $400K", price: 1299 },
  "7": { name: "POP Instant $3M", price: 4999 },
};

function getBodyValue(body: unknown, key: string): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NOWPAYMENTS_API_KEY is not configured." });
  }

  const planId = getBodyValue(req.body, "planId") ?? getBodyValue(req.body, "plan") ?? "1";
  const payCurrency = (getBodyValue(req.body, "payCurrency") ?? getBodyValue(req.body, "currency") ?? "usdttrc20").toLowerCase();
  const plan = plans[planId] ?? plans["1"];

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        price_amount: plan.price,
        price_currency: "usd",
        pay_currency: payCurrency,
        order_id: `quantfund-${planId}-${Date.now()}`,
        order_description: `QuantFund - ${plan.name}`,
        success_url: "https://www.quantfund.pt/terminal",
        cancel_url: "https://www.quantfund.pt/challenges",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: "NOWPayments invoice creation failed.",
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Unable to create NOWPayments invoice.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
