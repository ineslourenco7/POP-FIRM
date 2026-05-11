import { useGetMyStats, useListAccounts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, AlertTriangle, Plus, TrendingUp, TrendingDown, BarChart3, CheckCircle, Target, Shield, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  const { data: stats, isLoading: statsLoading } = useGetMyStats();
  const { data: accounts, isLoading: accountsLoading } = useListAccounts();

  const totalPnl = stats?.totalPnl ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral das suas contas de trading</p>
        </div>
        <Link href="/challenges">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Desafio
          </Button>
        </Link>
      </div>

      {/* Live Price Ticker */}
      <PriceTicker />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total Contas</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {statsLoading ? "—" : stats?.totalAccounts ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Contas Ativas</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums text-primary">
              {statsLoading ? "—" : stats?.activeAccounts ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">PnL Total</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {totalPnl >= 0
                  ? <TrendingUp className="w-4 h-4 text-green-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />
                }
              </div>
            </div>
            <div className={`text-3xl font-bold tabular-nums font-mono ${totalPnl > 0 ? "text-green-500" : totalPnl < 0 ? "text-red-500" : ""}`}>
              {statsLoading ? "—" : `${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Aprovadas</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums text-purple-500">
              {statsLoading ? "—" : stats?.passedAccounts ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">As Suas Contas</h2>

      {accountsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-52" />
            </Card>
          ))}
        </div>
      ) : accounts && Array.isArray(accounts) && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => {
            const pnl = account.totalPnl ?? 0;
            const floatingPnl = account.floatingPnl ?? 0;
            const initialBalance = account.initialBalance ?? account.equity;
            const profitTarget = 8;
            const maxTotalDrawdown = 10;
            const tradingDays = account.tradingDays ?? 0;
            const minTradingDays = 5;

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
                <CardHeader className="pb-2 pt-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-base font-bold leading-tight">{account.challengeName}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">#{String(account.id).padStart(4, "0")}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest shrink-0 ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 pt-0 flex-1">
                  {/* Equity + Balance row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-xl p-3 border border-white/5">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">Equity</div>
                      <div className="text-xl font-black font-mono tabular-nums">${fmt(account.equity)}</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3 border border-white/5">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">Saldo</div>
                      <div className="text-xl font-black font-mono tabular-nums">${fmt(account.currentBalance)}</div>
                    </div>
                  </div>

                  {/* PnL row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-xl p-3 border border-white/5">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">PnL Realizado</div>
                      <div className={`text-base font-bold font-mono tabular-nums ${pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : "text-foreground"}`}>
                        {pnl >= 0 ? "+" : ""}${fmt(pnl)}
                        <span className="text-xs font-normal ml-1 opacity-70">({pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3 border border-white/5">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">PnL Flutuante</div>
                      <div className={`text-base font-bold font-mono tabular-nums ${floatingPnl > 0 ? "text-green-400" : floatingPnl < 0 ? "text-red-400" : "text-foreground"}`}>
                        {floatingPnl >= 0 ? "+" : ""}${fmt(floatingPnl)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-3">
                    {/* Profit target */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Target className="w-3 h-3" /> Objetivo de Lucro
                        </span>
                        <span className="font-semibold font-mono">
                          <span className={pnlPct >= profitTarget ? "text-green-400" : "text-foreground"}>{pnlPct.toFixed(2)}%</span>
                          <span className="text-muted-foreground"> / {profitTarget}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${profitProgress}%` }} />
                      </div>
                    </div>

                    {/* Drawdown */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Shield className="w-3 h-3" /> Drawdown Total
                        </span>
                        <span className="font-semibold font-mono">
                          <span className={ddColor}>{account.maxDrawdownReached.toFixed(2)}%</span>
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
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3" /> Dias de Trading
                        </span>
                        <span className="font-semibold font-mono">
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
                  <Link href={`/trade/${account.id}`} className="mt-auto">
                    <Button
                      className="w-full font-semibold h-10"
                      variant={account.status === "active" || account.status === "funded" ? "default" : "secondary"}
                    >
                      <Activity className="w-4 h-4 mr-2" />
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
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sem contas ativas</h3>
          <p className="text-muted-foreground mb-6">Compra um desafio para começar a negociar.</p>
          <Link href="/challenges">
            <Button>Ver Desafios</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
