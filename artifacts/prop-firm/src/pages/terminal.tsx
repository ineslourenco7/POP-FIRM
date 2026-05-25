import { useEffect, useState } from "react";
import { Link } from "wouter";
import { UserButton, useUser } from "@clerk/react";
import { Wallet } from "lucide-react";

const assets = [
  { label: "XAU/USD", name: "Gold", value: "OANDA:XAUUSD", base: 2356.4, decimals: 2, change: "+0.82%", category: "Metals" },
  { label: "BTC/USD", name: "Bitcoin", value: "BITSTAMP:BTCUSD", base: 67420, decimals: 2, change: "+1.94%", category: "Crypto" },
  { label: "ETH/USD", name: "Ethereum", value: "BITSTAMP:ETHUSD", base: 3520.8, decimals: 2, change: "+1.21%", category: "Crypto" },
  { label: "EUR/USD", name: "Euro Dollar", value: "OANDA:EURUSD", base: 1.0842, decimals: 5, change: "+0.14%", category: "Forex" },
  { label: "GBP/USD", name: "Pound Dollar", value: "OANDA:GBPUSD", base: 1.271, decimals: 5, change: "-0.08%", category: "Forex" },
  { label: "USD/JPY", name: "Dollar Yen", value: "OANDA:USDJPY", base: 156.82, decimals: 3, change: "+0.22%", category: "Forex" },
  { label: "NAS100", name: "Nasdaq 100", value: "OANDA:NAS100USD", base: 18724.2, decimals: 1, change: "+0.64%", category: "Indices" },
  { label: "US30", name: "Dow Jones", value: "OANDA:US30USD", base: 39128.6, decimals: 1, change: "-0.18%", category: "Indices" },
  { label: "SPX500", name: "S&P 500", value: "OANDA:SPX500USD", base: 5304.1, decimals: 1, change: "+0.31%", category: "Indices" },
  { label: "USOIL", name: "WTI Crude", value: "TVC:USOIL", base: 78.42, decimals: 2, change: "+0.47%", category: "Commodities" },
];

type Asset = (typeof assets)[number];
type Position = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  lots: string;
  entry: string;
  current: string;
  pnl: string;
  openedAt: string;
};

function formatPrice(value: number, decimals: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function floatingPrice(asset: Asset, tick: number) {
  return asset.base + Math.sin(tick / 3 + asset.base) * asset.base * 0.00045 + Math.cos(tick / 5 + asset.label.length) * asset.base * 0.00025;
}

function TradingViewChart({ symbol }: { symbol: string }) {
  const params = new URLSearchParams({
    symbol,
    interval: "60",
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    withdateranges: "1",
    hide_side_toolbar: "0",
    allow_symbol_change: "1",
    save_image: "0",
    details: "1",
    hotlist: "0",
    calendar: "0",
    studies: "[]",
    locale: "en",
  });

  return <iframe title="TradingView Chart" src={`https://s.tradingview.com/widgetembed/?${params.toString()}`} className="h-full w-full border-0" allowFullScreen />;
}

export default function TerminalPage() {
  const { user } = useUser();
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [lotSize, setLotSize] = useState("0.10");
  const [investment, setInvestment] = useState("100");
  const [tick, setTick] = useState(0);
  const [lastAction, setLastAction] = useState("Nenhuma ordem enviada nesta sessão.");
  const [positions, setPositions] = useState<Position[]>([
    { id: "seed-1", symbol: "EUR/USD", side: "BUY", lots: "0.20", entry: "1.08120", current: "1.08420", pnl: "+$420", openedAt: "Demo" },
    { id: "seed-2", symbol: "BTC/USD", side: "BUY", lots: "0.03", entry: "66,110.00", current: "67,420.00", pnl: "+$312", openedAt: "Demo" },
    { id: "seed-3", symbol: "XAU/USD", side: "SELL", lots: "0.10", entry: "2,361.00", current: "2,356.40", pnl: "+$95", openedAt: "Demo" },
  ]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1200);
    return () => window.clearInterval(id);
  }, []);

  const price = floatingPrice(selectedAsset, tick);
  const priceText = formatPrice(price, selectedAsset.decimals);
  const investmentValue = Number(investment) || 0;
  const estimatedMargin = Math.max(investmentValue * 0.02, 1);

  function sendOrder(side: "BUY" | "SELL") {
    const newPosition: Position = {
      id: `${Date.now()}-${side}`,
      symbol: selectedAsset.label,
      side,
      lots: lotSize,
      entry: priceText,
      current: priceText,
      pnl: "$0.00",
      openedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
    };

    setPositions((current) => [newPosition, ...current]);
    setLastAction(`${side} ${lotSize} lot em ${selectedAsset.label} aberto a ${priceText}. A posição já aparece em Ordens abertas.`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Terminal</p>
            <h1 className="text-xl font-black md:text-2xl">Trading Terminal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-xs text-muted-foreground">Conta</p>
              <p className="text-sm font-bold">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-3 px-3 py-3">
        <section className="grid gap-3 md:grid-cols-5">
          {[["Saldo", "$100,000.00"], ["Equity", "$102,840.00"], ["Margem", "$1,240.00"], ["Margem livre", "$101,600.00"], ["Posições", String(positions.length)]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-black">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-3 xl:grid-cols-[290px_minmax(760px,1fr)_340px]">
          <aside className="rounded-3xl border border-border bg-card p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Mercados</p>
                <h2 className="text-xl font-black">Ativos</h2>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">Live demo</span>
            </div>
            <div className="max-h-[760px] space-y-2 overflow-y-auto pr-1">
              {assets.map((asset) => {
                const active = asset.value === selectedAsset.value;
                const positive = asset.change.startsWith("+");
                const livePrice = floatingPrice(asset, tick);
                const flashingUp = Math.sin(tick + asset.base) > 0;
                return (
                  <button key={asset.value} onClick={() => setSelectedAsset(asset)} className={`w-full rounded-2xl border p-3 text-left transition ${active ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-background/40 hover:bg-background/70"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">{asset.label}</p>
                        <p className="text-[11px] text-muted-foreground">{asset.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{asset.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black tabular-nums transition ${flashingUp ? "text-emerald-300" : "text-red-300"}`}>{formatPrice(livePrice, asset.decimals)}</p>
                        <p className={`text-xs font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>{asset.change}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-border bg-card p-3 shadow-2xl">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Gráfico principal</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl font-black">{selectedAsset.label}</h2>
                  <span className="text-sm text-muted-foreground">{selectedAsset.name}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">TradingView Online</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Preço atual</p>
                <p className="text-2xl font-black tabular-nums text-emerald-300">{priceText}</p>
              </div>
            </div>
            <div className="h-[760px] overflow-hidden rounded-2xl border border-border bg-background">
              <TradingViewChart symbol={selectedAsset.value} />
            </div>
          </section>

          <aside className="space-y-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Ordem de mercado</p>
              <h2 className="mt-1 text-2xl font-black">{selectedAsset.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Curso: <strong className="text-foreground tabular-nums">{priceText}</strong></p>

              <div className="mt-5 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Valor da operação</label>
                  <input value={investment} onChange={(event) => setInvestment(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-lg font-black outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Lot size</label>
                  <input value={lotSize} onChange={(event) => setLotSize(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm font-bold outline-none" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-background/60 p-3 text-center text-sm">
                <div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-black">Market</p></div>
                <div><p className="text-xs text-muted-foreground">Margem est.</p><p className="font-black">${estimatedMargin.toFixed(2)}</p></div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => sendOrder("BUY")} className="rounded-2xl bg-emerald-500 px-4 py-5 text-lg font-black text-white shadow-lg hover:bg-emerald-400">BUY</button>
                <button onClick={() => sendOrder("SELL")} className="rounded-2xl bg-red-500 px-4 py-5 text-lg font-black text-white shadow-lg hover:bg-red-400">SELL</button>
              </div>

              <p className="mt-4 rounded-2xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">{lastAction}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
              <Wallet className="mb-3 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Conta POP Demo</p>
              <p className="text-4xl font-black">$102,840</p>
              <p className="mt-1 text-sm text-emerald-400">+$2,840 lucro aberto</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
              <h3 className="mb-3 text-lg font-black">Ordens abertas</h3>
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {positions.map((position) => (
                  <div key={position.id} className="rounded-2xl border border-border bg-background/50 p-3 text-sm">
                    <div className="flex justify-between"><strong>{position.symbol}</strong><span className={position.side === "BUY" ? "text-emerald-400" : "text-red-400"}>{position.side}</span></div>
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{position.lots} lots · {position.entry}</span><strong className={position.pnl.startsWith("-") ? "text-red-400" : "text-emerald-400"}>{position.pnl}</strong></div>
                    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>Aberta: {position.openedAt}</span><span>Atual: {position.current}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
