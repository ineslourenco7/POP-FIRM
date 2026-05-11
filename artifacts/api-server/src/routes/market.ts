import { Router, type IRouter } from "express";
import {
  GetMarketCandlesQueryParams,
  GetMarketPriceQueryParams,
  GetMarketCandlesResponse,
  GetMarketPriceResponse,
} from "@workspace/api-zod";
import { generateCandles, getMarketPrice } from "../lib/market";

const router: IRouter = Router();

router.get("/market/candles", async (req, res): Promise<void> => {
  const query = GetMarketCandlesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const candles = generateCandles(query.data.symbol, query.data.interval ?? "1h");
  res.json(GetMarketCandlesResponse.parse(candles));
});

router.get("/market/price", async (req, res): Promise<void> => {
  const query = GetMarketPriceQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const price = getMarketPrice(query.data.symbol);
  res.json(GetMarketPriceResponse.parse(price));
});

export default router;
