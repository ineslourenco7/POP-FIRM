import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { UserButton, useUser } from "@clerk/react";
import { ChevronDown, ChevronLeft, ChevronRight, Wallet } from "lucide-react";

type Side = "BUY" | "SELL";
type Tab = "open" | "history";

type Asset = {
  label: string;
  name: string;
  value: string;
  base: number;
  decimals: number;
  multiplier: number;
  change: string;
  category: string;
};

type Position = {
  id: string;
  symbol: string;
  side: Side;
  lots: number;
  entry: number;
  current: number;
  pnl: number;
  stopLoss?: number;
  takeProfit?: number;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string;
  reason?: string;
};

const assets: Asset[] = [
  { label: "XAU/USD", name: "Gold", value: "OANDA:XAUUSD", base: 2356.4, decimals: 2, multiplier: 100, change: "+0.82%", category: "Metals" },
  { label: "BTC/USD", name: "Bitcoin", value: "BITSTAMP:BTCUSD", base: 67420, decimals: 2, multiplier: 1, change: "+1.94%", category: "Crypto" },
  { label: "ETH/USD", name: "Ethereum", value: "BITSTAMP:ETHUSD", base: 3520.8, decimals: 2, multiplier: 1, change: "+1.21%", category: "Crypto" },
  { label: "EUR/USD", name: "Euro Dollar", value: "OANDA:EURUSD", base: 1.0842, decimals: 5, multiplier: 100000, change: "+0.14%", category: "Forex" },
  { label: "GBP/USD", name: "Pound Dollar", value: "OANDA:GBPUSD", base: 1.271, decimals: 5, multiplier: 100000, change: "-0.08%", category: "Forex" },
  { label: "USD/JPY", name: "Dollar Yen", value: "OANDA:USDJPY", base: 156.82, decimals: 3, multiplier: 100000, change: "+0.22%", category: "Forex" },
  { label: "NAS100", name: "Nasdaq 100", value: "NASDAQ:NDX", base: 18724.2, decimals: 1, multiplier: 10, change: "+0.64%", category: "Indices" },
  { label: "US30", name: "Dow Jones", value: "DJ:DJI", base: 39128.6, decimals: 1, multiplier: 10, change: "-0.18%", category: "Indices" },
  { label: "SPX500", name: "S&P 500", value: "SP:SPX", base: 5304.1, decimals: 1, multiplier: 10, change: "+0.31%", category: "Indices" },
  { label: "USOIL", name: "WTI Crude", value: "TVC:USOIL", base: 78.42, decimals: 2, multiplier: 1000, change: "+0.47%", category: "Commodities" },
];

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatPrice(value: number, decimals: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function floatingPrice(asset: Asset, tick: number) {
  return asset.base + Math.sin(tick / 3 + asset.base) * asset.base * 0.00045 + Math.cos(tick / 5 + asset.label.length) * asset.base * 0.00025;
}

function positionPnl(position: Position, tick: number) {
  const asset = assets.find((item) => item.label === position.symbol) ?? assets[0];
  const current = floatingPrice(asset, tick);
  const direction = position.side === "BUY" ? 1 : -1;
  return (current - position.entry) * direction * position.lots * asset.multiplier;
}

function MiniTerminalChart({ asset, tick }: { asset: Asset; tick: number }) {
  const points = Array.from({ length: 140 }, (_, index) => floatingPrice(asset, tick - 140 + index));
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(0.00001, max - min);
  const poly = points.map((point, index) => `${(index / 139) * 100},${92 - ((point - min) / range) * 78}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07111f]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="qfArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(34 211 238 / .35)" />
            <stop offset="100%" stopColor="rgb(34 211 238 / 0)" />
          </linearGradient>
        </defs>
        {[18, 34, 50, 66, 82].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgb(51 65 85 / .45)" strokeWidth=".18" />)}
        {[15, 30, 45, 60, 75, 90].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="100" stroke="rgb(51 65 85 / .28)" strokeWidth=".14" />)}
        <polyline points={`0,100 ${poly} 100,100`} fill="url(#qfArea)" />
        <polyline points={poly} fill="none" stroke="rgb(34,211,238)" strokeWidth=".55" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute left-6 top-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gráfico principal</p>
        <div className="mt-1 flex items-baseline gap-3">
          <h2 className="font-mono text-4xl font-black text-white">{asset.label}</h2>
          <span className="text-sm text-slate-400">{asset.name}</span>
        </div>
      </div>
      <div className="absolute right-6 top-5 text-right">
        <p className="text-xs text-slate-500">Preço atual</p>
        <p className="font-mono text-3xl font-black text-emerald-300">{formatPrice(last, asset.decimals)}</p>
      </div>
    </div>
  );
}

export default function TerminalPage() {
  const { user } = useUser();
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [assetMenuOpen, setAssetMenuOpen] = useState(false);
  const [lotSize, setLotSize] = useState("0.10");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [tick, setTick] = useState(0);
  const [lastAction, setLastAction] = useState("Nenhuma ordem enviada nesta sessão.");
  const [activeTab, setActiveTab] = useState<Tab>("open");
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [orderPanelOpen, setOrderPanelOpen] = useState(true);
  const [positions, setPositions] = useState<Position[]>([
    { id: "seed-1", symbol: "EUR/USD", side: "BUY", lots: 0.2, entry: 1.0812, current: 1.0842, pnl: 420, status: "open", openedAt: "Demo" },
    { id: "seed-2", symbol: "BTC/USD", side: "BUY", lots: 0.03, entry: 66110, current: 67420, pnl: 312, status: "open", openedAt: "Demo" },
    { id: "seed-3", symbol: "XAU/USD", side: "SELL", lots: 0.1, entry: 2361, current: 2356.4, pnl: 95, status: "open", openedAt: "Demo" },
  ]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1200);
    return () => window.clearInterval(id);
  }, []);

  const price = floatingPrice(selectedAsset, tick);
  const lots = Math.max(0.01, Number(lotSize) || 0.01);
  const operationValue = price * lots * selectedAsset.multiplier;
  const estimatedMargin = Math.max(operationValue / 100, 1);

  const enrichedPositions = useMemo(() => positions.map((position) => {
    if (position.status === "closed") return position;
    const asset = assets.find((item) => item.label === position.symbol) ?? selectedAsset;
    const current = floatingPrice(asset, tick);
    return { ...position, current, pnl: positionPnl(position, tick) };
  }), [positions, selectedAsset, tick]);

  const openPositions = enrichedPositions.filter((position) => position.status === "open");
  const closedPositions = enrichedPositions.filter((position) => position.status === "closed");
  const floatingPnl = openPositions.reduce((sum, position) => sum + position.pnl, 0);
  const realizedPnl = closedPositions.reduce((sum, position) => sum + position.pnl, 0);
  const balance = 100000 + realizedPnl;
  const equity = balance + floatingPnl;
  const usedMargin = openPositions.reduce((sum, position) => {
    const asset = assets.find((item) => item.label === position.symbol) ?? selectedAsset;
    return sum + Math.max((position.current * position.lots * asset.multiplier) / 100, 1);
  }, 0);
  const freeMargin = equity - usedMargin;

  function sendOrder(side: Side) {
    const newPosition: Position = {
      id: `${Date.now()}-${side}`,
      symbol: selectedAsset.label,
      side,
      lots,
      entry: price,
      current: price,
      pnl: 0,
      stopLoss: Number(stopLoss) || undefined,
      takeProfit: Number(takeProfit) || undefined,
      status: "open",
      openedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
    };
    setPositions((current) => [newPosition, ...current]);
    setLastAction(`${side} ${lots.toFixed(2)} lot em ${selectedAsset.label} aberto a ${formatPrice(price, selectedAsset.decimals)}.`);
  }

  function closePosition(id: string, reason = "Manual") {
    setPositions((current) => current.map((position) => {
      if (position.id !== id || position.status !== "open") return position;
      const asset = assets.find((item) => item.label === position.symbol) ?? selectedAsset;
      const currentPrice = floatingPrice(asset, tick);
      return { ...position, current: currentPrice, pnl: positionPnl(position, tick), status: "closed", closedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), reason };
    }));
  }

  useEffect(() => {
    for (const position of openPositions) {
      if (position.side === "BUY" && position.stopLoss && position.current <= position.stopLoss) closePosition(position.id, "SL");
      if (position.side === "BUY" && position.takeProfit && position.current >= position.takeProfit) closePosition(position.id, "TP");
      if (position.side === "SELL" && position.stopLoss && position.current >= position.stopLoss) closePosition(position.id, "SL");
      if (position.side === "SELL" && position.takeProfit && position.current <= position.takeProfit) closePosition(position.id, "TP");
    }
  }, [tick]);

  const rows = activeTab === "open" ? openPositions : closedPositions;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050a14] text-white">
      <header className="shrink-0 border-b border-[#1e2a3a] bg-[#0a0e1a] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">QuantFund Terminal</p>
            <h1 className="text-xl font-black md:text-2xl">Trading Terminal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block"><p className="text-xs text-slate-500">Conta</p><p className="text-sm font-bold">{user?.primaryEmailAddress?.emailAddress}</p></div>
            <Link href="/admin" className="text-sm text-slate-400 hover:text-white">Admin</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <section className="grid shrink-0 grid-cols-2 gap-3 border-b border-[#1e2a3a] bg-[#050a14] p-3 md:grid-cols-6">
        <Metric label="Saldo" value={formatMoney(balance)} />
        <Metric label="Equity" value={formatMoney(equity)} />
        <Metric label="Margem" value={formatMoney(usedMargin)} />
        <Metric label="Floating PnL" value={`${floatingPnl >= 0 ? "+" : ""}${formatMoney(floatingPnl)}`} tone={floatingPnl >= 0 ? "green" : "red"} />
        <Metric label="Margem livre" value={formatMoney(freeMargin)} />
        <Metric label="Posições" value={String(openPositions.length)} />
      </section>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] overflow-hidden">
        <section className="flex min-w-0 flex-col overflow-hidden p-3 pr-0">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-[#1e2a3a] bg-[#07111f] shadow-2xl">
            <MiniTerminalChart asset={selectedAsset} tick={tick} />
            <div className="absolute left-6 top-24 z-10">
              <button onClick={() => setAssetMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-xl border border-[#334155] bg-[#0a0e1a]/90 px-4 py-2 font-mono text-sm font-bold text-white shadow-xl">
                {selectedAsset.label}<ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {assetMenuOpen && (
                <div className="mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border border-[#1e2a3a] bg-[#0a0e1a] p-2 shadow-2xl">
                  {assets.map((asset) => <button key={asset.value} onClick={() => { setSelectedAsset(asset); setAssetMenuOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#1e2a3a]"><span><strong>{asset.label}</strong><span className="ml-2 text-xs text-slate-500">{asset.name}</span></span><span className={asset.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{asset.change}</span></button>)}
                </div>
              )}
            </div>
          </div>

          <div className={`${historyCollapsed ? "h-10" : "h-48"} mt-3 shrink-0 overflow-hidden rounded-2xl border border-[#1e2a3a] bg-[#0a0e1a] transition-all`}>
            <div className="flex items-center gap-4 border-b border-[#1e2a3a] px-4">
              <button onClick={() => setActiveTab("open")} className={`border-b-2 py-2 text-xs font-bold uppercase tracking-wider ${activeTab === "open" ? "border-primary text-white" : "border-transparent text-slate-500"}`}>Posições abertas ({openPositions.length})</button>
              <button onClick={() => setActiveTab("history")} className={`border-b-2 py-2 text-xs font-bold uppercase tracking-wider ${activeTab === "history" ? "border-primary text-white" : "border-transparent text-slate-500"}`}>Histórico ({closedPositions.length})</button>
              <button onClick={() => setHistoryCollapsed((value) => !value)} className="ml-auto text-xs text-slate-400 hover:text-white">{historyCollapsed ? "Expandir" : "Recolher"}</button>
              {openPositions.length > 0 && <button onClick={() => openPositions.forEach((position) => closePosition(position.id))} className="rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase text-red-400">Fechar Tudo</button>}
            </div>
            {!historyCollapsed && <OrdersTable rows={rows} activeTab={activeTab} onClose={closePosition} />}
          </div>
        </section>

        <button onClick={() => setOrderPanelOpen((value) => !value)} className="w-6 border-l border-[#1e2a3a] bg-[#0a0e1a] text-slate-500 hover:bg-[#1e2a3a]">{orderPanelOpen ? <ChevronRight className="mx-auto h-4 w-4" /> : <ChevronLeft className="mx-auto h-4 w-4" />}</button>

        {orderPanelOpen && (
          <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-[#1e2a3a] bg-[#0a0e1a] p-4">
            <div className="rounded-3xl border border-[#1e2a3a] bg-[#050a14] p-5 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Ordem de mercado</p>
              <h2 className="mt-1 text-2xl font-black">{selectedAsset.label}</h2>
              <p className="mt-1 text-sm text-slate-400">Preço: <strong className="text-white tabular-nums">{formatPrice(price, selectedAsset.decimals)}</strong></p>

              <div className="mt-5 space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Lot size</label>
                  <input value={lotSize} onChange={(event) => setLotSize(event.target.value)} className="mt-1 w-full rounded-xl border border-[#1e2a3a] bg-[#07111f] px-3 py-3 text-sm font-bold outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-red-400">Stop Loss</label><input value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} placeholder="0.00000" className="mt-1 w-full rounded-xl border border-[#1e2a3a] bg-[#07111f] px-3 py-3 text-xs font-mono outline-none" /></div>
                  <div><label className="text-xs text-emerald-400">Take Profit</label><input value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} placeholder="0.00000" className="mt-1 w-full rounded-xl border border-[#1e2a3a] bg-[#07111f] px-3 py-3 text-xs font-mono outline-none" /></div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[#1e2a3a] bg-[#07111f] p-3 text-center text-sm">
                <div><p className="text-xs text-slate-500">Valor operação</p><p className="font-black">{formatMoney(operationValue)}</p></div>
                <div><p className="text-xs text-slate-500">Margem est.</p><p className="font-black">{formatMoney(estimatedMargin)}</p></div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => sendOrder("BUY")} className="rounded-2xl bg-emerald-500 px-4 py-5 text-lg font-black text-white shadow-lg hover:bg-emerald-400">BUY</button>
                <button onClick={() => sendOrder("SELL")} className="rounded-2xl bg-red-500 px-4 py-5 text-lg font-black text-white shadow-lg hover:bg-red-400">SELL</button>
              </div>
              <p className="mt-4 rounded-2xl border border-[#1e2a3a] bg-[#07111f] p-3 text-xs text-slate-400">{lastAction}</p>
            </div>

            <div className="mt-3 rounded-3xl border border-[#1e2a3a] bg-[#050a14] p-5 shadow-xl">
              <Wallet className="mb-3 h-6 w-6 text-primary" />
              <p className="text-sm text-slate-400">Conta QuantFund</p>
              <p className="text-4xl font-black">{formatMoney(equity)}</p>
              <p className={`mt-1 text-sm ${floatingPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{floatingPnl >= 0 ? "+" : ""}{formatMoney(floatingPnl)} floating PnL</p>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" }) {
  return <div className="rounded-2xl border border-[#1e2a3a] bg-[#0a0e1a] px-4 py-3 shadow-xl"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-xl font-black ${tone === "green" ? "text-emerald-400" : tone === "red" ? "text-red-400" : ""}`}>{value}</p></div>;
}

function OrdersTable({ rows, activeTab, onClose }: { rows: Position[]; activeTab: Tab; onClose: (id: string) => void }) {
  return (
    <div className="h-[calc(100%-37px)] overflow-y-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-[#0a0e1a] text-left text-slate-500"><tr><th className="px-3 py-2">Symbol</th><th>Side</th><th className="text-right">Lots</th><th className="text-right">Entry</th><th className="text-right">Current/Close</th><th className="text-right">SL</th><th className="text-right">TP</th><th className="text-right">PnL</th><th className="pr-3 text-right">Action</th></tr></thead>
        <tbody>
          {rows.map((position) => <tr key={position.id} className="border-t border-[#1e2a3a]/60 hover:bg-[#1e2a3a]/20"><td className="px-3 py-2 font-bold">{position.symbol}</td><td><span className={position.side === "BUY" ? "text-emerald-400" : "text-red-400"}>{position.side}</span></td><td className="text-right font-mono">{position.lots.toFixed(2)}</td><td className="text-right font-mono">{position.entry.toFixed(5)}</td><td className="text-right font-mono">{position.current.toFixed(5)}</td><td className="text-right font-mono text-red-300">{position.stopLoss ? position.stopLoss.toFixed(5) : "—"}</td><td className="text-right font-mono text-emerald-300">{position.takeProfit ? position.takeProfit.toFixed(5) : "—"}</td><td className={`text-right font-mono font-bold ${position.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{position.pnl >= 0 ? "+" : ""}{formatMoney(position.pnl)}</td><td className="pr-3 text-right">{position.status === "open" ? <button onClick={() => onClose(position.id)} className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:border-red-500 hover:text-red-400">Fechar</button> : <span className="text-slate-500">{position.reason ?? "Manual"}</span>}</td></tr>)}
          {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">{activeTab === "open" ? "Sem posições abertas" : "Sem histórico de negociação"}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
