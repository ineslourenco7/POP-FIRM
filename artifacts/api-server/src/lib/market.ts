// Simulated market data generator for virtual trading
const BASE_PRICES: Record<string, number> = {
  EURUSD: 1.0875,
  GBPUSD: 1.2650,
  USDJPY: 149.50,
  XAUUSD: 2340.00,
  USDCHF: 0.8950,
  AUDUSD: 0.6520,
  USDCAD: 1.3650,
  NZDUSD: 0.5980,
  BTCUSD: 67500.00,
  ETHUSD: 3450.00,
  US30: 38500.00,
  NAS100: 18200.00,
  SP500: 5100.00,
  CRUDE: 82.50,
};

const priceHistory: Record<string, { price: number; lastUpdate: number }> = {};

function getSimulatedPrice(symbol: string): number {
  const base = BASE_PRICES[symbol] ?? 1.0;
  const now = Date.now();
  const key = symbol;

  if (!priceHistory[key] || now - priceHistory[key].lastUpdate > 1000) {
    const prev = priceHistory[key]?.price ?? base;
    const volatility = base * 0.0005;
    const change = (Math.random() - 0.5) * 2 * volatility;
    priceHistory[key] = { price: prev + change, lastUpdate: now };
  }

  return priceHistory[key].price;
}

export function getCurrentPrice(symbol: string): number {
  return getSimulatedPrice(symbol);
}

export function generateCandles(symbol: string, interval: string = "1h", count: number = 100) {
  const base = BASE_PRICES[symbol] ?? 1.0;
  const candles = [];
  let price = base;
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = interval === "1m" ? 60
    : interval === "5m" ? 300
    : interval === "15m" ? 900
    : interval === "1h" ? 3600
    : interval === "4h" ? 14400
    : 86400;

  for (let i = count; i >= 0; i--) {
    const volatility = base * 0.002;
    const open = price;
    const change1 = (Math.random() - 0.5) * volatility;
    const change2 = (Math.random() - 0.5) * volatility;
    const change3 = (Math.random() - 0.5) * volatility;
    const close = open + change1;
    const high = Math.max(open, close) + Math.abs(change2);
    const low = Math.min(open, close) - Math.abs(change3);
    const volume = Math.floor(Math.random() * 10000) + 1000;

    candles.push({
      time: now - i * intervalSeconds,
      open: Number(open.toFixed(5)),
      high: Number(high.toFixed(5)),
      low: Number(low.toFixed(5)),
      close: Number(close.toFixed(5)),
      volume,
    });

    price = close;
  }

  return candles;
}

export function getMarketPrice(symbol: string) {
  const price = getCurrentPrice(symbol);
  const base = BASE_PRICES[symbol] ?? 1.0;
  const change = price - base;
  const changePercent = (change / base) * 100;

  return {
    symbol,
    price: Number(price.toFixed(5)),
    change: Number(change.toFixed(5)),
    changePercent: Number(changePercent.toFixed(4)),
  };
}
