import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetAccount,
  useListOrders,
  useCreateOrder,
  useCloseOrder,
  useGetMarketPrice,
  getListOrdersQueryKey,
  getGetAccountQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import PriceTicker from "@/components/PriceTicker";

declare global {
  interface Window {
    TradingView: any;
  }
}

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
  { value: "XAUUSD", label: "XAU/USD (Gold)", category: "Metals" },
  { value: "XAGUSD", label: "XAG/USD (Silver)", category: "Metals" },
  { value: "BTCUSD", label: "BTC/USD", category: "Crypto" },
  { value: "ETHUSD", label: "ETH/USD", category: "Crypto" },
  { value: "NAS100", label: "NASDAQ 100", category: "Indices" },
  { value: "US30", label: "Dow Jones 30", category: "Indices" },
  { value: "SP500", label: "S&P 500", category: "Indices" },
  { value: "CRUDE", label: "Crude Oil", category: "Commodities" },
];

const TV_SYMBOL_MAP: Record<string, string> = {
  EURUSD: "FX:EURUSD",
  GBPUSD: "FX:GBPUSD",
  USDJPY: "FX:USDJPY",
  USDCHF: "FX:USDCHF",
  AUDUSD: "FX:AUDUSD",
  USDCAD: "FX:USDCAD",
  NZDUSD: "FX:NZDUSD",
  EURGBP: "FX:EURGBP",
  EURJPY: "FX:EURJPY",
  GBPJPY: "FX:GBPJPY",
  XAUUSD: "OANDA:XAUUSD",
  XAGUSD: "OANDA:XAGUSD",
  BTCUSD: "BINANCE:BTCUSDT",
  ETHUSD: "BINANCE:ETHUSDT",
  NAS100: "NASDAQ:NDX",
  US30: "DJ:DJI",
  SP500: "SP:SPX",
  CRUDE: "TVC:USOIL",
};

const TIMEFRAMES = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

function calcLivePnl(side: string, openPrice: number, currentPrice: number, size: number) {
  return side === "buy"
    ? (currentPrice - openPrice) * size * 1000
    : (openPrice - currentPrice) * size * 1000;
}

function priceDecimals(symbol: string) {
  if (["USDJPY", "EURJPY", "GBPJPY"].includes(symbol)) return 3;
  if (["BTCUSD", "NAS100", "US30", "SP500"].includes(symbol)) return 2;
  if (["XAUUSD", "ETHUSD", "CRUDE"].includes(symbol)) return 2;
  if (symbol === "XAGUSD") return 3;
  return 5;
}

export default function Trade() {
  const { accountId } = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(accountId || "0", 10);
  const queryClient = useQueryClient();

  const { data: account } = useGetAccount(id, {
    query: { enabled: !!id, queryKey: getGetAccountQueryKey(id), refetchInterval: 2000 },
  });
  const { data: orders } = useListOrders(id, {
    query: { enabled: !!id, queryKey: getListOrdersQueryKey(id), refetchInterval: 2000 },
  });

  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("60");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const [showTicker, setShowTicker] = useState(true);

  const { data: marketPrice } = useGetMarketPrice(
    { symbol },
    { query: { enabled: true, refetchInterval: 1000 } }
  );

  const createOrderMut = useCreateOrder();
  const closeOrderMut = useCloseOrder();
  const [size, setSize] = useState("1.0");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  const tvContainerRef = useRef<HTMLDivElement>(null);
  const tvScriptLoaded = useRef(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const containerId = "tv_chart_container";

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
        locale: "en",
        toolbar_bg: "#0a0e1a",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: true,
        drawings_access: { type: "all" },
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
        if (window.TradingView) {
          clearInterval(interval);
          initWidget();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [symbol, timeframe]);

  const handleOrder = (side: "buy" | "sell") => {
    const slVal = sl.trim() ? parseFloat(sl) : undefined;
    const tpVal = tp.trim() ? parseFloat(tp) : undefined;
    createOrderMut.mutate(
      { accountId: id, data: { symbol, side, size: parseFloat(size), stopLoss: slVal, takeProfit: tpVal } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey(id) });
        },
      }
    );
  };

  const handleClose = (orderId: number) => {
    closeOrderMut.mutate(
      { accountId: id, orderId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey(id) });
        },
      }
    );
  };

  const handleCloseAll = () => {
    const open = orders?.filter((o) => o.status === "open") ?? [];
    open.forEach((o) => {
      closeOrderMut.mutate(
        { accountId: id, orderId: o.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(id) });
            queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey(id) });
          },
        }
      );
    });
  };

  const openOrders = orders?.filter((o) => o.status === "open") || [];
  const closedOrders = orders?.filter((o) => o.status === "closed") || [];
  const currentPrice = marketPrice?.price ?? 0;

  const totalFloatingPnl = openOrders
    .filter((o) => o.symbol === symbol)
    .reduce((sum, o) => sum + calcLivePnl(o.side, o.openPrice, currentPrice, o.size), 0);

  // Drawdown calculations (using real challenge limits from account)
  const maxDailyDD  = account?.maxDailyDrawdown  ?? 5;
  const maxTotalDD  = account?.maxTotalDrawdown   ?? 10;
  const profitTarget = account?.profitTarget      ?? 8;

  const totalDrawdownPct = account
    ? ((account.initialBalance - account.currentBalance) / account.initialBalance) * 100
    : 0;
  const dailyDrawdownPct = account && account.dailyPnl < 0
    ? (Math.abs(account.dailyPnl) / account.initialBalance) * 100
    : 0;
  const profitPct = account
    ? ((account.currentBalance - account.initialBalance) / account.initialBalance) * 100
    : 0;

  const totalDDUsed  = Math.min((totalDrawdownPct / maxTotalDD) * 100, 100);
  const dailyDDUsed  = Math.min((dailyDrawdownPct / maxDailyDD) * 100, 100);
  const profitUsed   = Math.min((Math.max(profitPct, 0) / profitTarget) * 100, 100);

  type Level = "safe" | "warn" | "danger";
  function ddLevel(used: number): Level {
    if (used >= 90) return "danger";
    if (used >= 60) return "warn";
    return "safe";
  }
  const totalDDLevel = ddLevel(totalDDUsed);
  const dailyDDLevel = ddLevel(dailyDDUsed);
  const hasWarning = totalDDLevel !== "safe" || dailyDDLevel !== "safe";

  const filteredSymbols = SYMBOLS.filter(
    (s) =>
      s.value.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      s.label.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(symbolSearch.toLowerCase())
  );

  const categories = [...new Set(filteredSymbols.map((s) => s.category))];

  const selectedSymbolLabel = SYMBOLS.find((s) => s.value === symbol)?.label || symbol;

  return (
    <div className="h-screen flex flex-col bg-[#050a14] overflow-hidden">
      <PriceTicker visible={showTicker} onToggle={() => setShowTicker(v => !v)} />

      {/* Top Bar */}
      <div className="h-14 border-b border-[#1e2a3a] flex items-center px-4 justify-between bg-[#0a0e1a] shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo / Home */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-2"
            title="Voltar ao início"
          >
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-7 h-7" />
          </button>

          {/* Symbol + Price */}
          <div className="font-mono text-xl font-bold text-white">{symbol}</div>
          <div
            className={`font-mono text-lg font-semibold tabular-nums ${
              marketPrice && marketPrice.change >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
          </div>
          <div
            className={`text-xs font-mono px-2 py-0.5 rounded ${
              marketPrice && marketPrice.change >= 0
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {marketPrice && marketPrice.change >= 0 ? "+" : ""}
            {marketPrice?.change?.toFixed(5) ?? "0.00000"}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-0.5 ml-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
                  timeframe === tf.value
                    ? "bg-primary text-white"
                    : "text-[#64748b] hover:text-white hover:bg-[#1e2a3a]"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {account && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-[#64748b] text-xs">Balance</span>
              <span className="font-mono font-semibold">${account.currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#64748b] text-xs">Equity</span>
              <span className="font-mono font-semibold">${account.equity.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#64748b] text-xs">Float PnL</span>
              <span
                className={`font-mono font-semibold ${
                  totalFloatingPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {totalFloatingPnl >= 0 ? "+" : ""}${totalFloatingPnl.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#64748b] text-xs">Day PnL</span>
              <span
                className={`font-mono font-semibold ${
                  account.dailyPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {account.dailyPnl >= 0 ? "+" : ""}${account.dailyPnl.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drawdown Warning Strip */}
      {account && (
        <div className={`shrink-0 border-b flex items-center gap-0 text-[11px] font-mono ${
          hasWarning
            ? totalDDLevel === "danger" || dailyDDLevel === "danger"
              ? "border-red-500/40 bg-red-500/5"
              : "border-yellow-500/30 bg-yellow-500/5"
            : "border-[#1e2a3a] bg-[#050a14]"
        }`}>
          {/* Total Drawdown */}
          <div className={`flex items-center gap-2 px-3 py-1.5 border-r border-[#1e2a3a] min-w-[170px]`}>
            <span className="text-[#64748b] shrink-0">DD Total</span>
            <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalDDLevel === "danger" ? "bg-red-500" : totalDDLevel === "warn" ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${totalDDUsed}%` }}
              />
            </div>
            <span className={`tabular-nums shrink-0 ${totalDDLevel === "danger" ? "text-red-400" : totalDDLevel === "warn" ? "text-yellow-400" : "text-[#64748b]"}`}>
              {totalDrawdownPct.toFixed(2)}% / {maxTotalDD}%
            </span>
            {totalDDLevel === "danger" && <span className="text-red-400 font-bold animate-pulse">⚠</span>}
          </div>

          {/* Daily Drawdown */}
          <div className={`flex items-center gap-2 px-3 py-1.5 border-r border-[#1e2a3a] min-w-[170px]`}>
            <span className="text-[#64748b] shrink-0">DD Diário</span>
            <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyDDLevel === "danger" ? "bg-red-500" : dailyDDLevel === "warn" ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${dailyDDUsed}%` }}
              />
            </div>
            <span className={`tabular-nums shrink-0 ${dailyDDLevel === "danger" ? "text-red-400" : dailyDDLevel === "warn" ? "text-yellow-400" : "text-[#64748b]"}`}>
              {dailyDrawdownPct.toFixed(2)}% / {maxDailyDD}%
            </span>
            {dailyDDLevel === "danger" && <span className="text-red-400 font-bold animate-pulse">⚠</span>}
          </div>

          {/* Profit Target */}
          <div className="flex items-center gap-2 px-3 py-1.5 min-w-[170px]">
            <span className="text-[#64748b] shrink-0">Lucro Alvo</span>
            <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${profitUsed}%` }}
              />
            </div>
            <span className={`tabular-nums shrink-0 ${profitPct >= profitTarget ? "text-green-400" : "text-[#64748b]"}`}>
              {profitPct.toFixed(2)}% / {profitTarget}%
            </span>
            {profitPct >= profitTarget && <span className="text-green-400">✓</span>}
          </div>

          {/* Account status badge if not active */}
          {account.status !== "active" && (
            <div className={`ml-auto px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              account.status === "passed" || account.status === "funded"
                ? "text-green-400"
                : "text-red-400"
            }`}>
              Conta {account.status === "passed" ? "APROVADA" : account.status === "funded" ? "FINANCIADA" : "FALHADA"}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chart + Positions Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TradingView Chart */}
          <div className="flex-1 min-h-0" ref={tvContainerRef}>
            <div id="tv_chart_container" className="w-full h-full" />
          </div>

          {/* Positions / History Panel */}
          <div className="h-44 border-t border-[#1e2a3a] bg-[#0a0e1a] flex flex-col shrink-0">
            <div className="px-4 py-0 border-b border-[#1e2a3a] flex items-center gap-4 shrink-0">
              <button
                onClick={() => setActiveTab("positions")}
                className={`py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === "positions"
                    ? "border-primary text-white"
                    : "border-transparent text-[#64748b] hover:text-white"
                }`}
              >
                Posições Abertas ({openOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === "history"
                    ? "border-primary text-white"
                    : "border-transparent text-[#64748b] hover:text-white"
                }`}
              >
                Histórico ({closedOrders.length})
              </button>
              {activeTab === "positions" && openOrders.length > 0 && (
                <div className="ml-auto flex items-center gap-3">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      totalFloatingPnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    Float: {totalFloatingPnl >= 0 ? "+" : ""}${totalFloatingPnl.toFixed(2)}
                  </span>
                  <button
                    onClick={handleCloseAll}
                    disabled={closeOrderMut.isPending}
                    className="text-[10px] px-2.5 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 font-semibold uppercase tracking-wide"
                  >
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
                      <th className="font-normal px-3 py-1.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map((order) => {
                      const liveCurrent = order.symbol === symbol ? currentPrice : (order.currentPrice ?? order.openPrice);
                      const livePnl = calcLivePnl(order.side, order.openPrice, liveCurrent, order.size);
                      const dec = priceDecimals(order.symbol);
                      return (
                        <tr key={order.id} className="border-t border-[#1e2a3a]/50 hover:bg-[#1e2a3a]/20">
                          <td className="px-3 py-1.5 font-semibold text-white">{order.symbol}</td>
                          <td className="px-3 py-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                order.side === "buy"
                                  ? "text-green-400 border-green-500/30"
                                  : "text-red-400 border-red-500/30"
                              }`}
                            >
                              {order.side.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.size}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{order.openPrice.toFixed(dec)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{liveCurrent.toFixed(dec)}</td>
                          <td className={`px-3 py-1.5 text-right font-mono font-semibold ${livePnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {livePnl >= 0 ? "+" : ""}${livePnl.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <button
                              onClick={() => handleClose(order.id)}
                              disabled={closeOrderMut.isPending}
                              className="text-[10px] px-2 py-0.5 rounded border border-[#334155] text-[#94a3b8] hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              Fechar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {openOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-[#64748b]">
                          Sem posições abertas
                        </td>
                      </tr>
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
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                order.side === "buy"
                                  ? "text-green-400 border-green-500/30"
                                  : "text-red-400 border-red-500/30"
                              }`}
                            >
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
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-[#64748b]">
                          Sem histórico de negociação
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="w-6 bg-[#0a0e1a] border-l border-[#1e2a3a] flex items-center justify-center hover:bg-[#1e2a3a] transition-colors shrink-0 text-[#64748b] hover:text-white"
          title={rightPanelCollapsed ? "Expandir painel" : "Recolher painel"}
        >
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
                  <button
                    onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
                    className="w-full h-9 px-3 border border-[#1e2a3a] bg-[#050a14] rounded text-sm text-left flex items-center justify-between hover:border-[#334155] transition-colors"
                  >
                    <span className="font-mono font-semibold text-white">{symbol}</span>
                    <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${showSymbolDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showSymbolDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0d1526] border border-[#1e2a3a] rounded-lg shadow-xl">
                      <div className="p-2 border-b border-[#1e2a3a] flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Pesquisar instrumento..."
                          value={symbolSearch}
                          onChange={(e) => setSymbolSearch(e.target.value)}
                          className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#64748b]"
                        />
                        {symbolSearch && (
                          <button onClick={() => setSymbolSearch("")} className="text-[#64748b] hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {categories.map((cat) => (
                          <div key={cat}>
                            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">
                              {cat}
                            </div>
                            {filteredSymbols
                              .filter((s) => s.category === cat)
                              .map((s) => (
                                <button
                                  key={s.value}
                                  onClick={() => {
                                    setSymbol(s.value);
                                    setShowSymbolDropdown(false);
                                    setSymbolSearch("");
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#1e2a3a] transition-colors ${
                                    symbol === s.value ? "text-primary" : "text-[#94a3b8]"
                                  }`}
                                >
                                  <span className="font-semibold font-mono">{s.value}</span>
                                  <span className="text-[#64748b] text-[10px]">{s.label.replace(s.value, "").trim()}</span>
                                </button>
                              ))}
                          </div>
                        ))}
                        {filteredSymbols.length === 0 && (
                          <div className="px-3 py-4 text-center text-xs text-[#64748b]">Sem resultados</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-[#64748b] mb-1.5 block uppercase tracking-wider">
                    Volume (Lotes)
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      className="h-9 w-9 border border-[#1e2a3a] bg-[#050a14] text-white rounded flex items-center justify-center hover:border-[#334155] shrink-0"
                      onClick={() => setSize((Math.max(0.01, parseFloat(size) - 0.1)).toFixed(2))}
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      step="0.01"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="h-9 text-center font-mono border-[#1e2a3a] bg-[#050a14] text-sm"
                    />
                    <button
                      className="h-9 w-9 border border-[#1e2a3a] bg-[#050a14] text-white rounded flex items-center justify-center hover:border-[#334155] shrink-0"
                      onClick={() => setSize((parseFloat(size) + 0.1).toFixed(2))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-red-400/80 mb-1 block uppercase tracking-wider">Stop Loss</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00000"
                      value={sl}
                      onChange={(e) => setSl(e.target.value)}
                      className="h-8 text-center font-mono border-[#1e2a3a] bg-[#050a14] text-xs placeholder:text-[#334155]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-green-400/80 mb-1 block uppercase tracking-wider">Take Profit</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00000"
                      value={tp}
                      onChange={(e) => setTp(e.target.value)}
                      className="h-8 text-center font-mono border-[#1e2a3a] bg-[#050a14] text-xs placeholder:text-[#334155]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    className="h-14 bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center gap-0.5 rounded-lg"
                    onClick={() => handleOrder("sell")}
                    disabled={createOrderMut.isPending}
                  >
                    <span className="text-[11px] uppercase font-bold tracking-wider">Vender</span>
                    <span className="font-mono text-xs">
                      {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
                    </span>
                  </Button>
                  <Button
                    className="h-14 bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center gap-0.5 rounded-lg"
                    onClick={() => handleOrder("buy")}
                    disabled={createOrderMut.isPending}
                  >
                    <span className="text-[11px] uppercase font-bold tracking-wider">Comprar</span>
                    <span className="font-mono text-xs">
                      {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            {account && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="bg-[#050a14] rounded-lg p-3 border border-[#1e2a3a]">
                  <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Balance</div>
                  <div className="font-mono text-sm font-semibold text-white">${account.currentBalance.toFixed(2)}</div>
                </div>
                <div className="bg-[#050a14] rounded-lg p-3 border border-[#1e2a3a]">
                  <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Equity</div>
                  <div className="font-mono text-sm font-semibold text-white">${account.equity.toFixed(2)}</div>
                </div>
                <div className="bg-[#050a14] rounded-lg p-3 border border-[#1e2a3a]">
                  <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">PnL Total</div>
                  <div className={`font-mono text-sm font-semibold ${account.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {account.totalPnl >= 0 ? "+" : ""}${account.totalPnl.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050a14] rounded-lg p-3 border border-[#1e2a3a]">
                  <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">PnL Dia</div>
                  <div className={`font-mono text-sm font-semibold ${account.dailyPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {account.dailyPnl >= 0 ? "+" : ""}${account.dailyPnl.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
