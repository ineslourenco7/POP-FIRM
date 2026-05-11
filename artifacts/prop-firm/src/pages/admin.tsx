import { useState } from "react";
import { 
  useAdminGetStats, 
  useAdminListPayments, 
  useAdminListPayouts, 
  useAdminApprovePayment,
  useAdminRejectPayment,
  useAdminApprovePayout,
  useAdminRejectPayout,
  getAdminGetStatsQueryKey,
  getAdminListPaymentsQueryKey,
  getAdminListPayoutsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Users, CreditCard, Wallet, Activity, Check, X } from "lucide-react";

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: stats } = useAdminGetStats();
  const { data: payments } = useAdminListPayments();
  const { data: payouts } = useAdminListPayouts();

  const approvePayment = useAdminApprovePayment();
  const rejectPayment = useAdminRejectPayment();
  const approvePayout = useAdminApprovePayout();
  const rejectPayout = useAdminRejectPayout();

  const handleApprovePayment = (id: number) => {
    approvePayment.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
        toast({ title: "Payment Approved" });
      }
    });
  };

  const handleRejectPayment = (id: number) => {
    rejectPayment.mutate({ id, data: { notes: "Rejected by admin" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPaymentsQueryKey() });
        toast({ title: "Payment Rejected", variant: "destructive" });
      }
    });
  };

  const handleApprovePayout = (id: number) => {
    approvePayout.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPayoutsQueryKey() });
        toast({ title: "Payout Approved" });
      }
    });
  };

  const handleRejectPayout = (id: number) => {
    rejectPayout.mutate({ id, data: { notes: "Rejected by admin" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPayoutsQueryKey() });
        toast({ title: "Payout Rejected", variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingPayments || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.activeAccounts || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">Payments ({payments?.filter(p => p.status === 'pending').length || 0})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts?.filter(p => p.status === 'pending').length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.userEmail}</TableCell>
                      <TableCell>{payment.challengeName}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell className="font-mono">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {payment.proofUrl ? (
                          <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : ''}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {payment.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20" onClick={() => handleApprovePayment(payment.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20" onClick={() => handleRejectPayment(payment.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts?.map(payout => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.userEmail}</TableCell>
                      <TableCell className="font-mono">#{payout.accountId}</TableCell>
                      <TableCell className="font-mono text-green-500 font-medium">${payout.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-xs">{payout.walletAddress}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={payout.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : ''}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {payout.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20" onClick={() => handleApprovePayout(payout.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20" onClick={() => handleRejectPayout(payout.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
