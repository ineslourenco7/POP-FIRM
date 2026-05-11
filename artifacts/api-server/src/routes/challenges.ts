import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, challengesTable } from "@workspace/db";
import {
  ListChallengesResponse,
  GetChallengeParams,
  GetChallengeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

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

router.get("/challenges", async (_req, res): Promise<void> => {
  const challenges = await db.select().from(challengesTable).orderBy(challengesTable.accountSize);
  res.json(ListChallengesResponse.parse(challenges.map(formatChallenge)));
});

router.get("/challenges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetChallengeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, params.data.id));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  res.json(GetChallengeResponse.parse(formatChallenge(challenge)));
});

export default router;
