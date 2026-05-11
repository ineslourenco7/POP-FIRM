import { useState, useEffect, useRef } from "react";
import { useGetMarketPrice } from "@workspace/api-client-react";
import { EyeOff, Eye } from "lucide-react";

const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "NAS100", "US30", "USDCHF", "AUDUSD", "ETHUSD", "XAGUSD", "CRUDE", "SP500", "NZDUSD", "EURGBP"];

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

  const decimals =
    ["USDJPY", "EURJPY", "GBPJPY"].includes(symbol) ? 3
    : ["BTCUSD", "ETHUSD", "NAS100", "US30", "SP500", "XAUUSD", "CRUDE"].includes(symbol) ? 2
    : symbol === "XAGUSD" ? 3
    : 5;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1 rounded shrink-0 transition-colors duration-300 ${flash === "up" ? "bg-green-500/10" : flash === "down" ? "bg-red-500/10" : ""}`}
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

interface PriceTickerProps {
  visible?: boolean;
  onToggle?: () => void;
}

export default function PriceTicker({ visible = true, onToggle }: PriceTickerProps) {
  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {visible && (
        <div
          data-testid="price-ticker"
          className="h-9 bg-[#050a14] border-b border-[#1e2a3a] flex items-center overflow-hidden relative"
        >
          {/* Live badge */}
          <div className="flex items-center gap-1 px-2 shrink-0 border-r border-[#1e2a3a] pr-3 mr-1 z-10 bg-[#050a14]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-semibold">Live</span>
          </div>

          {/* Scrolling track — items duplicated for seamless loop */}
          <div className="flex-1 overflow-hidden">
            <div className="ticker-track">
              {[...SYMBOLS, ...SYMBOLS].map((sym, i) => (
                <TickerItem key={`${sym}-${i}`} symbol={sym} />
              ))}
            </div>
          </div>

          {/* Hide button */}
          {onToggle && (
            <button
              onClick={onToggle}
              title="Esconder ticker"
              className="shrink-0 px-2 h-full flex items-center text-[#64748b] hover:text-white transition-colors bg-[#050a14] border-l border-[#1e2a3a] z-10"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Collapsed bar — show button */}
      {!visible && onToggle && (
        <div className="h-5 bg-[#050a14] border-b border-[#1e2a3a] flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-semibold">Live</span>
          </div>
          <button
            onClick={onToggle}
            title="Mostrar ticker"
            className="flex items-center gap-1 text-[#64748b] hover:text-white transition-colors text-[10px]"
          >
            <Eye className="w-3 h-3" /> Mostrar preços
          </button>
        </div>
      )}
    </>
  );
}
