import { useEffect, useId, useRef } from "react";

type TradingViewChartProps = {
  symbol: string;
  interval?: string;
};

const scriptSrc = ["https:", "", "s3.tradingview.com", "tv.js"].join("/");

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
        symbol,
        interval,
        timezone: "Europe/Lisbon",
        theme: "dark",
        style: "1",
        locale: "pt",
        toolbar_bg: "#0a0e1a",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        calendar: false,
        withdateranges: true,
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
