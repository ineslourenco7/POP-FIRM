import { useGetLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10">
        <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
        <h1 className="text-4xl font-bold tracking-tight mb-2">Global Leaderboard</h1>
        <p className="text-muted-foreground">Top performing traders on QuantFund</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Traders</CardTitle>
          <CardDescription>Ranked by Total PnL percentage</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead>Account Size</TableHead>
                  <TableHead className="text-right">Total PnL</TableHead>
                  <TableHead className="text-right">Return %</TableHead>
                  <TableHead className="text-center">Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.rank} className={entry.rank <= 3 ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">
                      {entry.rank === 1 ? <Medal className="w-5 h-5 text-yellow-500 inline mr-1" /> :
                       entry.rank === 2 ? <Medal className="w-5 h-5 text-gray-400 inline mr-1" /> :
                       entry.rank === 3 ? <Medal className="w-5 h-5 text-amber-600 inline mr-1" /> :
                       <span className="text-muted-foreground w-5 inline-block text-center">{entry.rank}</span>}
                    </TableCell>
                    <TableCell className="font-bold">{entry.displayName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">${entry.accountSize.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${entry.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.totalPnl >= 0 ? '+' : ''}${entry.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${entry.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {entry.pnlPercent >= 0 ? '+' : ''}{entry.pnlPercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">{entry.tradingDays}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        entry.status === 'funded' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                        entry.status === 'passed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }>
                        {entry.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
