import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { useGetAccount, useListOrders, useCreateOrder, useGetMarketPrice, getListOrdersQueryKey, getGetAccountQueryKey } from "@workspace/api-client-react";
import { createChart, ColorType, CandlestickSeries, IChartApi } from 'lightweight-charts';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PriceTicker from "@/components/PriceTicker";

export default function Trade() {
  const { accountId } = useParams();
  const id = parseInt(accountId || "0", 10);
  const queryClient = useQueryClient();
  
  const { data: account } = useGetAccount(id, { query: { enabled: !!id, queryKey: getGetAccountQueryKey(id) } });
  const { data: orders } = useListOrders(id, { query: { enabled: !!id, queryKey: getListOrdersQueryKey(id) } });
  
  const [symbol, setSymbol] = useState("EURUSD");
  const { data: marketPrice } = useGetMarketPrice({ symbol }, { query: { enabled: true, refetchInterval: 1000 } });
  
  const createOrderMut = useCreateOrder();
  
  const [size, setSize] = useState("1.0");
  
  const handleOrder = (side: "buy" | "sell") => {
    createOrderMut.mutate({
      accountId: id,
      data: {
        symbol,
        side,
        size: parseFloat(size),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey(id) });
      }
    });
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#050a14' }, textColor: '#94a3b8' },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: { vertLines: { color: '#1e2a3a' }, horzLines: { color: '#1e2a3a' } },
    });
    
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });
    
    // Mock data for the visual
    const data = [];
    let price = 1.1000;
    let time = Math.floor(Date.now() / 1000) - 86400 * 30;
    
    for (let i = 0; i < 100; i++) {
      const open = price;
      const close = price + (Math.random() - 0.5) * 0.01;
      const high = Math.max(open, close) + Math.random() * 0.005;
      const low = Math.min(open, close) - Math.random() * 0.005;
      data.push({ time: time as any, open, high, low, close });
      price = close;
      time += 86400;
    }
    
    series.setData(data);
    chart.timeScale().fitContent();
    
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  const openOrders = orders?.filter(o => o.status === 'open') || [];

  return (
    <div className="h-screen flex flex-col bg-[#050a14] overflow-hidden">
      <PriceTicker />
      {/* Top Bar */}
      <div className="h-14 border-b border-[#1e2a3a] flex items-center px-4 justify-between bg-[#0a0e1a]">
        <div className="flex items-center gap-6">
          <div className="font-mono text-xl font-bold text-white">{symbol}</div>
          <div className={`font-mono text-lg ${marketPrice && marketPrice.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {marketPrice?.price?.toFixed(5) || "1.0000"}
          </div>
        </div>
        
        {account && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-[#64748b] text-xs">Balance</span>
              <span className="font-mono font-medium">${account.currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#64748b] text-xs">Equity</span>
              <span className="font-mono font-medium">${account.equity.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#64748b] text-xs">Day PnL</span>
              <span className={`font-mono font-medium ${account.dailyPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {account.dailyPnl >= 0 ? '+' : ''}${account.dailyPnl.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 border-r border-[#1e2a3a] flex flex-col">
          <div className="flex-1 relative" ref={chartContainerRef}></div>
          
          {/* Positions */}
          <div className="h-48 border-t border-[#1e2a3a] bg-[#0a0e1a] flex flex-col">
            <div className="px-4 py-2 border-b border-[#1e2a3a] text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Open Positions ({openOrders.length})
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[#64748b] sticky top-0 bg-[#0a0e1a]">
                  <tr>
                    <th className="font-normal px-4 py-2">Symbol</th>
                    <th className="font-normal px-4 py-2">Side</th>
                    <th className="font-normal px-4 py-2 text-right">Size</th>
                    <th className="font-normal px-4 py-2 text-right">Open</th>
                    <th className="font-normal px-4 py-2 text-right">Current</th>
                    <th className="font-normal px-4 py-2 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders.map(order => (
                    <tr key={order.id} className="border-t border-[#1e2a3a]/50 hover:bg-[#1e2a3a]/30">
                      <td className="px-4 py-2 font-medium">{order.symbol}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className={order.side === 'buy' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}>
                          {order.side.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{order.size}</td>
                      <td className="px-4 py-2 text-right font-mono">{order.openPrice.toFixed(5)}</td>
                      <td className="px-4 py-2 text-right font-mono">{order.currentPrice?.toFixed(5) || "-"}</td>
                      <td className={`px-4 py-2 text-right font-mono font-medium ${order.pnl && order.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {order.pnl && order.pnl > 0 ? '+' : ''}{order.pnl?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                  {openOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">No open positions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Order Panel */}
        <div className="w-80 bg-[#0a0e1a] flex flex-col">
          <div className="p-4 border-b border-[#1e2a3a]">
            <h3 className="font-semibold mb-4">New Order</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Lots</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 border-[#1e2a3a] bg-transparent" onClick={() => setSize((Math.max(0.01, parseFloat(size) - 0.1)).toFixed(2))}>-</Button>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={size} 
                    onChange={e => setSize(e.target.value)}
                    className="h-10 text-center font-mono border-[#1e2a3a] bg-[#050a14]"
                  />
                  <Button variant="outline" size="icon" className="h-10 w-10 border-[#1e2a3a] bg-transparent" onClick={() => setSize((parseFloat(size) + 0.1).toFixed(2))}>+</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  className="h-14 bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center gap-1"
                  onClick={() => handleOrder("sell")}
                  disabled={createOrderMut.isPending}
                >
                  <span className="text-xs uppercase font-bold tracking-wider">Sell</span>
                  <span className="font-mono">{marketPrice?.price?.toFixed(5) || "1.0000"}</span>
                </Button>
                <Button 
                  className="h-14 bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center gap-1"
                  onClick={() => handleOrder("buy")}
                  disabled={createOrderMut.isPending}
                >
                  <span className="text-xs uppercase font-bold tracking-wider">Buy</span>
                  <span className="font-mono">{marketPrice?.price?.toFixed(5) || "1.0000"}</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 flex-1">
            <h3 className="text-sm font-semibold mb-3 text-[#64748b]">Instruments</h3>
            <div className="space-y-1">
              {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'].map(sym => (
                <button 
                  key={sym}
                  className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${symbol === sym ? 'bg-primary/20 text-primary' : 'hover:bg-[#1e2a3a] text-[#94a3b8]'}`}
                  onClick={() => setSymbol(sym)}
                >
                  <span className="font-medium">{sym}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
