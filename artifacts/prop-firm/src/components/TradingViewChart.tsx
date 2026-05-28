import { useEffect, useId, useRef } from "react";

type TradingViewChartProps = {
  symbol: string;
  interval?: string;
};

const scriptSrc = ["https:", "", "s3.tradingview.com", "tv.js"].join("/");

function normalizeTradingViewSymbol(symbol: string) {
  if (symbol.includes(":")) return symbol;
  const clean = symbol.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (["XAUUSD", "XAGUSD"].includes(clean)) return `OANDA:${clean}`;
  if (["BTCUSD", "ETHUSD"].includes(clean)) return `BINANCE:${clean.replace("USD", "USDT")}`;
  if (["NAS100", "NDX"].includes(clean)) return "NASDAQ:NDX";
  if (["US30", "DJI"].includes(clean)) return "DJ:DJI";
  if (["SPX500", "SP500", "SPX"].includes(clean)) return "SP:SPX";
  if (["USOIL", "OIL", "CRUDE"].includes(clean)) return "TVC:USOIL";
  return `FX:${clean}`;
}

export default function TradingViewChart({ symbol, interval = "60" }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const containerId = `tradingview_${reactId}`;

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    container.id = containerId;
    container.innerHTML = "";

    const createWidget = () => {
      if (cancelled || !containerRef.current || !(window as any).TradingView) return;
      containerRef.current.innerHTML = "";
      new (window as any).TradingView.widget({
        autosize: true,
        symbol: normalizeTradingViewSymbol(symbol),
        interval,
        timezone: "Europe/Lisbon",
        theme: "dark",
        style: "1",
        locale: "pt",
        toolbar_bg: "#131722",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: true,
        calendar: false,
        withdateranges: true,
        studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "MASimple@tv-basicstudies"],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        container_id: containerId,
      });
    };

    if ((window as any).TradingView) {
      createWidget();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);
      if (existing) {
        existing.addEventListener("load", createWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = scriptSrc;
        script.async = true;
        script.onload = createWidget;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [containerId, interval, symbol]);

  return <div ref={containerRef} className="h-full min-h-[500px] w-full bg-[#050a14]" />;
}
