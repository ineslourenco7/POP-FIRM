import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { UserButton } from "@clerk/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
  Clock,
  Layers,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TradingViewChart from "@/components/TradingViewChart";

type Side = "BUY" | "SELL";
type Tab = "open" | "history";
type Timeframe = "1" | "5" | "15" | "30" | "60" | "240" | "D" | "W";

type Asset = {
  label: string;
  name: string;
  value: string;
  base: number;
  decimals: number;
  multiplier: number;
  change: string;
  category: string;
  spread: number;
  commission: number;
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

type AccountData = {
  id: number;
  challengeName: string | null;
  status: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  floatingPnl: number;
  totalPnl: number;
  dailyPnl: number;
  profitTarget: number;
  maxDailyDrawdown: number;
  maxTotalDrawdown: number;
  minTradingDays: number;
  tradingDays: number;
  phase?: number;
  maxPhase?: number;
};

const assets: Asset[] = [
  { label: "EUR/USD", name: "Euro vs US Dollar", value: "OANDA:EURUSD", base: 1.0842, decimals: 5, multiplier: 100000, change: "+0.14%", category: "Forex", spread: 0.2, commission: 3.5 },
  { label: "GBP/USD", name: "Pound vs US Dollar", value: "OANDA:GBPUSD", base: 1.271, decimals: 5, multiplier: 100000, change: "-0.08%", category: "Forex", spread: 0.3, commission: 3.5 },
  { label: "USD/JPY", name: "US Dollar vs Yen", value: "OANDA:USDJPY", base: 156.82, decimals: 3, multiplier: 100000, change: "+0.22%", category: "Forex", spread: 0.2, commission: 3.5 },
  { label: "XAU/USD", name: "Gold", value: "OANDA:XAUUSD", base: 2356.4, decimals: 2, multiplier: 100, change: "+0.82%", category: "Metals", spread: 0.8, commission: 5 },
  { label: "BTC/USD", name: "Bitcoin", value: "BITSTAMP:BTCUSD", base: 67420, decimals: 2, multiplier: 1, change: "+1.94%", category: "Crypto", spread: 12, commission: 0 },
  { label: "ETH/USD", name: "Ethereum", value: "BITSTAMP:ETHUSD", base: 3520.8, decimals: 2, multiplier: 1, change: "+1.21%", category: "Crypto", spread: 8, commission: 0 },
  { label: "NAS100", name: "Nasdaq 100", value: "NASDAQ:NDX", base: 18724.2, decimals: 1, multiplier: 10, change: "+0.64%", category: "Indices", spread: 1, commission: 2 },
  { label: "US30", name: "Dow Jones 30", value: "DJ:DJI", base: 39128.6, decimals: 1, multiplier: 10, change: "-0.18%", category: "Indices", spread: 1.5, commission: 2 },
  { label: "SPX500", name: "S&P 500", value: "SP:SPX", base: 5304.1, decimals: 1, multiplier: 10, change: "+0.31%", category: "Indices", spread: 0.5, commission: 2 },
  { label: "USOIL", name: "WTI Crude Oil", value: "TVC:USOIL", base: 78.42, decimals: 2, multiplier: 1000, change: "+0.47%", category: "Commodities", spread: 0.4, commission: 3 },
];

const timeframes: { value: Timeframe; label: string }[] = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "30", label: "30m" },
  { value: "60", label: "1H" },
  { value: "240", label: "4H" },
  { value: "D", label: "1D" },
  { value: "W", label: "1W" },
];

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function priceText(value: number, decimals: number) {
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

function useAccount(accountId?: number) {
  return useQuery<AccountData>({
    queryKey: ["account", accountId],
    queryFn: async () => {
      if (!accountId) throw new Error("No account ID");
      const res = await fetch(`/api/accounts/${accountId}`);
      if (!res.ok) throw new Error("Failed to fetch account");
      return res.json();
    },
    enabled: !!accountId,
    refetchInterval: 5000,
  });
}

function useAccounts() {
  return useQuery<AccountData[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return res.json();
    },
  });
}

function ProgressBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  const percent = Math.min(Math.max((current / Math.max(max, 1)) * 100, 0), 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-[#5B6270]">{label}</span>
        <span className="text-white/70 font-mono">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-[#1E2330] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function AssetRow({ asset, selected, onClick, tick }: { asset: Asset; selected: boolean; onClick: () => void; tick: number }) {
  const price = floatingPrice(asset, tick);
  const isUp = asset.change.startsWith("+");
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 transition-all border-l-2 ${selected ? "bg-[#1A1F2E] border-l-[#2962FF]" : "bg-transparent border-l-transparent hover:bg-[#11141C]"}`}>
      <div className="flex items-center gap-2">
        <div className={`w-1 h-1 rounded-full ${isUp ? "bg-emerald-400" : "bg-rose-400"}`} />
        <div className="text-left">
          <div className={`text-xs font-semibold ${selected ? "text-white" : "text-[#A0A8B8]"}`}>{asset.label}</div>
          <div className="text-[10px] text-[#5B6270]">{asset.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-mono text-white">{priceText(price, asset.decimals)}</div>
        <div className={`text-[10px] font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>{asset.change}</div>
      </div>
    </button>
  );
}

function PositionCard({ position, tick, onClose }: { position: Position; tick: number; onClose: () => void }) {
  const pnl = positionPnl(position, tick);
  const asset = assets.find((a) => a.label === position.symbol) ?? assets[0];
  const current = floatingPrice(asset, tick);
  const isProfit = pnl >= 0;

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-3 hover:border-[#2A3040] transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${position.side === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>{position.side === "BUY" ? "L" : "S"}</div>
          <div>
            <div className="text-xs font-semibold text-white">{position.symbol}</div>
            <div className="text-[10px] text-[#5B6270]">{position.lots} lots</div>
          </div>
        </div>
        <button onClick={onClose} className="text-[#5B6270] hover:text-white transition p-1 rounded hover:bg-white/5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        <div><div className="text-[10px] text-[#5B6270]">Entry</div><div className="text-[11px] font-mono text-white">{priceText(position.entry, asset.decimals)}</div></div>
        <div><div className="text-[10px] text-[#5B6270]">Current</div><div className="text-[11px] font-mono text-white">{priceText(current, asset.decimals)}</div></div>
        <div className="text-right"><div className="text-[10px] text-[#5B6270]">P&L</div><div className={`text-[11px] font-mono font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>{isProfit ? "+" : ""}{money(pnl)}</div></div>
      </div>

      {(position.stopLoss || position.takeProfit) && (
        <div className="flex gap-3 text-[10px]">
          {position.stopLoss && <span className="text-rose-400/70">SL: {priceText(position.stopLoss, asset.decimals)}</span>}
          {position.takeProfit && <span className="text-emerald-400/70">TP: {priceText(position.takeProfit, asset.decimals)}</span>}
        </div>
      )}
    </div>
  );
}

export default function TerminalPage() {
  const [match, params] = useRoute("/terminal/:accountId");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [side, setSide] = useState<Side>("BUY");
  const [lots, setLots] = useState(0.01);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [tab, setTab] = useState<Tab>("open");
  const [positions, setPositions] = useState<Position[]>([]);
  const [tick, setTick] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>("15");
  const [searchQuery, setSearchQuery] = useState("");

  const accountId = match && params?.accountId ? parseInt(params.accountId) : undefined;
  const { data: account } = useAccount(accountId);
  const { data: accountsList } = useAccounts();
  const activeAccount = account || accountsList?.find((a) => a.status === "active");

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = floatingPrice(selectedAsset, tick);

  const openPosition = useCallback(() => {
    if (!activeAccount) return;
    const newPosition: Position = {
      id: Date.now().toString(),
      symbol: selectedAsset.label,
      side,
      lots,
      entry: currentPrice,
      current: currentPrice,
      pnl: 0,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      status: "open",
      openedAt: new Date().toISOString(),
    };
    setPositions((prev) => [newPosition, ...prev]);
  }, [activeAccount, selectedAsset, side, lots, currentPrice, stopLoss, takeProfit]);

  const closePosition = useCallback((id: string) => {
    setPositions((prev) => prev.map((p) => p.id === id ? { ...p, status: "closed", closedAt: new Date().toISOString(), reason: "Manual close" } : p));
  }, []);

  const openPositions = positions.filter((p) => p.status === "open");
  const closedPositions = positions.filter((p) => p.status === "closed");
  const totalFloatingPnl = openPositions.reduce((sum, p) => sum + positionPnl(p, tick), 0);

  const balance = activeAccount?.currentBalance ?? 100000;
  const initialBalance = activeAccount?.initialBalance ?? 100000;
  const equity = balance + totalFloatingPnl;
  const profitTarget = activeAccount?.profitTarget ?? initialBalance * 0.1;
  const maxDrawdown = activeAccount?.maxTotalDrawdown ?? initialBalance * 0.1;
  const totalPnl = activeAccount?.totalPnl ?? balance - initialBalance;
  const phase = activeAccount?.phase ?? 1;
  const maxPhase = activeAccount?.maxPhase ?? 2;

  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    return assets.filter((a) => a.label.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="h-screen bg-[#0B0E14] text-white flex flex-col overflow-hidden font-sans">
      <header className="h-14 bg-[#0E1118] border-b border-[#1E2330] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#5B6270] hover:text-white transition group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <div className="h-5 w-px bg-[#1E2330]" />
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2962FF]" />
            <h1 className="font-bold text-sm tracking-wide">POP<span className="text-[#5B6270] font-normal">TERMINAL</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {activeAccount ? (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 bg-[#11141C] border border-[#1E2330] rounded-lg px-3 py-1.5">
                <Layers className="w-3 h-3 text-[#2962FF]" />
                <span className="text-[10px] text-[#5B6270]">Phase</span>
                <span className="text-xs font-bold text-white">{phase}/{maxPhase}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><div className="text-[10px] text-[#5B6270] uppercase tracking-wider">Balance</div><div className="text-sm font-bold font-mono text-white">{money(balance)}</div></div>
                <div className="text-right"><div className="text-[10px] text-[#5B6270] uppercase tracking-wider">Equity</div><div className={`text-sm font-bold font-mono ${equity >= balance ? "text-emerald-400" : "text-rose-400"}`}>{money(equity)}</div></div>
                <div className="text-right"><div className="text-[10px] text-[#5B6270] uppercase tracking-wider">P&L</div><div className={`text-sm font-bold font-mono flex items-center gap-1 ${totalFloatingPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{totalFloatingPnl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{money(Math.abs(totalFloatingPnl))}</div></div>
              </div>
              <div className="w-40 space-y-1">
                <ProgressBar label="Profit Target" current={Math.max(totalPnl, 0)} max={profitTarget} color="bg-emerald-500" />
                <ProgressBar label="Drawdown" current={Math.max(initialBalance - balance, 0)} max={maxDrawdown} color="bg-rose-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#5B6270]"><Wallet className="w-4 h-4" /><span className="text-xs">No active account</span></div>
          )}

          <div className="h-5 w-px bg-[#1E2330]" />
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#5B6270] hover:text-white hover:bg-[#1E2330] rounded-lg transition"><Bell className="w-4 h-4" /></button>
            <button className="p-2 text-[#5B6270] hover:text-white hover:bg-[#1E2330] rounded-lg transition"><Settings className="w-4 h-4" /></button>
            <div className="h-5 w-px bg-[#1E2330]" />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-[#0E1118] border-r border-[#1E2330] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#1E2330]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5B6270]" />
              <input type="text" placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#11141C] border border-[#1E2330] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#5B6270] focus:outline-none focus:border-[#2962FF] transition" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#5B6270] font-medium">Popular</div>
            {filteredAssets.map((asset) => <AssetRow key={asset.label} asset={asset} selected={selectedAsset.label === asset.label} onClick={() => setSelectedAsset(asset)} tick={tick} />)}
          </div>
          <div className="p-3 border-t border-[#1E2330] space-y-2">
            <div className="flex justify-between text-[10px]"><span className="text-[#5B6270]">Spread</span><span className="text-white font-mono">{selectedAsset.spread} pips</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-[#5B6270]">Commission</span><span className="text-white font-mono">${selectedAsset.commission}/lot</span></div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-11 bg-[#0E1118] border-b border-[#1E2330] flex items-center px-4 gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-white">{selectedAsset.label}</div>
              <div className="text-[10px] text-[#5B6270]">{selectedAsset.name}</div>
              <div className="h-4 w-px bg-[#1E2330]" />
              <div className="text-lg font-mono font-bold text-white">{priceText(currentPrice, selectedAsset.decimals)}</div>
              <div className={`text-xs font-medium px-2 py-0.5 rounded ${selectedAsset.change.startsWith("+") ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>{selectedAsset.change}</div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-0.5 bg-[#11141C] rounded-lg p-0.5">
              {timeframes.map((tf) => <button key={tf.value} onClick={() => setTimeframe(tf.value)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${timeframe === tf.value ? "bg-[#2962FF] text-white" : "text-[#5B6270] hover:text-white"}`}>{tf.label}</button>)}
            </div>
          </div>
          <div className="flex-1 relative min-h-0 bg-[#0B0E14]">
            <TradingViewChart symbol={selectedAsset.value} interval={timeframe} />
          </div>
        </main>

        <aside className="w-80 bg-[#0E1118] border-l border-[#1E2330] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#1E2330]">
            <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6270]">New Order</h3><div className="flex items-center gap-1 text-[10px] text-[#5B6270]"><Zap className="w-3 h-3" />{selectedAsset.label}</div></div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setSide("BUY")} className={`py-2.5 rounded-xl font-bold text-sm transition-all ${side === "BUY" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-[#11141C] text-[#5B6270] border border-[#1E2330] hover:border-emerald-500/30"}`}><TrendingUp className="w-4 h-4 inline mr-1.5" />BUY</button>
              <button onClick={() => setSide("SELL")} className={`py-2.5 rounded-xl font-bold text-sm transition-all ${side === "SELL" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-[#11141C] text-[#5B6270] border border-[#1E2330] hover:border-rose-500/30"}`}><TrendingDown className="w-4 h-4 inline mr-1.5" />SELL</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-[10px] uppercase tracking-wider text-[#5B6270] mb-1.5 block">Volume (Lots)</label><div className="flex items-center gap-1"><button onClick={() => setLots(Math.max(0.01, lots - 0.01))} className="w-9 h-9 rounded-lg bg-[#11141C] border border-[#1E2330] hover:border-[#2962FF] flex items-center justify-center text-white/70 hover:text-white transition">−</button><input type="number" value={lots} onChange={(e) => setLots(parseFloat(e.target.value) || 0)} className="flex-1 bg-[#11141C] border border-[#1E2330] rounded-lg px-3 py-2 text-center font-mono text-sm text-white focus:outline-none focus:border-[#2962FF] transition" step="0.01" min="0.01" /><button onClick={() => setLots(lots + 0.01)} className="w-9 h-9 rounded-lg bg-[#11141C] border border-[#1E2330] hover:border-[#2962FF] flex items-center justify-center text-white/70 hover:text-white transition">+</button></div></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] uppercase tracking-wider text-[#5B6270] mb-1.5 block">Stop Loss</label><input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="0.00000" className="w-full bg-[#11141C] border border-[#1E2330] rounded-lg px-3 py-2 font-mono text-sm text-white placeholder-[#5B6270] focus:outline-none focus:border-[#2962FF] transition" /></div>
                <div><label className="text-[10px] uppercase tracking-wider text-[#5B6270] mb-1.5 block">Take Profit</label><input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="0.00000" className="w-full bg-[#11141C] border border-[#1E2330] rounded-lg px-3 py-2 font-mono text-sm text-white placeholder-[#5B6270] focus:outline-none focus:border-[#2962FF] transition" /></div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#11141C] rounded-xl border border-[#1E2330] space-y-2">
              <div className="flex justify-between text-[11px]"><span className="text-[#5B6270]">Margin Required</span><span className="text-white font-mono">{money((currentPrice * lots * selectedAsset.multiplier) / 100)}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[#5B6270]">Pip Value</span><span className="text-white font-mono">${(lots * 10).toFixed(2)}</span></div>
              <div className="border-t border-[#1E2330] pt-2"><div className="flex justify-between text-[11px]"><span className="text-[#5B6270]">Free Margin</span><span className="text-emerald-400 font-mono">{money(equity - (currentPrice * lots * selectedAsset.multiplier) / 100)}</span></div></div>
            </div>
            <button onClick={openPosition} disabled={!activeAccount} className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${side === "BUY" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"} ${!activeAccount ? "opacity-50 cursor-not-allowed" : ""}`}>{side} {selectedAsset.label} @ {priceText(currentPrice, selectedAsset.decimals)}</button>
          </div>

          <div className="flex border-b border-[#1E2330]">
            <button onClick={() => setTab("open")} className={`flex-1 py-3 text-xs font-semibold transition relative ${tab === "open" ? "text-white" : "text-[#5B6270] hover:text-white"}`}>Open ({openPositions.length}){tab === "open" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962FF]" />}</button>
            <button onClick={() => setTab("history")} className={`flex-1 py-3 text-xs font-semibold transition relative ${tab === "history" ? "text-white" : "text-[#5B6270] hover:text-white"}`}>History ({closedPositions.length}){tab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962FF]" />}</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {tab === "open" ? (
              openPositions.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-[#5B6270]"><BarChart3 className="w-8 h-8 mb-2 opacity-30" /><span className="text-xs">No open positions</span><span className="text-[10px] mt-1">Place your first trade above</span></div> : openPositions.map((pos) => <PositionCard key={pos.id} position={pos} tick={tick} onClose={() => closePosition(pos.id)} />)
            ) : closedPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#5B6270]"><Clock className="w-8 h-8 mb-2 opacity-30" /><span className="text-xs">No trade history</span></div>
            ) : (
              closedPositions.map((pos) => <div key={pos.id} className="bg-[#11141C] border border-[#1E2330] rounded-xl p-3 opacity-60"><div className="flex justify-between items-start mb-1"><div className="flex items-center gap-2"><div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${pos.side === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{pos.side === "BUY" ? "L" : "S"}</div><div><div className="text-xs font-semibold text-white">{pos.symbol}</div><div className="text-[10px] text-[#5B6270]">{pos.lots} lots</div></div></div><span className="text-[10px] text-[#5B6270]">{pos.reason}</span></div><div className="text-[10px] text-[#5B6270]">Entry: {priceText(pos.entry, 5)} | Closed: {pos.closedAt ? new Date(pos.closedAt).toLocaleDateString() : ""}</div></div>)
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
