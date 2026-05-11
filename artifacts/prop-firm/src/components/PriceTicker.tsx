import { useState, useEffect, useRef } from "react";
import { useGetMarketPrice } from "@workspace/api-client-react";

const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "NAS100", "US30", "USDCHF", "AUDUSD", "ETHUSD"];

function TickerItem({ symbol }: { symbol: string }) {
  const { data } = useGetMarketPrice({ symbol }, { query: { enabled: true, refetchInterval: 1000 } });
  const prevPrice = useRef<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!data?.price) return;
    if (prevPrice.current !== null && prevPrice.current !== data.price) {
      setFlash(data.price > prevPrice.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(t);
    }
    prevPrice.current = data.price;
  }, [data?.price]);

  const price = data?.price;
  const change = data?.change ?? 0;
  const isUp = change >= 0;

  const decimals = symbol === "USDJPY" ? 3 : symbol === "XAUUSD" ? 2 : symbol === "BTCUSD" || symbol === "ETHUSD" ? 2 : symbol === "NAS100" || symbol === "US30" || symbol === "SP500" ? 2 : 5;

  return (
    <div
      data-testid={`ticker-${symbol}`}
      className={`flex items-center gap-2 px-4 py-1 rounded transition-colors duration-300 ${flash === "up" ? "bg-green-500/10" : flash === "down" ? "bg-red-500/10" : ""}`}
    >
      <span className="text-[#64748b] text-xs font-medium tracking-wide">{symbol}</span>
      <span className={`font-mono text-sm font-semibold tabular-nums transition-colors duration-300 ${flash === "up" ? "text-green-400" : flash === "down" ? "text-red-400" : "text-white"}`}>
        {price != null ? price.toFixed(decimals) : "—"}
      </span>
      <span className={`text-xs font-mono ${isUp ? "text-green-500" : "text-red-500"}`}>
        {isUp ? "+" : ""}{change.toFixed(4)}
      </span>
    </div>
  );
}

export default function PriceTicker() {
  return (
    <div
      data-testid="price-ticker"
      className="h-9 bg-[#050a14] border-b border-[#1e2a3a] flex items-center overflow-hidden"
    >
      <div className="flex items-center gap-1 px-2 shrink-0 border-r border-[#1e2a3a] pr-3 mr-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-semibold">Live</span>
      </div>
      <div className="flex items-center overflow-x-auto scrollbar-none gap-1 flex-1">
        {SYMBOLS.map(sym => (
          <TickerItem key={sym} symbol={sym} />
        ))}
      </div>
    </div>
  );
}
