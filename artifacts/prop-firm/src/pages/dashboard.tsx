import { useGetMyStats, useListAccounts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowUpRight, TrendingUp, Activity, AlertTriangle, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetMyStats();
  const { data: accounts, isLoading: accountsLoading } = useListAccounts();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your trading accounts</p>
        </div>
        <Link href="/challenges">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Challenge
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? "-" : stats?.totalAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{statsLoading ? "-" : stats?.activeAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PnL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats?.totalPnl && stats.totalPnl > 0 ? 'text-green-500' : stats?.totalPnl && stats.totalPnl < 0 ? 'text-red-500' : ''}`}>
              {statsLoading ? "-" : `${stats?.totalPnl && stats.totalPnl > 0 ? '+' : ''}$${stats?.totalPnl?.toFixed(2) || '0.00'}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{statsLoading ? "-" : stats?.passedAccounts}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Accounts</h2>
      
      {accountsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48"></CardContent>
            </Card>
          ))}
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <Card key={account.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <div className={`h-1 w-full ${
                account.status === 'active' ? 'bg-primary' : 
                account.status === 'funded' ? 'bg-purple-500' : 
                account.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{account.challengeName}</CardTitle>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">ID: #{account.id}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    account.status === 'active' ? 'bg-primary/20 text-primary' : 
                    account.status === 'funded' ? 'bg-purple-500/20 text-purple-500' : 
                    account.status === 'passed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {account.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-muted-foreground">Equity</div>
                    <div className="text-2xl font-bold">${account.equity.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">PnL</div>
                    <div className={`font-semibold ${account.totalPnl > 0 ? 'text-green-500' : account.totalPnl < 0 ? 'text-red-500' : ''}`}>
                      {account.totalPnl > 0 ? '+' : ''}${account.totalPnl.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Drawdown</span>
                    <span className={account.maxDrawdownReached > 8 ? "text-red-500" : ""}>{account.maxDrawdownReached.toFixed(1)}%</span>
                  </div>
                  <Progress value={(account.maxDrawdownReached / 10) * 100} className="h-1.5" />
                </div>

                <Link href={`/trade/${account.id}`}>
                  <Button className="w-full mt-2" variant={account.status === 'active' || account.status === 'funded' ? "default" : "secondary"}>
                    <Activity className="w-4 h-4 mr-2" />
                    Open Terminal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No active accounts</h3>
          <p className="text-muted-foreground mb-6">Purchase a challenge to start trading.</p>
          <Link href="/challenges">
            <Button>View Challenges</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
