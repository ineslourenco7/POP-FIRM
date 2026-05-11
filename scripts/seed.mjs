import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  INSERT INTO challenges (name, account_size, price, profit_target, max_daily_drawdown, max_total_drawdown, min_trading_days, max_trading_days, leverage, instruments)
  VALUES
    ('10K Challenge',  10000,   97,  8, 5, 10, 5, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('25K Challenge',  25000,  197,  8, 5, 10, 5, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('50K Challenge',  50000,  297,  8, 5, 10, 5, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('100K Challenge', 100000, 497,  8, 5, 10, 5, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('200K Challenge', 200000, 997,  8, 5, 10, 5, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('1M Challenge',  1000000, 4997, 8, 5, 10, 5, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD'])
  ON CONFLICT DO NOTHING;
`);

console.log("Seed: challenge plans OK");
await client.end();
