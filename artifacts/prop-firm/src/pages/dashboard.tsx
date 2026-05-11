import { useGetMyStats, useListAccounts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, AlertTriangle, Plus, TrendingUp, TrendingDown, BarChart3, CheckCircle, Target, Shield, Calendar } from "lucide-react";
import PriceTicker from "@/components/PriceTicker";

function fmt(n: number) {
  return n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtK(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(0) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetMyStats({ query: { refetchInterval: 3000 } });
  const { data: accounts, isLoading: accountsLoading } = useListAccounts({ query: { refetchInterval: 3000 } });

  const totalPnl = stats?.totalPnl ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visão geral das suas contas de trading</p>
        </div>
        <Link href="/challenges">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Desafio
          </Button>
        </Link>
      </div>

      {/* Live Price Ticker */}
      <PriceTicker />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Contas</span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {statsLoading ? "—" : stats?.totalAccounts ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Contas Ativas</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums text-primary">
              {statsLoading ? "—" : stats?.activeAccounts ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">PnL Total</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {totalPnl >= 0
                  ? <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                }
              </div>
            </div>
            <div className={`text-2xl font-bold tabular-nums font-mono truncate ${totalPnl > 0 ? "text-green-500" : totalPnl < 0 ? "text-red-500" : ""}`}>
              {statsLoading ? "—" : `${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Aprovadas</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums text-purple-500">
              {statsLoading ? "—" : stats?.passedAccounts ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-bold mb-4">As Suas Contas</h2>

      {accountsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-52" />
            </Card>
          ))}
        </div>
      ) : accounts && Array.isArray(accounts) && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(account => {
            const pnl = account.totalPnl ?? 0;
            const floatingPnl = account.floatingPnl ?? 0;
            const initialBalance = account.initialBalance ?? account.equity;
            const profitTarget = 8;
            const maxTotalDrawdown = 10;
            const tradingDays = account.tradingDays ?? 0;
            const minTradingDays = account.minTradingDays ?? 2;

            const pnlPct = initialBalance > 0 ? (pnl / initialBalance) * 100 : 0;
            const profitProgress = Math.min((pnlPct / profitTarget) * 100, 100);
            const ddProgress = Math.min((account.maxDrawdownReached / maxTotalDrawdown) * 100, 100);
            const daysProgress = Math.min((tradingDays / minTradingDays) * 100, 100);

            const statusConfig = {
              active: { bar: "bg-blue-500", badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30", label: "ATIVA" },
              funded: { bar: "bg-purple-500", badge: "bg-purple-500/15 text-purple-400 border border-purple-500/30", label: "FUNDED" },
              passed: { bar: "bg-green-500", badge: "bg-green-500/15 text-green-400 border border-green-500/30", label: "APROVADA" },
              failed: { bar: "bg-red-500", badge: "bg-red-500/15 text-red-400 border border-red-500/30", label: "FALHADA" },
            }[account.status] ?? { bar: "bg-gray-500", badge: "bg-gray-500/15 text-gray-400 border border-gray-500/30", label: account.status.toUpperCase() };

            const ddColor = account.maxDrawdownReached >= maxTotalDrawdown * 0.8
              ? "text-red-400" : account.maxDrawdownReached >= maxTotalDrawdown * 0.5
              ? "text-yellow-400" : "text-foreground";

            return (
              <Card key={account.id} className="overflow-hidden hover:border-primary/40 transition-all duration-200 flex flex-col">
                {/* Status bar */}
                <div className={`h-0.5 w-full ${statusConfig.bar}`} />

                {/* Header */}
                <CardHeader className="px-4 pb-2 pt-4">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-bold leading-tight truncate">{account.challengeName}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">#{String(account.id).padStart(4, "0")}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest shrink-0 whitespace-nowrap ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 px-4 pt-0 pb-4 flex-1">
                  {/* Financial values */}
                  <div className="rounded-lg border border-white/5 bg-muted/20 overflow-hidden divide-y divide-white/5">
                    {[
                      { label: "Equity", value: `$${fmt(account.equity)}`, color: "" },
                      { label: "Saldo", value: `$${fmt(account.currentBalance)}`, color: "" },
                      {
                        label: "PnL Realizado",
                        value: `${pnl >= 0 ? "+" : ""}$${fmt(pnl)}`,
                        sub: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`,
                        color: pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : "",
                      },
                      {
                        label: "PnL Flutuante",
                        value: `${floatingPnl >= 0 ? "+" : ""}$${fmt(floatingPnl)}`,
                        color: floatingPnl > 0 ? "text-green-400" : floatingPnl < 0 ? "text-red-400" : "",
                      },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} className="flex items-center justify-between px-3 py-2 gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                        <span className={`text-xs font-bold font-mono tabular-nums truncate text-right ${color}`}>
                          {value}
                          {sub && <span className="text-[10px] font-normal opacity-60 ml-1">{sub}</span>}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2.5">
                    {/* Profit target */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Target className="w-3 h-3 shrink-0" />
                          <span>Objetivo de Lucro</span>
                        </span>
                        <span className="font-semibold font-mono ml-2 whitespace-nowrap">
                          <span className={pnlPct >= profitTarget ? "text-green-400" : "text-foreground"}>{pnlPct.toFixed(1)}%</span>
                          <span className="text-muted-foreground"> / {profitTarget}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${profitProgress}%` }} />
                      </div>
                    </div>

                    {/* Drawdown */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Shield className="w-3 h-3 shrink-0" />
                          <span>Drawdown Total</span>
                        </span>
                        <span className="font-semibold font-mono ml-2 whitespace-nowrap">
                          <span className={ddColor}>{account.maxDrawdownReached.toFixed(1)}%</span>
                          <span className="text-muted-foreground"> / {maxTotalDrawdown}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${ddProgress >= 80 ? "bg-red-500" : ddProgress >= 50 ? "bg-yellow-500" : "bg-blue-500"}`}
                          style={{ width: `${ddProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Trading days */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Dias de Trading</span>
                        </span>
                        <span className="font-semibold font-mono ml-2 whitespace-nowrap">
                          <span className={tradingDays >= minTradingDays ? "text-green-400" : "text-foreground"}>{tradingDays}</span>
                          <span className="text-muted-foreground"> / {minTradingDays} mín.</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${daysProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/trade/${account.id}`} className="mt-auto block">
                    <Button
                      className="w-full font-semibold h-9 text-sm"
                      variant={account.status === "active" || account.status === "funded" ? "default" : "secondary"}
                    >
                      <Activity className="w-3.5 h-3.5 mr-1.5" />
                      Abrir Terminal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-2">Sem contas ativas</h3>
          <p className="text-muted-foreground text-sm mb-5">Compra um desafio para começar a negociar.</p>
          <Link href="/challenges">
            <Button size="sm">Ver Desafios</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
