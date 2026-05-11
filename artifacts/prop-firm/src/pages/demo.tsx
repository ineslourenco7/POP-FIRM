import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { useGetMarketPrice } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PriceTicker from "@/components/PriceTicker";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X, ArrowRight, Lock } from "lucide-react";

const SYMBOLS = [
  { value: "EURUSD", label: "EUR/USD", category: "Forex" },
  { value: "GBPUSD", label: "GBP/USD", category: "Forex" },
  { value: "USDJPY", label: "USD/JPY", category: "Forex" },
  { value: "USDCHF", label: "USD/CHF", category: "Forex" },
  { value: "AUDUSD", label: "AUD/USD", category: "Forex" },
  { value: "USDCAD", label: "USD/CAD", category: "Forex" },
  { value: "NZDUSD", label: "NZD/USD", category: "Forex" },
  { value: "EURGBP", label: "EUR/GBP", category: "Forex" },
  { value: "EURJPY", label: "EUR/JPY", category: "Forex" },
  { value: "GBPJPY", label: "GBP/JPY", category: "Forex" },
  { value: "XAUUSD", label: "XAU/USD (Ouro)", category: "Metais" },
  { value: "XAGUSD", label: "XAG/USD (Prata)", category: "Metais" },
  { value: "BTCUSD", label: "BTC/USD", category: "Crypto" },
  { value: "ETHUSD", label: "ETH/USD", category: "Crypto" },
  { value: "NAS100", label: "NASDAQ 100", category: "Índices" },
  { value: "US30", label: "Dow Jones 30", category: "Índices" },
  { value: "SP500", label: "S&P 500", category: "Índices" },
  { value: "CRUDE", label: "Petróleo", category: "Commodities" },
];

const TV_SYMBOL_MAP: Record<string, string> = {
  EURUSD: "FX:EURUSD", GBPUSD: "FX:GBPUSD", USDJPY: "FX:USDJPY",
  USDCHF: "FX:USDCHF", AUDUSD: "FX:AUDUSD", USDCAD: "FX:USDCAD",
  NZDUSD: "FX:NZDUSD", EURGBP: "FX:EURGBP", EURJPY: "FX:EURJPY",
  GBPJPY: "FX:GBPJPY", XAUUSD: "OANDA:XAUUSD", XAGUSD: "OANDA:XAGUSD",
  BTCUSD: "BINANCE:BTCUSDT", ETHUSD: "BINANCE:ETHUSDT",
  NAS100: "NASDAQ:NDX", US30: "DJ:DJI", SP500: "SP:SPX", CRUDE: "TVC:USOIL",
};

const TIMEFRAMES = [
  { label: "1m", value: "1" }, { label: "5m", value: "5" },
  { label: "15m", value: "15" }, { label: "30m", value: "30" },
  { label: "1H", value: "60" }, { label: "4H", value: "240" },
  { label: "1D", value: "D" }, { label: "1W", value: "W" },
];

function priceDecimals(symbol: string) {
  if (["USDJPY", "EURJPY", "GBPJPY"].includes(symbol)) return 3;
  if (["BTCUSD", "NAS100", "US30", "SP500"].includes(symbol)) return 2;
  if (["XAUUSD", "ETHUSD", "CRUDE"].includes(symbol)) return 2;
  if (symbol === "XAGUSD") return 3;
  return 5;
}

function calcPnl(side: string, openPrice: number, currentPrice: number, size: number) {
  return side === "buy"
    ? (currentPrice - openPrice) * size * 1000
    : (openPrice - currentPrice) * size * 1000;
}

const DEMO_INITIAL = 50_000;
const DEMO_MAX_DD = 10;
const DEMO_DAILY_DD = 5;
const DEMO_PROFIT_TARGET = 8;

let nextId = 1;

interface DemoOrder {
  id: number;
  symbol: string;
  side: "buy" | "sell";
  size: number;
  openPrice: number;
  status: "open" | "closed";
  pnl?: number;
  closePrice?: number;
  closedAt?: string;
}

export default function Demo() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("60");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const [showTicker, setShowTicker] = useState(true);
  const [size, setSize] = useState("0.1");
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [balance, setBalance] = useState(DEMO_INITIAL);
  const [dailyPnl, setDailyPnl] = useState(0);

  const { data: marketPrice } = useGetMarketPrice(
    { symbol },
    { query: { enabled: true, refetchInterval: 1000 } }
  );

  const currentPrice = marketPrice?.price ?? 0;

  const tvContainerRef = useRef<HTMLDivElement>(null);
  const tvScriptLoaded = useRef(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const containerId = "tv_chart_container_demo";
    const initWidget = () => {
      if (!window.TradingView) return;
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: TV_SYMBOL_MAP[symbol] || `FX:${symbol}`,
        interval: timeframe,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "pt",
        toolbar_bg: "#0a0e1a",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        container_id: containerId,
      });
    };

    if (window.TradingView) {
      initWidget();
    } else if (!tvScriptLoaded.current) {
      tvScriptLoaded.current = true;
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.TradingView) { clearInterval(interval); initWidget(); }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [symbol, timeframe]);

  const openOrders = orders.filter((o) => o.status === "open");
  const closedOrders = orders.filter((o) => o.status === "closed");

  const totalFloatingPnl = openOrders.reduce((sum, o) => {
    const price = o.symbol === symbol ? currentPrice : o.openPrice;
    return sum + calcPnl(o.side, o.openPrice, price, o.size);
  }, 0);

  const equity = balance + totalFloatingPnl;

  const totalDrawdownPct = Math.max(0, ((DEMO_INITIAL - balance) / DEMO_INITIAL) * 100);
  const dailyDrawdownPct = dailyPnl < 0 ? (Math.abs(dailyPnl) / DEMO_INITIAL) * 100 : 0;
  const profitPct = Math.max(0, ((balance - DEMO_INITIAL) / DEMO_INITIAL) * 100);

  const totalDDUsed = Math.min((totalDrawdownPct / DEMO_MAX_DD) * 100, 100);
  const dailyDDUsed = Math.min((dailyDrawdownPct / DEMO_DAILY_DD) * 100, 100);
  const profitUsed = Math.min((profitPct / DEMO_PROFIT_TARGET) * 100, 100);

  type Level = "safe" | "warn" | "danger";
  function ddLevel(used: number): Level {
    if (used >= 90) return "danger";
    if (used >= 60) return "warn";
    return "safe";
  }
  const totalDDLevel = ddLevel(totalDDUsed);
  const dailyDDLevel = ddLevel(dailyDDUsed);
  const hasWarning = totalDDLevel !== "safe" || dailyDDLevel !== "safe";

  const handleOrder = useCallback((side: "buy" | "sell") => {
    if (!currentPrice) return;
    const sz = parseFloat(size) || 0.1;
    const order: DemoOrder = {
      id: nextId++,
      symbol,
      side,
      size: sz,
      openPrice: currentPrice,
      status: "open",
    };
    setOrders((prev) => [...prev, order]);
  }, [currentPrice, symbol, size]);

  const handleClose = useCallback((orderId: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId || o.status !== "open") return o;
        const closeP = o.symbol === symbol ? currentPrice : o.openPrice;
        const pnl = calcPnl(o.side, o.openPrice, closeP, o.size);
        setBalance((b) => b + pnl);
        setDailyPnl((d) => d + pnl);
        return { ...o, status: "closed" as const, pnl, closePrice: closeP, closedAt: new Date().toISOString() };
      })
    );
  }, [symbol, currentPrice]);

  const handleCloseAll = useCallback(() => {
    openOrders.forEach((o) => handleClose(o.id));
  }, [openOrders, handleClose]);

  const filteredSymbols = SYMBOLS.filter(
    (s) =>
      s.value.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      s.label.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(symbolSearch.toLowerCase())
  );
  const categories = [...new Set(filteredSymbols.map((s) => s.category))];

  return (
    <div className="h-screen flex flex-col bg-[#050a14] overflow-hidden">
      {/* Demo Banner */}
      <div className="shrink-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30 px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary font-semibold text-xs px-2.5 py-0.5 rounded-full border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            MODO DEMO
          </span>
          <span className="text-[#94a3b8] text-xs hidden sm:block">
            Conta simulada de $50.000 · Os dados são reais mas as ordens são locais
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/sign-up">
            <Button size="sm" className="h-7 text-xs gap-1.5 px-3">
              Criar Conta Real <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 px-3 border-[#1e2a3a] text-[#94a3b8] hover:text-white hover:border-[#334155]">
              <Lock className="w-3 h-3" /> Entrar
            </Button>
          </Link>
        </div>
      </div>

      <PriceTicker visible={showTicker} onToggle={() => setShowTicker((v) => !v)} />

      {/* Top Bar */}
      <div className="h-14 border-b border-[#1e2a3a] flex items-center px-4 justify-between bg-[#0a0e1a] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-1">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-7 h-7" />
            <span className="font-bold text-sm text-white hidden sm:block">QuantFund</span>
          </Link>
          <span className="text-[#1e2a3a] select-none">|</span>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Início
          </Link>
          <div className="font-mono text-xl font-bold text-white">{symbol}</div>
          <div className={`font-mono text-lg font-semibold tabular-nums ${marketPrice && marketPrice.change >= 0 ? "text-green-400" : "text-red-400"}`}>
            {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
          </div>
          <div className={`text-xs font-mono px-2 py-0.5 rounded ${marketPrice && marketPrice.change >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {marketPrice && marketPrice.change >= 0 ? "+" : ""}
            {marketPrice?.change?.toFixed(5) ?? "0.00000"}
          </div>
          <div className="flex items-center gap-0.5 ml-2">
            {TIMEFRAMES.map((tf) => (
              <button key={tf.value} onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-1 text-xs rounded transition-colors font-mono ${timeframe === tf.value ? "bg-primary text-white" : "text-[#64748b] hover:text-white hover:bg-[#1e2a3a]"}`}>
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[#64748b] text-xs">Balance</span>
            <span className="font-mono font-semibold">${balance.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#64748b] text-xs">Equity</span>
            <span className="font-mono font-semibold">${equity.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#64748b] text-xs">Float PnL</span>
            <span className={`font-mono font-semibold ${totalFloatingPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalFloatingPnl >= 0 ? "+" : ""}${totalFloatingPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#64748b] text-xs">Day PnL</span>
            <span className={`font-mono font-semibold ${dailyPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {dailyPnl >= 0 ? "+" : ""}${dailyPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Drawdown Strip */}
      <div className={`shrink-0 border-b flex items-center gap-0 text-[11px] font-mono ${hasWarning ? totalDDLevel === "danger" || dailyDDLevel === "danger" ? "border-red-500/40 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5" : "border-[#1e2a3a] bg-[#050a14]"}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[#1e2a3a] min-w-[170px]">
          <span className="text-[#64748b] shrink-0">DD Total</span>
          <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${totalDDLevel === "danger" ? "bg-red-500" : totalDDLevel === "warn" ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${totalDDUsed}%` }} />
          </div>
          <span className={`tabular-nums shrink-0 ${totalDDLevel === "danger" ? "text-red-400" : totalDDLevel === "warn" ? "text-yellow-400" : "text-[#64748b]"}`}>
            {totalDrawdownPct.toFixed(2)}% / {DEMO_MAX_DD}%
          </span>
          {totalDDLevel === "danger" && <span className="text-red-400 font-bold animate-pulse">⚠</span>}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[#1e2a3a] min-w-[170px]">
          <span className="text-[#64748b] shrink-0">DD Diário</span>
          <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${dailyDDLevel === "danger" ? "bg-red-500" : dailyDDLevel === "warn" ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${dailyDDUsed}%` }} />
          </div>
          <span className={`tabular-nums shrink-0 ${dailyDDLevel === "danger" ? "text-red-400" : dailyDDLevel === "warn" ? "text-yellow-400" : "text-[#64748b]"}`}>
            {dailyDrawdownPct.toFixed(2)}% / {DEMO_DAILY_DD}%
          </span>
          {dailyDDLevel === "danger" && <span className="text-red-400 font-bold animate-pulse">⚠</span>}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 min-w-[170px]">
          <span className="text-[#64748b] shrink-0">Lucro Alvo</span>
          <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${profitUsed}%` }} />
          </div>
          <span className={`tabular-nums shrink-0 ${profitPct >= DEMO_PROFIT_TARGET ? "text-green-400" : "text-[#64748b]"}`}>
            {profitPct.toFixed(2)}% / {DEMO_PROFIT_TARGET}%
          </span>
          {profitPct >= DEMO_PROFIT_TARGET && <span className="text-green-400">✓</span>}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chart + Positions */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0" ref={tvContainerRef}>
            <div id="tv_chart_container_demo" className="w-full h-full" />
          </div>

          {/* Positions / History */}
          <div className="h-44 border-t border-[#1e2a3a] bg-[#0a0e1a] flex flex-col shrink-0">
            <div className="px-4 py-0 border-b border-[#1e2a3a] flex items-center gap-4 shrink-0">
              <button onClick={() => setActiveTab("positions")}
                className={`py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === "positions" ? "border-primary text-white" : "border-transparent text-[#64748b] hover:text-white"}`}>
                Posições Abertas ({openOrders.length})
              </button>
              <button onClick={() => setActiveTab("history")}
                className={`py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === "history" ? "border-primary text-white" : "border-transparent text-[#64748b] hover:text-white"}`}>
                Histórico ({closedOrders.length})
              </button>
              {activeTab === "positions" && openOrders.length > 0 && (
                <div className="ml-auto flex items-center gap-3">
                  <span className={`text-xs font-mono font-semibold ${totalFloatingPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    Float: {totalFloatingPnl >= 0 ? "+" : ""}${totalFloatingPnl.toFixed(2)}
                  </span>
                  <button onClick={handleCloseAll}
                    className="text-[10px] px-2.5 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors font-semibold uppercase tracking-wide">
                    Fechar Tudo
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeTab === "positions" ? (
                <table className="w-full text-xs">
                  <thead className="text-left text-[#64748b] sticky top-0 bg-[#0a0e1a]">
                    <tr>
                      <th className="font-normal px-3 py-1.5">Symbol</th>
                      <th className="font-normal px-3 py-1.5">Side</th>
                      <th className="font-normal px-3 py-1.5 text-right">Size</th>
                      <th className="font-normal px-3 py-1.5 text-right">Open</th>
                      <th className="font-normal px-3 py-1.5 text-right">Current</th>
                      <th className="font-normal px-3 py-1.5 text-right">Float PnL</th>
                      <th className="font-normal px-3 py-1.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map((order) => {
                      const livePrice = order.symbol === symbol ? currentPrice : order.openPrice;
                      const livePnl = calcPnl(order.side, order.openPrice, livePrice, order.size);
                      const dec = priceDecimals(order.symbol);
                      return (
                        <tr key={order.id} className="border-t border-[#1e2a3a]/50 hover:bg-[#1e2a3a]/20">
                          <td className="px-3 py-1.5 font-semibold text-white">{order.symbol}</td>
                          <td className="px-3 py-1.5">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${order.side === "buy" ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
                              {order.side.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.size}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.openPrice.toFixed(dec)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{livePrice.toFixed(dec)}</td>
                          <td className={`px-3 py-1.5 text-right font-mono font-semibold ${livePnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {livePnl >= 0 ? "+" : ""}${livePnl.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <button onClick={() => handleClose(order.id)}
                              className="text-[10px] px-2 py-0.5 rounded border border-[#334155] text-[#94a3b8] hover:border-red-500/50 hover:text-red-400 transition-colors">
                              Fechar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {openOrders.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-[#64748b]">Sem posições abertas</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-left text-[#64748b] sticky top-0 bg-[#0a0e1a]">
                    <tr>
                      <th className="font-normal px-3 py-1.5">Symbol</th>
                      <th className="font-normal px-3 py-1.5">Side</th>
                      <th className="font-normal px-3 py-1.5 text-right">Size</th>
                      <th className="font-normal px-3 py-1.5 text-right">Open</th>
                      <th className="font-normal px-3 py-1.5 text-right">Close</th>
                      <th className="font-normal px-3 py-1.5 text-right">PnL</th>
                      <th className="font-normal px-3 py-1.5 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...closedOrders].reverse().map((order) => {
                      const dec = priceDecimals(order.symbol);
                      const pnl = order.pnl ?? 0;
                      return (
                        <tr key={order.id} className="border-t border-[#1e2a3a]/50 hover:bg-[#1e2a3a]/20">
                          <td className="px-3 py-1.5 font-semibold text-white">{order.symbol}</td>
                          <td className="px-3 py-1.5">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${order.side === "buy" ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
                              {order.side.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.size}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.openPrice.toFixed(dec)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.closePrice?.toFixed(dec) ?? "—"}</td>
                          <td className={`px-3 py-1.5 text-right font-mono font-semibold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5 text-right text-[#64748b]">
                            {order.closedAt ? new Date(order.closedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {closedOrders.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-[#64748b]">Sem histórico de negociação</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="w-6 bg-[#0a0e1a] border-l border-[#1e2a3a] flex items-center justify-center hover:bg-[#1e2a3a] transition-colors shrink-0 text-[#64748b] hover:text-white"
          title={rightPanelCollapsed ? "Expandir painel" : "Recolher painel"}>
          {rightPanelCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Right Panel */}
        {!rightPanelCollapsed && (
          <div className="w-72 bg-[#0a0e1a] flex flex-col shrink-0 border-l border-[#1e2a3a]">
            {/* Order Form */}
            <div className="p-4 border-b border-[#1e2a3a] shrink-0">
              <h3 className="font-semibold mb-3 text-sm text-white">Nova Ordem</h3>
              <div className="space-y-3">
                {/* Symbol Selector */}
                <div className="relative">
                  <label className="text-[11px] text-[#64748b] mb-1.5 block uppercase tracking-wider">Instrumento</label>
                  <button onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
                    className="w-full h-9 px-3 border border-[#1e2a3a] bg-[#050a14] rounded text-sm text-left flex items-center justify-between hover:border-[#334155] transition-colors">
                    <span className="font-mono font-semibold text-white">{symbol}</span>
                    <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${showSymbolDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showSymbolDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0d1526] border border-[#1e2a3a] rounded-lg shadow-xl">
                      <div className="p-2 border-b border-[#1e2a3a] flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                        <input autoFocus type="text" placeholder="Pesquisar instrumento..."
                          value={symbolSearch} onChange={(e) => setSymbolSearch(e.target.value)}
                          className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#64748b]" />
                        {symbolSearch && (
                          <button onClick={() => setSymbolSearch("")} className="text-[#64748b] hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {categories.map((cat) => (
                          <div key={cat}>
                            <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#64748b] font-semibold">{cat}</div>
                            {filteredSymbols.filter((s) => s.category === cat).map((s) => (
                              <button key={s.value}
                                onClick={() => { setSymbol(s.value); setShowSymbolDropdown(false); setSymbolSearch(""); }}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#1e2a3a] transition-colors flex items-center justify-between ${symbol === s.value ? "text-primary bg-primary/5" : "text-white"}`}>
                                <span className="font-mono font-semibold">{s.value}</span>
                                <span className="text-[#64748b]">{s.label}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Size */}
                <div>
                  <label className="text-[11px] text-[#64748b] mb-1.5 block uppercase tracking-wider">Tamanho (lotes)</label>
                  <input type="number" value={size} onChange={(e) => setSize(e.target.value)} min="0.01" max="10" step="0.01"
                    className="w-full h-9 px-3 bg-[#050a14] border border-[#1e2a3a] rounded text-sm font-mono text-white outline-none focus:border-primary transition-colors" />
                </div>

                {/* Current Price */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-[#64748b] uppercase tracking-wider">Preço Atual</span>
                  <span className="font-mono text-sm font-semibold text-white">
                    {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
                  </span>
                </div>

                {/* Buy / Sell */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleOrder("buy")} disabled={!currentPrice}
                    className="h-12 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-bold text-sm tracking-wider uppercase">
                    BUY
                  </button>
                  <button onClick={() => handleOrder("sell")} disabled={!currentPrice}
                    className="h-12 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-bold text-sm tracking-wider uppercase">
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="p-4 border-b border-[#1e2a3a] shrink-0">
              <h3 className="font-semibold mb-3 text-sm text-white">Conta Demo</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Balance", value: `$${balance.toFixed(2)}` },
                  { label: "Equity", value: `$${equity.toFixed(2)}`, color: equity >= DEMO_INITIAL ? "text-green-400" : "text-red-400" },
                  { label: "Float PnL", value: `${totalFloatingPnl >= 0 ? "+" : ""}$${totalFloatingPnl.toFixed(2)}`, color: totalFloatingPnl >= 0 ? "text-green-400" : "text-red-400" },
                  { label: "Day PnL", value: `${dailyPnl >= 0 ? "+" : ""}$${dailyPnl.toFixed(2)}`, color: dailyPnl >= 0 ? "text-green-400" : "text-red-400" },
                  { label: "Posições", value: `${openOrders.length}` },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[#64748b]">{label}</span>
                    <span className={`font-mono font-semibold ${color ?? "text-white"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 mt-auto">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-xs text-[#94a3b8] mb-3 leading-relaxed">
                  Gostaste do terminal? Abre uma conta real e começa a ganhar com capital da prop firm.
                </p>
                <Link href="/sign-up">
                  <Button size="sm" className="w-full gap-1.5">
                    Começar Desafio Real <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
