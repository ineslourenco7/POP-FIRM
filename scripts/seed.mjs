import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const pg = require(path.resolve(__dirname, "../lib/db/node_modules/pg/lib/index.js"));
const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  INSERT INTO challenges (name, account_size, price, profit_target, max_daily_drawdown, max_total_drawdown, min_trading_days, max_trading_days, leverage, instruments)
  VALUES
    ('10K Challenge',   10000,   67, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('25K Challenge',   25000,  129, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('50K Challenge',   50000,  199, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('100K Challenge', 100000,  329, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('200K Challenge', 200000,  667, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('1M Challenge',  1000000, 2997, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD']),
    ('3M Instant',   3000000, 7497, 8, 5, 10, 2, 30, 100, ARRAY['EURUSD','GBPUSD','USDJPY','XAUUSD'])
  ON CONFLICT DO NOTHING;
`);

console.log("Seed: challenge plans OK");
await client.end();
