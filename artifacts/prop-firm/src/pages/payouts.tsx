import { useState } from "react";
import { useListMyPayouts, useListAccounts, useRequestPayout, getListMyPayoutsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Payouts() {
  const { data: payouts, isLoading: payoutsLoading } = useListMyPayouts();
  const { data: accounts } = useListAccounts();
  
  const requestPayout = useRequestPayout();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");

  const fundedAccounts = accounts?.filter(a => a.status === 'funded' || a.status === 'passed') || [];

  const handleRequest = () => {
    if (!accountId || !amount || !wallet) return;
    
    requestPayout.mutate({
      data: {
        accountId: parseInt(accountId, 10),
        amount: parseFloat(amount),
        walletAddress: wallet
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyPayoutsQueryKey() });
        setOpen(false);
        setAccountId("");
        setAmount("");
        setWallet("");
        toast({
          title: "Payout Requested",
          description: "Your payout request has been submitted for review.",
        });
      },
      onError: () => {
        toast({
          title: "Request Failed",
          description: "Unable to submit payout request. Please verify details.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground mt-1">Manage your profit withdrawals</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={fundedAccounts.length === 0}>
          <Wallet className="w-4 h-4 mr-2" />
          Request Payout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : payouts && payouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map(payout => (
                  <TableRow key={payout.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payout.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono">#{payout.accountId}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-green-500">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{payout.walletAddress.substring(0, 10)}...{payout.walletAddress.substring(payout.walletAddress.length - 4)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        payout.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        payout.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }>
                        {payout.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No payouts found.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Withdraw profits from your funded accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select funded account" />
                </SelectTrigger>
                <SelectContent>
                  {fundedAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.challengeName} (#{acc.id}) - PnL: ${acc.totalPnl.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
            <div className="space-y-2">
              <Label>Crypto Wallet Address (USDT/USDC/BTC)</Label>
              <Input 
                value={wallet} 
                onChange={(e) => setWallet(e.target.value)} 
                placeholder="0x..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleRequest} disabled={!accountId || !amount || !wallet || requestPayout.isPending}>
              {requestPayout.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
