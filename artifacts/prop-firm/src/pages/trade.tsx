import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { UserButton, useUser } from "@clerk/react";
import { toast } from "sonner";

type Side = "buy" | "sell";
type Status = "open" | "closed";
type Asset = { symbol: string; label: string; group: string; base: number; decimals: number; multiplier: number; tv: string };
type TradeOrder = { id: string; serverId?: number; symbol: string; side: Side; size: number; openPrice: number; closePrice?: number; currentPrice: number; pnl: number; status: Status; stopLoss?: number; takeProfit?: number; openedAt: string; closedAt?: string; reason?: string };
type ChallengeData = { id: number; plan_name?: string; planName?: string; account_size?: string; accountSize?: string; balance: string; equity: string; status: string };
type AccountData = { id: number; currentBalance?: string; current_balance?: string; equity?: string };

const API_URL = import.meta.env.VITE_API_URL || "/api";

const assets: Asset[] = [
  { symbol: "EURUSD", label: "EUR/USD", group: "Forex", base: 1.0842, decimals: 5, multiplier: 100000, tv: "FX:EURUSD" },
  { symbol: "GBPUSD", label: "GBP/USD", group: "Forex", base: 1.2710, decimals: 5, multiplier: 100000, tv: "FX:GBPUSD" },
  { symbol: "USDJPY", label: "USD/JPY", group: "Forex", base: 156.82, decimals: 3, multiplier: 100000, tv: "FX:USDJPY" },
  { symbol: "USDCHF", label: "USD/CHF", group: "Forex", base: 0.9124, decimals: 5, multiplier: 100000, tv: "FX:USDCHF" },
  { symbol: "AUDUSD", label: "AUD/USD", group: "Forex", base: 0.6631, decimals: 5, multiplier: 100000, tv: "FX:AUDUSD" },
  { symbol: "NZDUSD", label: "NZD/USD", group: "Forex", base: 0.6110, decimals: 5, multiplier: 100000, tv: "FX:NZDUSD" },
  { symbol: "EURGBP", label: "EUR/GBP", group: "Forex", base: 0.8530, decimals: 5, multiplier: 100000, tv: "FX:EURGBP" },
  { symbol: "XAUUSD", label: "XAU/USD Gold", group: "Metals", base: 2356.4, decimals: 2, multiplier: 100, tv: "OANDA:XAUUSD" },
  { symbol: "XAGUSD", label: "XAG/USD Silver", group: "Metals", base: 30.12, decimals: 3, multiplier: 5000, tv: "OANDA:XAGUSD" },
  { symbol: "BTCUSD", label: "BTC/USD", group: "Crypto", base: 67420, decimals: 2, multiplier: 1, tv: "BINANCE:BTCUSDT" },
  { symbol: "ETHUSD", label: "ETH/USD", group: "Crypto", base: 3520.8, decimals: 2, multiplier: 1, tv: "BINANCE:ETHUSDT" },
  { symbol: "NAS100", label: "NASDAQ 100", group: "Indices", base: 18724.2, decimals: 2, multiplier: 10, tv: "NASDAQ:NDX" },
  { symbol: "US30", label: "Dow Jones 30", group: "Indices", base: 39128.6, decimals: 2, multiplier: 10, tv: "DJ:DJI" },
  { symbol: "SP500", label: "S&P 500", group: "Indices", base: 5304.1, decimals: 2, multiplier: 10, tv: "SP:SPX" },
  { symbol: "CRUDE", label: "Crude Oil", group: "Commodities", base: 78.42, decimals: 2, multiplier: 1000, tv: "TVC:USOIL" },
];

const demoPlan = { name: "Demo Account", balance: 10000, label: "$10K" };
const timeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];

function assetFor(symbol: string) { return assets.find((asset) => asset.symbol === symbol) ?? assets[0]; }
function livePrice(symbol: string, tick: number) { const asset = assetFor(symbol); return Math.max(0.00001, asset.base + Math.sin(tick / 3 + asset.base) * asset.base * 0.00065 + Math.cos(tick / 7 + asset.symbol.length) * asset.base * 0.00035); }
function money(value: number) { return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }); }
function priceText(symbol: string, value: number) { return value.toFixed(assetFor(symbol).decimals); }
function nowText() { return new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }
function orderPnl(order: TradeOrder, tick: number) { const asset = assetFor(order.symbol); const current = livePrice(order.symbol, tick); const direction = order.side === "buy" ? 1 : -1; return (current - order.openPrice) * direction * order.size * asset.multiplier; }
function orderMargin(order: TradeOrder) { const asset = assetFor(order.symbol); return Math.max(1, (order.openPrice * order.size * asset.multiplier) / 100); }
function storageKey(userId: string | undefined, accountId: string) { return `quantfund-terminal-v6-${userId || "guest"}-${accountId}`; }
function challengePlanName(challenge: ChallengeData | null) { return challenge?.plan_name || challenge?.planName || demoPlan.name; }
function challengePlanLabel(challenge: ChallengeData | null) { return challenge?.account_size || challenge?.accountSize || demoPlan.label; }

function MiniChart({ symbol, tick }: { symbol: string; tick: number }) {
  const points = Array.from({ length: 90 }, (_, index) => livePrice(symbol, tick - 90 + index));
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(0.00001, max - min);
  const poly = points.map((point, index) => `${(index / 89) * 100},${95 - ((point - min) / range) * 82}`).join(" ");
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">{[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(71,85,105,.35)" strokeWidth=".2" />)}<polyline points={poly} fill="none" stroke="rgb(34,211,238)" strokeWidth=".7" vectorEffect="non-scaling-stroke" /></svg>;
}

export default function Trade() {
  const [, params] = useRoute("/trade/:accountId");
  const [, navigate] = useLocation();
  const accountId = params?.accountId ?? "1";
  const { user } = useUser();

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [virtualAccount, setVirtualAccount] = useState<AccountData | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [challengeError, setChallengeError] = useState("");
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("1H");
  const [tick, setTick] = useState(0);
  const [size, setSize] = useState("1.00");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [balance, setBalance] = useState(demoPlan.balance);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [tab, setTab] = useState<"positions" | "history">("positions");
  const [collapsed, setCollapsed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["EURUSD", "XAUUSD"]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showTradingView, setShowTradingView] = useState(true);

  useEffect(() => { const id = window.setInterval(() => setTick((value) => value + 1), 1000); return () => window.clearInterval(id); }, []);

  useEffect(() => {
    async function loadChallenge() {
      if (!user?.id || !accountId || accountId === "1") { setLoadingChallenge(false); return; }
      try {
        const res = await fetch(`${API_URL}/challenges/${accountId}`, { credentials: "include" });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Challenge não encontrado"); }
        const data = await res.json();
        if (data.challenge?.status !== "active") throw new Error("Este challenge não está ativo");
        setChallenge(data.challenge);
        setVirtualAccount(data.account || null);
        setBalance(Number.parseFloat(data.account?.currentBalance || data.account?.current_balance || data.challenge.balance || "10000"));
        if (Array.isArray(data.openOrders)) {
          setOrders(data.openOrders.map((order: any) => ({ id: String(order.id), serverId: order.id, symbol: order.symbol, side: order.side, size: Number(order.size), openPrice: Number(order.openPrice || order.open_price), currentPrice: Number(order.openPrice || order.open_price), pnl: Number(order.pnl || 0), stopLoss: order.stopLoss ? Number(order.stopLoss) : order.stop_loss ? Number(order.stop_loss) : undefined, takeProfit: order.takeProfit ? Number(order.takeProfit) : order.take_profit ? Number(order.take_profit) : undefined, status: order.status || "open", openedAt: order.openedAt || order.opened_at || nowText() })));
        }
      } catch (err: any) {
        const message = err.message || "Erro ao carregar terminal";
        setChallengeError(message);
        toast.error(message);
        setTimeout(() => navigate("/terminal"), 3000);
      } finally { setLoadingChallenge(false); }
    }
    loadChallenge();
  }, [user?.id, accountId, navigate]);

  useEffect(() => {
    if (accountId !== "1") return;
    const raw = localStorage.getItem(storageKey(user?.id, accountId));
    if (!raw) return;
    try { const saved = JSON.parse(raw) as { balance?: number; orders?: TradeOrder[]; favorites?: string[] }; setBalance(saved.balance ?? demoPlan.balance); setOrders(saved.orders ?? []); setFavorites(saved.favorites ?? ["EURUSD", "XAUUSD"]); } catch {}
  }, [user?.id, accountId]);

  const pricedOrders = useMemo(() => orders.map((order) => order.status === "open" ? { ...order, currentPrice: livePrice(order.symbol, tick), pnl: orderPnl(order, tick) } : order), [orders, tick]);

  useEffect(() => { localStorage.setItem(storageKey(user?.id, accountId), JSON.stringify({ balance, orders: pricedOrders, favorites, savedAt: new Date().toISOString() })); }, [user?.id, accountId, balance, pricedOrders, favorites]);

  const currentPrice = livePrice(symbol, tick);
  const openOrders = pricedOrders.filter((order) => order.status === "open");
  const closedOrders = pricedOrders.filter((order) => order.status === "closed");
  const floatingPnl = openOrders.reduce((sum, order) => sum + order.pnl, 0);
  const realizedPnl = closedOrders.reduce((sum, order) => sum + order.pnl, 0);
  const usedMargin = openOrders.reduce((sum, order) => sum + orderMargin(order), 0);
  const equity = balance + floatingPnl;
  const freeMargin = equity - usedMargin;
  const planBalance = challenge ? Number.parseFloat(challenge.balance || "10000") : demoPlan.balance;
  const target = planBalance * 0.1;
  const totalDrawdown = Math.max(0, planBalance - equity);
  const challengeStatus = totalDrawdown >= planBalance * 0.1 ? "Failed" : equity - planBalance >= target ? "Passed" : "In Progress";
  const selectedAsset = assetFor(symbol);
  const filteredAssets = assets.filter((asset) => `${asset.symbol} ${asset.label} ${asset.group}`.toLowerCase().includes(query.toLowerCase()));
  const categories = [...new Set(filteredAssets.map((asset) => asset.group))];
  const favoriteAssets = assets.filter((asset) => favorites.includes(asset.symbol));
  const winRate = closedOrders.length ? Math.round((closedOrders.filter((order) => order.pnl > 0).length / closedOrders.length) * 100) : 0;
  const tvInterval = timeframe === "1H" ? "60" : timeframe.replace("m", "");
  const tvUrl = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(selectedAsset.tv)}&interval=${encodeURIComponent(tvInterval)}&theme=dark&style=1&timezone=Europe%2FLisbon&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&save_image=0&locale=pt`;

  useEffect(() => {
    async function syncToBackend() {
      if (!accountId || accountId === "1" || !user?.id || !challenge) return;
      try { await fetch(`${API_URL}/challenges/${accountId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ balance: balance.toString(), equity: equity.toString() }) }); } catch {}
    }
    const interval = window.setInterval(syncToBackend, 30000);
    return () => window.clearInterval(interval);
  }, [accountId, user?.id, balance, equity, challenge]);

  function toggleFavorite(assetSymbol: string, event: React.MouseEvent) { event.stopPropagation(); setFavorites((value) => (value.includes(assetSymbol) ? value.filter((item) => item !== assetSymbol) : [...value, assetSymbol])); }

  function openOrder(side: Side) {
    const lots = Math.max(0.01, Number(size) || 0.01);
    const localId = crypto.randomUUID();
    const order: TradeOrder = { id: localId, symbol, side, size: lots, openPrice: currentPrice, currentPrice, pnl: 0, stopLoss: Number(sl) || undefined, takeProfit: Number(tp) || undefined, status: "open", openedAt: nowText() };
    setOrders((value) => [order, ...value]);
    if (accountId !== "1" && user?.id) {
      fetch(`${API_URL}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ challengeId: Number(accountId), accountId: virtualAccount?.id || Number(accountId), symbol, side, size: lots, openPrice: currentPrice, stopLoss: Number(sl) || undefined, takeProfit: Number(tp) || undefined }) })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data?.order?.id) setOrders((value) => value.map((item) => item.id === localId ? { ...item, id: String(data.order.id), serverId: data.order.id } : item)); })
        .catch(() => undefined);
    }
  }

  function closeOrder(orderId: string, reason = "Manual") {
    const order = pricedOrders.find((item) => item.id === orderId);
    if (!order || order.status !== "open") return;
    const closePrice = livePrice(order.symbol, tick);
    const pnl = orderPnl(order, tick);
    setBalance((value) => value + pnl);
    setOrders((value) => value.map((item) => item.id === orderId ? { ...item, currentPrice: closePrice, closePrice, pnl, status: "closed", closedAt: nowText(), reason } : item));
    if (accountId !== "1" && user?.id && order.serverId) {
      fetch(`${API_URL}/orders/${order.serverId}/close`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ closePrice, reason }) }).catch(() => undefined);
    }
  }

  function resetTerminal() { setBalance(planBalance); setOrders([]); setSl(""); setTp(""); }

  useEffect(() => { for (const order of openOrders) { if (order.side === "buy" && order.stopLoss && order.currentPrice <= order.stopLoss) closeOrder(order.id, "SL"); if (order.side === "buy" && order.takeProfit && order.currentPrice >= order.takeProfit) closeOrder(order.id, "TP"); if (order.side === "sell" && order.stopLoss && order.currentPrice >= order.stopLoss) closeOrder(order.id, "SL"); if (order.side === "sell" && order.takeProfit && order.currentPrice <= order.takeProfit) closeOrder(order.id, "TP"); } }, [tick]);

  if (loadingChallenge) return <div className="flex h-screen items-center justify-center bg-[#050a14] text-white"><div className="text-center"><div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" /><p className="text-slate-400">A carregar terminal...</p></div></div>;
  if (challengeError) return <div className="flex h-screen items-center justify-center bg-[#050a14] text-white"><div className="max-w-md text-center"><div className="mb-4 text-4xl text-red-400">⚠️</div><h2 className="mb-2 text-2xl font-bold">Erro</h2><p className="mb-6 text-slate-400">{challengeError}</p><p className="text-sm text-slate-500">A redirecionar...</p></div></div>;

  const rows = tab === "positions" ? openOrders : closedOrders;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050a14] text-white">
      <div className="flex h-8 shrink-0 items-center gap-7 overflow-hidden border-b border-[#1e2a3a] bg-[#0a0e1a] px-4 font-mono text-xs">
        {assets.slice(0, 11).map((asset) => { const diff = livePrice(asset.symbol, tick) - asset.base; return <button key={asset.symbol} onClick={() => setSymbol(asset.symbol)} className="flex items-center gap-2 whitespace-nowrap"><span className="text-slate-300">{asset.symbol}</span><span className={diff >= 0 ? "text-green-400" : "text-red-400"}>{diff >= 0 ? "+" : ""}{diff.toFixed(asset.decimals)}</span></button>; })}
      </div>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1e2a3a] bg-[#0a0e1a] px-4">
        <div className="flex items-center gap-4"><Link href="/terminal" className="flex items-center gap-2 hover:opacity-80"><img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="h-7 w-7" /><span className="hidden text-sm font-bold sm:block">QuantFund</span></Link><Link href="/terminal" className="text-xs text-slate-400 hover:text-white">Menu</Link><strong className="font-mono text-xl">{symbol}</strong><span className="font-mono text-lg text-emerald-300">{priceText(symbol, currentPrice)}</span><div className="flex gap-1">{timeframes.map((tf) => <button key={tf} onClick={() => setTimeframe(tf)} className={`rounded px-2 py-1 font-mono text-xs ${timeframe === tf ? "bg-cyan-500 text-white" : "text-slate-500 hover:bg-slate-800 hover:text-white"}`}>{tf}</button>)}</div></div>
        <div className="flex items-center gap-5 text-sm"><Metric label="Account" value={`${challengePlanName(challenge)} ${challengePlanLabel(challenge)}`} /><Metric label="Equity" value={money(equity)} /><Metric label="Float PnL" value={`${floatingPnl >= 0 ? "+" : ""}${money(floatingPnl)}`} tone={floatingPnl >= 0 ? "green" : "red"} /><button onClick={resetTerminal} className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:text-white">Reset</button><UserButton afterSignOutUrl="/" /></div>
      </header>
      <div className="flex shrink-0 border-b border-[#1e2a3a] bg-[#050a14] font-mono text-[11px]"><Progress label="Target 10%" value={Math.max(0, equity - planBalance)} max={target} color="bg-blue-500" /><Progress label="Max DD" value={totalDrawdown} max={planBalance * 0.1} color="bg-red-500" /><div className="flex min-w-[180px] items-center gap-2 px-3 py-1.5"><span className="text-slate-500">Status</span><strong className={challengeStatus === "Passed" ? "text-green-400" : challengeStatus === "Failed" ? "text-red-400" : "text-yellow-300"}>{challengeStatus}</strong></div></div>
      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden"><div className="relative min-h-0 flex-1 bg-[#07111f]"><MiniChart symbol={symbol} tick={tick} />{showTradingView && <iframe title="TradingView Live Chart" src={tvUrl} className="absolute inset-0 h-full w-full border-0" allowFullScreen />}<button onClick={() => setShowTradingView((value) => !value)} className="absolute right-4 top-4 rounded-lg border border-slate-700 bg-[#0a0e1a]/90 px-3 py-2 text-xs text-slate-300 hover:text-white">{showTradingView ? "Fallback chart" : "TradingView"}</button></div><div className={`${collapsed ? "h-10" : "h-44"} shrink-0 border-t border-[#1e2a3a] bg-[#0a0e1a] transition-all`}><div className="flex items-center gap-4 border-b border-[#1e2a3a] px-4"><TabButton active={tab === "positions"} onClick={() => setTab("positions")}>Posições Abertas ({openOrders.length})</TabButton><TabButton active={tab === "history"} onClick={() => setTab("history")}>Histórico ({closedOrders.length})</TabButton><button onClick={() => setCollapsed((value) => !value)} className="ml-auto text-xs text-slate-400 hover:text-white">{collapsed ? "Expandir" : "Recolher"}</button>{openOrders.length > 0 && <button onClick={() => openOrders.forEach((order) => closeOrder(order.id))} className="rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase text-red-400">Fechar Tudo</button>}</div>{!collapsed && <OrdersTable rows={rows} tab={tab} tick={tick} onClose={closeOrder} />}</div></section>
        <button onClick={() => setPanelOpen((value) => !value)} className="w-6 shrink-0 border-l border-[#1e2a3a] bg-[#0a0e1a] text-slate-500 hover:bg-[#1e2a3a]">{panelOpen ? ">" : "<"}</button>
        {panelOpen && <aside className="flex w-72 shrink-0 flex-col border-l border-[#1e2a3a] bg-[#0a0e1a]"><div className="border-b border-[#1e2a3a] p-4"><h3 className="mb-3 text-sm font-semibold">Nova Ordem</h3><div className="space-y-3"><div className="relative"><label className="mb-1 block text-[11px] uppercase tracking-wider text-slate-500">Instrumento</label><button onClick={() => setSelectorOpen((value) => !value)} className="flex h-9 w-full items-center justify-between rounded border border-[#1e2a3a] bg-[#050a14] px-3 text-left font-mono text-sm font-semibold">{symbol}<span>⌄</span></button>{selectorOpen && <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[#1e2a3a] bg-[#0d1526] shadow-xl"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar instrumento..." className="w-full border-b border-[#1e2a3a] bg-transparent px-3 py-2 text-xs outline-none" /><div className="max-h-64 overflow-y-auto py-1">{!query && favoriteAssets.length > 0 && <AssetGroup title="Favoritos" items={favoriteAssets} symbol={symbol} favorites={favorites} onPick={setSymbolAndClose} onStar={toggleFavorite} />}{categories.map((category) => <AssetGroup key={category} title={category} items={filteredAssets.filter((asset) => asset.group === category)} symbol={symbol} favorites={favorites} onPick={setSymbolAndClose} onStar={toggleFavorite} />)}</div></div>}</div><label className="block text-[11px] uppercase tracking-wider text-slate-500">Volume (Lotes)</label><div className="flex gap-2"><button onClick={() => setSize((Math.max(0.01, Number(size) - 0.1)).toFixed(2))} className="h-9 w-9 rounded border border-[#1e2a3a] bg-[#050a14]">-</button><input value={size} onChange={(event) => setSize(event.target.value)} className="h-9 w-full rounded border border-[#1e2a3a] bg-[#050a14] text-center font-mono" /><button onClick={() => setSize((Number(size) + 0.1).toFixed(2))} className="h-9 w-9 rounded border border-[#1e2a3a] bg-[#050a14]">+</button></div><div className="grid grid-cols-2 gap-2"><Field label="Stop Loss" value={sl} setValue={setSl} tone="red" /><Field label="Take Profit" value={tp} setValue={setTp} tone="green" /></div><div className="grid grid-cols-2 gap-2 pt-1"><button onClick={() => openOrder("sell")} className="h-14 rounded-lg bg-red-500 text-sm font-black text-white hover:bg-red-600">VENDER<br /><span className="font-mono text-xs">{priceText(symbol, currentPrice)}</span></button><button onClick={() => openOrder("buy")} className="h-14 rounded-lg bg-green-500 text-sm font-black text-white hover:bg-green-600">COMPRAR<br /><span className="font-mono text-xs">{priceText(symbol, currentPrice)}</span></button></div></div></div><div className="grid grid-cols-2 gap-3 p-4 text-xs"><Stat label="Account Value" value={money(planBalance)} /><Stat label="Balance" value={money(balance)} /><Stat label="Equity" value={money(equity)} /><Stat label="Free Margin" value={money(freeMargin)} /><Stat label="Used Margin" value={money(usedMargin)} /><Stat label="Win Rate" value={`${winRate}%`} /><div className="col-span-2 rounded-lg border border-[#1e2a3a] bg-[#050a14] p-3"><p className="mb-1 text-[10px] uppercase text-slate-500">Challenge Monitor</p><strong className={challengeStatus === "Passed" ? "text-green-400" : challengeStatus === "Failed" ? "text-red-400" : "text-yellow-300"}>{challengeStatus}</strong><p className="mt-2 text-slate-500">Floating: <span className={floatingPnl >= 0 ? "text-green-400" : "text-red-400"}>{floatingPnl >= 0 ? "+" : ""}{money(floatingPnl)}</span></p><p className="text-slate-500">Realized: <span className={realizedPnl >= 0 ? "text-green-400" : "text-red-400"}>{realizedPnl >= 0 ? "+" : ""}{money(realizedPnl)}</span></p></div></div></aside>}
      </main>
    </div>
  );

  function setSymbolAndClose(next: string) { setSymbol(next); setSelectorOpen(false); setQuery(""); }
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" }) { return <div className="hidden flex-col items-end md:flex"><span className="text-xs text-slate-500">{label}</span><span className={`font-mono font-semibold ${tone === "green" ? "text-green-400" : tone === "red" ? "text-red-400" : ""}`}>{value}</span></div>; }
function Progress({ label, value, max, color }: { label: string; value: number; max: number; color: string }) { return <div className="flex min-w-[210px] items-center gap-2 border-r border-[#1e2a3a] px-3 py-1.5"><span className="text-slate-500">{label}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1e2a3a]"><div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }} /></div><span>{money(value)} / {money(max)}</span></div>; }
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`border-b-2 py-2 text-xs font-semibold uppercase tracking-wider ${active ? "border-cyan-400 text-white" : "border-transparent text-slate-500 hover:text-white"}`}>{children}</button>; }
function OrdersTable({ rows, tab, tick, onClose }: { rows: TradeOrder[]; tab: "positions" | "history"; tick: number; onClose: (id: string) => void }) { return <div className="h-[calc(100%-37px)] overflow-y-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-[#0a0e1a] text-left text-slate-500"><tr><th className="px-3 py-1.5">Symbol</th><th>Side</th><th className="text-right">Size</th><th className="text-right">Open</th><th className="text-right">Current/Close</th><th className="text-right">PnL</th><th className="pr-3 text-right">Action</th></tr></thead><tbody>{rows.map((order) => { const current = order.status === "open" ? livePrice(order.symbol, tick) : order.closePrice ?? order.currentPrice; return <tr key={order.id} className="border-t border-[#1e2a3a]/50 hover:bg-[#1e2a3a]/20"><td className="px-3 py-1.5 font-semibold">{order.symbol}</td><td><span className={order.side === "buy" ? "text-green-400" : "text-red-400"}>{order.side.toUpperCase()}</span></td><td className="text-right font-mono">{order.size.toFixed(2)}</td><td className="text-right font-mono">{priceText(order.symbol, order.openPrice)}</td><td className="text-right font-mono">{priceText(order.symbol, current)}</td><td className={`text-right font-mono font-semibold ${order.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{order.pnl >= 0 ? "+" : ""}{money(order.pnl)}</td><td className="pr-3 text-right">{order.status === "open" ? <button onClick={() => onClose(order.id)} className="rounded border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400 hover:border-red-500 hover:text-red-400">Fechar</button> : <span className="text-slate-500">{order.reason ?? "Manual"}</span>}</td></tr>; })}{rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">{tab === "positions" ? "Sem posições abertas" : "Sem histórico de negociação"}</td></tr>}</tbody></table></div>; }
function AssetGroup({ title, items, symbol, favorites, onPick, onStar }: { title: string; items: Asset[]; symbol: string; favorites: string[]; onPick: (symbol: string) => void; onStar: (symbol: string, event: React.MouseEvent) => void }) { return <div><div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>{items.map((asset) => <div key={`${title}-${asset.symbol}`} className={`flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#1e2a3a] ${symbol === asset.symbol ? "text-cyan-300" : "text-slate-300"}`}><button onClick={(event) => onStar(asset.symbol, event)} className={favorites.includes(asset.symbol) ? "text-yellow-400" : "text-slate-600"}>★</button><button onClick={() => onPick(asset.symbol)} className="flex flex-1 justify-between"><span className="font-mono font-semibold">{asset.symbol}</span><span className="text-[10px] text-slate-500">{asset.label}</span></button></div>)}</div>; }
function Field({ label, value, setValue, tone }: { label: string; value: string; setValue: (value: string) => void; tone: "red" | "green" }) { return <div><label className={`mb-1 block text-[11px] uppercase tracking-wider ${tone === "red" ? "text-red-400" : "text-green-400"}`}>{label}</label><input type="number" step="any" placeholder="0.00000" value={value} onChange={(event) => setValue(event.target.value)} className="h-8 w-full rounded border border-[#1e2a3a] bg-[#050a14] text-center font-mono text-xs outline-none" /></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-[#1e2a3a] bg-[#050a14] p-3"><div className="mb-1 text-[10px] uppercase text-slate-500">{label}</div><div className="font-mono font-semibold">{value}</div></div>; }
