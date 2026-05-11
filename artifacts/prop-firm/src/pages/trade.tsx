import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import {
  useGetAccount,
  useListOrders,
  useCreateOrder,
  useCloseOrder,
  useGetMarketPrice,
  getListOrdersQueryKey,
  getGetAccountQueryKey,
} from "@workspace/api-client-react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PriceTicker from "@/components/PriceTicker";

const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "NAS100", "US30", "USDCHF", "AUDUSD"];

function calcLivePnl(side: string, openPrice: number, currentPrice: number, size: number) {
  return side === "buy"
    ? (currentPrice - openPrice) * size * 1000
    : (openPrice - currentPrice) * size * 1000;
}

function priceDecimals(symbol: string) {
  if (symbol === "USDJPY") return 3;
  if (["XAUUSD", "BTCUSD", "ETHUSD", "NAS100", "US30", "SP500", "CRUDE"].includes(symbol)) return 2;
  return 5;
}

export default function Trade() {
  const { accountId } = useParams();
  const id = parseInt(accountId || "0", 10);
  const queryClient = useQueryClient();

  const { data: account } = useGetAccount(id, {
    query: { enabled: !!id, queryKey: getGetAccountQueryKey(id), refetchInterval: 2000 },
  });
  const { data: orders } = useListOrders(id, {
    query: { enabled: !!id, queryKey: getListOrdersQueryKey(id), refetchInterval: 2000 },
  });

  const [symbol, setSymbol] = useState("EURUSD");
  const { data: marketPrice } = useGetMarketPrice(
    { symbol },
    { query: { enabled: true, refetchInterval: 1000 } }
  );

  const createOrderMut = useCreateOrder();
  const closeOrderMut = useCloseOrder();

  const [size, setSize] = useState("1.0");

  const handleOrder = (side: "buy" | "sell") => {
    createOrderMut.mutate(
      { accountId: id, data: { symbol, side, size: parseFloat(size) } },
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

  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "#050a14" }, textColor: "#94a3b8" },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: { vertLines: { color: "#1e2a3a" }, horzLines: { color: "#1e2a3a" } },
      rightPriceScale: { borderColor: "#1e2a3a" },
      timeScale: { borderColor: "#1e2a3a" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const decimals = priceDecimals(symbol);
    const basePrice = symbol === "XAUUSD" ? 2000 : symbol === "BTCUSD" ? 60000 : symbol === "USDJPY" ? 150 : symbol === "NAS100" ? 18000 : symbol === "US30" ? 39000 : 1.1;
    const volatility = symbol === "BTCUSD" ? 500 : symbol === "XAUUSD" ? 5 : symbol === "NAS100" ? 80 : symbol === "US30" ? 150 : symbol === "USDJPY" ? 0.3 : 0.005;

    const data: { time: number; open: number; high: number; low: number; close: number }[] = [];
    let price = basePrice;
    let time = Math.floor(Date.now() / 1000) - 3600 * 100;

    for (let i = 0; i < 100; i++) {
      const open = price;
      const close = price + (Math.random() - 0.49) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      data.push({ time: time as any, open: +open.toFixed(decimals), high: +high.toFixed(decimals), low: +low.toFixed(decimals), close: +close.toFixed(decimals) });
      price = close;
      time += 3600;
    }

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol]);

  const openOrders = orders?.filter((o) => o.status === "open") || [];
  const currentPrice = marketPrice?.price ?? 0;

  const totalFloatingPnl = openOrders
    .filter((o) => o.symbol === symbol)
    .reduce((sum, o) => sum + calcLivePnl(o.side, o.openPrice, currentPrice, o.size), 0);

  return (
    <div className="h-screen flex flex-col bg-[#050a14] overflow-hidden">
      <PriceTicker />

      {/* Top Bar */}
      <div className="h-14 border-b border-[#1e2a3a] flex items-center px-4 justify-between bg-[#0a0e1a] shrink-0">
        <div className="flex items-center gap-4">
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

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chart Area */}
        <div className="flex-1 border-r border-[#1e2a3a] flex flex-col min-w-0">
          <div className="flex-1 relative min-h-0" ref={chartContainerRef} />

          {/* Positions Panel */}
          <div className="h-44 border-t border-[#1e2a3a] bg-[#0a0e1a] flex flex-col shrink-0">
            <div className="px-4 py-2 border-b border-[#1e2a3a] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Open Positions ({openOrders.length})
              </span>
              {openOrders.length > 0 && (
                <span
                  className={`text-xs font-mono font-semibold ${
                    totalFloatingPnl >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Float: {totalFloatingPnl >= 0 ? "+" : ""}${totalFloatingPnl.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
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
                      <tr
                        key={order.id}
                        data-testid={`position-row-${order.id}`}
                        className="border-t border-[#1e2a3a]/50 hover:bg-[#1e2a3a]/20"
                      >
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
                        <td
                          className={`px-3 py-1.5 text-right font-mono font-semibold ${
                            livePnl >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {livePnl >= 0 ? "+" : ""}${livePnl.toFixed(2)}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <button
                            data-testid={`close-order-${order.id}`}
                            onClick={() => handleClose(order.id)}
                            disabled={closeOrderMut.isPending}
                            className="text-[10px] px-2 py-0.5 rounded border border-[#334155] text-[#94a3b8] hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {openOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[#64748b]">
                        No open positions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="w-72 bg-[#0a0e1a] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#1e2a3a]">
            <h3 className="font-semibold mb-3 text-sm text-white">New Order</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#64748b] mb-1.5 block uppercase tracking-wider">
                  Volume (Lots)
                </label>
                <div className="flex gap-1.5">
                  <button
                    data-testid="size-decrease"
                    className="h-9 w-9 border border-[#1e2a3a] bg-[#050a14] text-white rounded flex items-center justify-center hover:border-[#334155] shrink-0"
                    onClick={() => setSize((Math.max(0.01, parseFloat(size) - 0.1)).toFixed(2))}
                  >
                    -
                  </button>
                  <Input
                    data-testid="size-input"
                    type="number"
                    step="0.01"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="h-9 text-center font-mono border-[#1e2a3a] bg-[#050a14] text-sm"
                  />
                  <button
                    data-testid="size-increase"
                    className="h-9 w-9 border border-[#1e2a3a] bg-[#050a14] text-white rounded flex items-center justify-center hover:border-[#334155] shrink-0"
                    onClick={() => setSize((parseFloat(size) + 0.1).toFixed(2))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  data-testid="sell-button"
                  className="h-14 bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center gap-0.5 rounded-lg"
                  onClick={() => handleOrder("sell")}
                  disabled={createOrderMut.isPending}
                >
                  <span className="text-[11px] uppercase font-bold tracking-wider">Sell</span>
                  <span className="font-mono text-xs">
                    {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
                  </span>
                </Button>
                <Button
                  data-testid="buy-button"
                  className="h-14 bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center gap-0.5 rounded-lg"
                  onClick={() => handleOrder("buy")}
                  disabled={createOrderMut.isPending}
                >
                  <span className="text-[11px] uppercase font-bold tracking-wider">Buy</span>
                  <span className="font-mono text-xs">
                    {currentPrice > 0 ? currentPrice.toFixed(priceDecimals(symbol)) : "—"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <h3 className="text-[11px] font-semibold mb-2 text-[#64748b] uppercase tracking-wider">
              Instruments
            </h3>
            <div className="space-y-0.5">
              {SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  data-testid={`instrument-${sym}`}
                  className={`w-full text-left px-3 py-2 rounded text-xs flex justify-between items-center transition-colors ${
                    symbol === sym
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-[#1e2a3a] text-[#94a3b8]"
                  }`}
                  onClick={() => setSymbol(sym)}
                >
                  <span className="font-semibold">{sym}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
