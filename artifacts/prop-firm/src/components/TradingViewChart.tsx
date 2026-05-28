import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
}

const scriptSrc = "https://s3.tradingview.com/tv.js";

export default function TradingViewChart({ symbol = "OANDA:XAUUSD", interval = "15" }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    const widgetId = `tv-widget-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    containerRef.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetId;
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = "100%";
    containerRef.current.appendChild(widgetDiv);

    const createWidget = () => {
      if (cancelled || !(window as any).TradingView) return;

      new (window as any).TradingView.widget({
        width: "100%",
        height: "100%",
        symbol,
        interval,
        timezone: "Europe/Lisbon",
        theme: "dark",
        style: "1",
        locale: "pt",
        toolbar_bg: "#0B0E14",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: widgetId,
        hide_side_toolbar: false,
        hide_legend: false,
        save_image: true,
        calendar: false,
        hide_volume: false,
        support_host: "https://www.tradingview.com",
        studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "MASimple@tv-basicstudies"],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
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
  }, [symbol, interval]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "100%" }} />;
}
