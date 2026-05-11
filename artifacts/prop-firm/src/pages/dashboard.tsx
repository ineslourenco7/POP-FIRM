import { useGetMyStats, useListAccounts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, AlertTriangle, Plus, TrendingUp, TrendingDown, BarChart3, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetMyStats();
  const { data: accounts, isLoading: accountsLoading } = useListAccounts();

  const totalPnl = stats?.totalPnl ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
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
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => {
            const pnl = account.totalPnl ?? 0;
            const statusConfig = {
              active: { color: "bg-primary", badge: "bg-primary/20 text-primary", label: "ATIVA" },
              funded: { color: "bg-purple-500", badge: "bg-purple-500/20 text-purple-400", label: "FUNDED" },
              passed: { color: "bg-green-500", badge: "bg-green-500/20 text-green-400", label: "APROVADA" },
              failed: { color: "bg-red-500", badge: "bg-red-500/20 text-red-400", label: "FALHADA" },
            }[account.status] ?? { color: "bg-gray-500", badge: "bg-gray-500/20 text-gray-400", label: account.status.toUpperCase() };

            return (
              <Card key={account.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <div className={`h-1 w-full ${statusConfig.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold">{account.challengeName}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5">ID #{ account.id}</div>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold tracking-wide ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {/* Balance & Equity Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/40 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Equity</div>
                      <div className="text-lg font-bold font-mono">${account.equity.toFixed(2)}</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">PnL Total</div>
                      <div className={`text-lg font-bold font-mono ${pnl > 0 ? "text-green-500" : pnl < 0 ? "text-red-500" : "text-foreground"}`}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Drawdown Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Drawdown Máx.</span>
                      <span className={`font-semibold font-mono ${account.maxDrawdownReached > 8 ? "text-red-500" : account.maxDrawdownReached > 5 ? "text-yellow-500" : "text-foreground"}`}>
                        {account.maxDrawdownReached.toFixed(2)}% / 10%
                      </span>
                    </div>
                    <Progress
                      value={(account.maxDrawdownReached / 10) * 100}
                      className="h-2"
                    />
                  </div>

                  <Link href={`/trade/${account.id}`}>
                    <Button
                      className="w-full"
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
