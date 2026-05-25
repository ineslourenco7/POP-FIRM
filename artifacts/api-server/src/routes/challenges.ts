import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, challengesTable } from "@workspace/db";
import {
  ListChallengesResponse,
  GetChallengeParams,
  GetChallengeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const defaultChallenges = [
  {
    name: "POP 10K Challenge",
    accountSize: 10000,
    price: 79,
    profitTarget: 8,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 5,
    maxTradingDays: 30,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
  {
    name: "POP 25K Challenge",
    accountSize: 25000,
    price: 149,
    profitTarget: 8,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 5,
    maxTradingDays: 30,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
  {
    name: "POP 50K Challenge",
    accountSize: 50000,
    price: 249,
    profitTarget: 8,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 5,
    maxTradingDays: 30,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
  {
    name: "POP 100K Challenge",
    accountSize: 100000,
    price: 399,
    profitTarget: 8,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 5,
    maxTradingDays: 30,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
  {
    name: "POP 200K Challenge",
    accountSize: 200000,
    price: 799,
    profitTarget: 8,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 5,
    maxTradingDays: 30,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
  {
    name: "POP 1M Challenge",
    accountSize: 1000000,
    price: 1999,
    profitTarget: 8,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 5,
    maxTradingDays: 30,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
  {
    name: "POP 3M Instant Funded",
    accountSize: 3000000,
    price: 4999,
    profitTarget: 0,
    maxDailyDrawdown: 0,
    maxTotalDrawdown: 10,
    minTradingDays: 0,
    maxTradingDays: 0,
    leverage: 100,
    instruments: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
  },
];

function formatChallenge(c: typeof challengesTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    accountSize: c.accountSize,
    price: c.price,
    profitTarget: c.profitTarget,
    maxDailyDrawdown: c.maxDailyDrawdown,
    maxTotalDrawdown: c.maxTotalDrawdown,
    minTradingDays: c.minTradingDays,
    maxTradingDays: c.maxTradingDays,
    leverage: c.leverage,
    instruments: c.instruments,
    createdAt: c.createdAt.toISOString(),
  };
}

async function getOrCreateChallenges() {
  const existingChallenges = await db
    .select()
    .from(challengesTable)
    .orderBy(challengesTable.accountSize);

  if (existingChallenges.length === 0) {
    return db
      .insert(challengesTable)
      .values(defaultChallenges)
      .returning();
  }

  const hasInstantChallenge = existingChallenges.some(
    (challenge) => challenge.accountSize >= 3000000,
  );

  if (!hasInstantChallenge) {
    const [instantChallenge] = await db
      .insert(challengesTable)
      .values(defaultChallenges[defaultChallenges.length - 1])
      .returning();

    if (instantChallenge) {
      return [...existingChallenges, instantChallenge].sort(
        (a, b) => a.accountSize - b.accountSize,
      );
    }
  }

  return existingChallenges;
}

router.get("/challenges", async (_req, res): Promise<void> => {
  const challenges = await getOrCreateChallenges();
  res.json(ListChallengesResponse.parse(challenges.map(formatChallenge)));
});

router.get("/challenges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetChallengeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await getOrCreateChallenges();

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, params.data.id));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  res.json(GetChallengeResponse.parse(formatChallenge(challenge)));
});

export default router;
