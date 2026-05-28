import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useRoute } from "wouter";
import { UserButton, useUser } from "@clerk/react";
import { ChevronDown, ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown, X, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TradingViewChart from "@/components/TradingViewChart";
// ============================================
// IMPORT DO LIGHTWEIGHT CHARTS (biblioteca local)
// ============================================
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";

type Side = "BUY" | "SELL";
type Tab = "open" | "history";
type Asset = { label: string; name: string; value: string; base: number; decimals: number; multiplier: number; change: string; category: string };
type Position = { id: string; symbol: string; side: Side; lots: number; entry: number; current: number; pnl: number; stopLoss?: number; takeProfit?: number; status: "open" | "closed"; openedAt: string; closedAt?: string; reason?: string };
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

function money(value: number) { return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }); }
function priceText(value: number, decimals: number) { return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
function floatingPrice(asset: Asset, tick: number) { return asset.base + Math.sin(tick / 3 + asset.base) * asset.base * 0.00045 + Math.cos(tick / 5 + asset.label.length) * asset.base * 0.00025; }
function positionPnl(position: Position, tick: number) { const asset = assets.find((item) => item.label === position.symbol) ?? assets[0]; const current = floatingPrice(asset, tick); const direction = position.side === "BUY" ? 1 : -1; return (current - position.entry) * direction * position.lots * asset.multiplier; }

// ============================================
// GRÁFICO COM LIGHTWEIGHT CHARTS (SOLUÇÃO DEFINITIVA)
// ============================================
function TradingChart({ asset, tick }: { asset: Asset; tick: number }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const dataRef = useRef<CandlestickData<Time>[]>([]);
  const lastPriceRef = useRef(asset.base);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Criar gráfico
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0e1a" },
        textColor: "rgba(255, 255, 255, 0.5)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255, 255, 255, 0.2)",
          labelBackgroundColor: "#2962FF",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.2)",
          labelBackgroundColor: "#2962FF",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    // Criar série de candlesticks

    const series = chart.addSeries(CandlestickSeries, {
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderVisible: false,
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
});
    const now = Math.floor(Date.now() / 1000);
    const initialData: CandlestickData<Time>[] = [];
    let price = asset.base;

    for (let i = 100; i >= 0; i--) {
      const time = (now - i * 3600) as Time;
      const volatility = price * 0.001;
      const open = price + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;

      initialData.push({ time, open, high, low, close });
      price = close;
    }

    series.setData(initialData);
    dataRef.current = initialData;
    lastPriceRef.current = price;

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
    };
  }, [asset.value]);

  // Atualizar com novo preço a cada tick
  useEffect(() => {
    if (!seriesRef.current || dataRef.current.length === 0) return;

    const currentPrice = floatingPrice(asset, tick);
    const lastCandle = dataRef.current[dataRef.current.length - 1];
    const now = Math.floor(Date.now() / 1000) as Time;

    // Se passou mais de 1 hora, criar nova vela
    if (now > (lastCandle.time as number) + 3600) {
      const newCandle: CandlestickData<Time> = {
        time: now,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, currentPrice),
        low: Math.min(lastCandle.close, currentPrice),
        close: currentPrice,
      };
      dataRef.current.push(newCandle);
      seriesRef.current.update(newCandle);
    } else {
      // Atualizar vela atual
      const updatedCandle: CandlestickData<Time> = {
        time: lastCandle.time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice,
      };
      dataRef.current[dataRef.current.length - 1] = updatedCandle;
      seriesRef.current.update(updatedCandle);
    }

    lastPriceRef.current = currentPrice;
  }, [tick, asset]);

  return (
   <div className="relative h-full min-h-[500px] w-full bg-[#050a14]">
  <div ref={chartContainerRef} className="absolute inset-0" />
      {/* Botão para abrir TradingView externo */}
      <a
        href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(asset.value)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs rounded-lg transition backdrop-blur-sm"
      >
        <ExternalLink className="w-3 h-3" />
        Open in TradingView
      </a>
    </div>
  );
}

// ============================================
// HOOK PARA BUSCAR CONTA DA API
// ============================================
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

// ============================================
// COMPONENTE PRINCIPAL DO TERMINAL
// ============================================
export default function TerminalPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/terminal/:accountId");

  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [side, setSide] = useState<Side>("BUY");
  const [lots, setLots] = useState(0.01);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [tab, setTab] = useState<Tab>("open");
  const [positions, setPositions] = useState<Position[]>([]);
  const [tick, setTick] = useState(0);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  const accountId = match && params?.accountId ? parseInt(params.accountId) : undefined;
  const { data: account, isLoading: accountLoading } = useAccount(accountId);
  const { data: accountsList } = useAccounts();

  const activeAccount = account || accountsList?.find(a => a.status === "active");

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
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
    setPositions(prev => [newPosition, ...prev]);
  }, [activeAccount, selectedAsset, side, lots, currentPrice, stopLoss, takeProfit]);

  const closePosition = useCallback((id: string) => {
    setPositions(prev => prev.map(p => 
      p.id === id ? { ...p, status: "closed", closedAt: new Date().toISOString(), reason: "Manual close" } : p
    ));
  }, []);

  const openPositions = positions.filter(p => p.status === "open");
  const closedPositions = positions.filter(p => p.status === "closed");
  const totalFloatingPnl = openPositions.reduce((sum, p) => sum + positionPnl(p, tick), 0);

  const equity = (activeAccount?.currentBalance ?? 10000) + totalFloatingPnl;
  const balance = activeAccount?.currentBalance ?? 10000;
  const initialBalance = activeAccount?.initialBalance ?? 10000;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      {/* HEADER */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0f1629]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <h1 className="font-semibold text-lg">POP Terminal</h1>
        </div>

        <div className="flex items-center gap-6">
          {activeAccount ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-white/50">{activeAccount.challengeName || "Challenge Account"}</div>
                <div className="font-mono font-bold text-lg">{money(balance)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/50">Equity</div>
                <div className={`font-mono font-bold text-lg ${equity >= initialBalance ? "text-emerald-400" : "text-rose-400"}`}>
                  {money(equity)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/50">P&L</div>
                <div className={`font-mono font-bold text-sm ${totalFloatingPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {totalFloatingPnl >= 0 ? "+" : ""}{money(totalFloatingPnl)}
                </div>
              </div>
              <div className="w-32">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Progress</span>
                  <span>{(((balance - initialBalance) / initialBalance) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(Math.max(((balance - initialBalance) / initialBalance) * 100, 0), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/50">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">No active account</span>
            </div>
          )}
          <div className="h-6 w-px bg-white/10" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-[#0f1629]">
            <div className="relative">
              <button 
                onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-sm"
              >
                <span className="font-medium">{selectedAsset.label}</span>
                <span className="text-white/50 text-xs">{selectedAsset.name}</span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>
              {showAssetDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
                  {assets.map(asset => (
                    <button
                      key={asset.label}
                      onClick={() => { setSelectedAsset(asset); setShowAssetDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition text-left ${selectedAsset.label === asset.label ? "bg-white/5" : ""}`}
                    >
                      <div>
                        <div className="text-sm font-medium">{asset.label}</div>
                        <div className="text-xs text-white/50">{asset.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">{priceText(asset.base, asset.decimals)}</div>
                        <div className={`text-xs ${asset.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{asset.change}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-2xl font-mono font-bold">{priceText(currentPrice, selectedAsset.decimals)}</div>
            <div className={`text-sm font-medium ${selectedAsset.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
              {selectedAsset.change}
            </div>
          </div>

{/* TRADINGVIEW REAL */}
<div className="flex-1 min-h-0">
  <TradingViewChart symbol={selectedAsset.value} />
</div>
</div>

<div className="w-80 border-l border-white/10 bg-[#0f1629] flex flex-col">

          <div className="p-4 border-b border-white/10">
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setSide("BUY")}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${side === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                BUY
              </button>
              <button 
                onClick={() => setSide("SELL")}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${side === "SELL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                <TrendingDown className="w-4 h-4 inline mr-1" />
                SELL
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Volume (lots)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setLots(Math.max(0.01, lots - 0.01))} className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg">-</button>
                  <input 
                    type="number" 
                    value={lots} 
                    onChange={e => setLots(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-center font-mono"
                    step="0.01"
                    min="0.01"
                  />
                  <button onClick={() => setLots(lots + 0.01)} className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg">+</button>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Stop Loss</label>
                <input 
                  type="number" 
                  value={stopLoss} 
                  onChange={e => setStopLoss(e.target.value)}
                  placeholder="0.00000"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Take Profit</label>
                <input 
                  type="number" 
                  value={takeProfit} 
                  onChange={e => setTakeProfit(e.target.value)}
                  placeholder="0.00000"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-mono"
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span>Margin Required</span>
                  <span className="font-mono">{money(currentPrice * lots * selectedAsset.multiplier / 100)}</span>
                </div>
                <button 
                  onClick={openPosition}
                  disabled={!activeAccount}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition ${side === "BUY" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"} ${!activeAccount ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {side} {selectedAsset.label}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setTab("open")}
                className={`flex-1 py-2 text-sm font-medium transition ${tab === "open" ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white"}`}
              >
                Open ({openPositions.length})
              </button>
              <button 
                onClick={() => setTab("history")}
                className={`flex-1 py-2 text-sm font-medium transition ${tab === "history" ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white"}`}
              >
                History ({closedPositions.length})
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-2">
              {tab === "open" ? (
                openPositions.length === 0 ? (
                  <div className="text-center text-white/30 py-8 text-sm">No open positions</div>
                ) : (
                  openPositions.map(pos => {
                    const pnl = positionPnl(pos, tick);
                    return (
                      <div key={pos.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-sm">{pos.symbol}</div>
                            <div className={`text-xs ${pos.side === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>{pos.side} {pos.lots} lots</div>
                          </div>
                          <button onClick={() => closePosition(pos.id)} className="text-white/30 hover:text-white/70 transition">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                          <span>Entry: {priceText(pos.entry, 5)}</span>
                          <span>Current: {priceText(floatingPrice(assets.find(a => a.label === pos.symbol) || assets[0], tick), 5)}</span>
                        </div>
                        <div className={`font-mono font-bold text-sm ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {pnl >= 0 ? "+" : ""}{money(pnl)}
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                closedPositions.length === 0 ? (
                  <div className="text-center text-white/30 py-8 text-sm">No history</div>
                ) : (
                  closedPositions.map(pos => (
                    <div key={pos.id} className="bg-white/5 rounded-lg p-3 border border-white/5 opacity-60">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm">{pos.symbol}</div>
                        <div className="text-xs text-white/50">{pos.reason}</div>
                      </div>
                      <div className="text-xs text-white/50">{pos.side} {pos.lots} lots @ {priceText(pos.entry, 5)}</div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
