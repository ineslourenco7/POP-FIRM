import { useState } from "react";
import {
  useAdminGetStats,
  useAdminListPayments,
  useAdminListPayouts,
  useAdminListUsers,
  useAdminApprovePayment,
  useAdminRejectPayment,
  useAdminApprovePayout,
  useAdminRejectPayout,
  getAdminGetStatsQueryKey,
  getAdminListPaymentsQueryKey,
  getAdminListPayoutsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Users, CreditCard, Wallet, Activity, Check, X,
  TrendingUp, TrendingDown, ShieldCheck, ShieldX, Clock, DollarSign,
} from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "text-foreground",
  iconBg = "bg-muted/60",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  iconBg?: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-4 h-4 text-foreground/70" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  funded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useAdminGetStats();
  const { data: payments } = useAdminListPayments();
  const { data: payouts } = useAdminListPayouts();
  const { data: users } = useAdminListUsers();

  const approvePayment = useAdminApprovePayment();
  const rejectPayment = useAdminRejectPayment();
  const approvePayout = useAdminApprovePayout();
  const rejectPayout = useAdminRejectPayout();

  const handleApprovePayment = (id: number) => {
    approvePayment.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
        toast({ title: "Pagamento aprovado" });
      },
    });
  };

  const handleRejectPayment = (id: number) => {
    rejectPayment.mutate({ id, data: { notes: "Rejeitado pelo admin" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPaymentsQueryKey() });
        toast({ title: "Pagamento rejeitado", variant: "destructive" });
      },
    });
  };

  const handleApprovePayout = (id: number) => {
    approvePayout.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPayoutsQueryKey() });
        toast({ title: "Levantamento aprovado" });
      },
    });
  };

  const handleRejectPayout = (id: number) => {
    rejectPayout.mutate({ id, data: { notes: "Rejeitado pelo admin" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPayoutsQueryKey() });
        toast({ title: "Levantamento rejeitado", variant: "destructive" });
      },
    });
  };

  const pendingPaymentsCount = payments?.filter(p => p.status === "pending").length ?? 0;
  const pendingPayoutsCount = payouts?.filter(p => p.status === "pending").length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Admin</h1>
        <p className="text-muted-foreground mt-1">Visão geral e gestão da plataforma</p>
      </div>

      {/* Stats grid — row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Traders"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Receita Total"
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          iconBg="bg-green-500/10"
          color="text-green-400"
        />
        <StatCard
          label="Contas Ativas"
          value={stats?.activeAccounts ?? 0}
          icon={Activity}
          iconBg="bg-primary/10"
          color="text-primary"
        />
        <StatCard
          label="Total Contas"
          value={stats?.totalAccounts ?? 0}
          icon={CreditCard}
          iconBg="bg-muted/60"
        />
      </div>

      {/* Stats grid — row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Aprovadas"
          value={stats?.passedAccounts ?? 0}
          sub="Desafios concluídos"
          icon={ShieldCheck}
          iconBg="bg-green-500/10"
          color="text-green-400"
        />
        <StatCard
          label="Falhadas"
          value={stats?.failedAccounts ?? 0}
          sub="Desafios perdidos"
          icon={ShieldX}
          iconBg="bg-red-500/10"
          color="text-red-400"
        />
        <StatCard
          label="Pagamentos Pendentes"
          value={stats?.pendingPayments ?? 0}
          sub="Aguardam revisão"
          icon={Clock}
          iconBg="bg-yellow-500/10"
          color={pendingPaymentsCount > 0 ? "text-yellow-400" : "text-foreground"}
        />
        <StatCard
          label="Levantamentos Pend."
          value={stats?.pendingPayouts ?? 0}
          sub="Aguardam aprovação"
          icon={Wallet}
          iconBg="bg-purple-500/10"
          color={pendingPayoutsCount > 0 ? "text-purple-400" : "text-foreground"}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">
            Pagamentos
            {pendingPaymentsCount > 0 && (
              <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingPaymentsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="payouts">
            Levantamentos
            {pendingPayoutsCount > 0 && (
              <span className="ml-2 bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingPayoutsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">
            Utilizadores
            {users && (
              <span className="ml-2 text-muted-foreground text-[10px]">{users.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Payments ─── */}
        <TabsContent value="payments">
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Trader</TableHead>
                    <TableHead className="text-xs">Desafio</TableHead>
                    <TableHead className="text-xs">Método</TableHead>
                    <TableHead className="text-xs">Valor</TableHead>
                    <TableHead className="text-xs">Comprovativo</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                        Sem pagamentos registados.
                      </TableCell>
                    </TableRow>
                  )}
                  {payments?.map(payment => (
                    <TableRow key={payment.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{payment.id}</TableCell>
                      <TableCell className="text-sm">{payment.userEmail ?? "—"}</TableCell>
                      <TableCell className="text-sm">{payment.challengeName ?? "—"}</TableCell>
                      <TableCell className="capitalize text-sm">{payment.method}</TableCell>
                      <TableCell className="font-mono font-semibold text-sm">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {payment.proofUrl
                          ? <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">Ver</a>
                          : <span className="text-muted-foreground text-sm">—</span>
                        }
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[payment.status] ?? ""}`}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20" onClick={() => handleApprovePayment(payment.id)}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" onClick={() => handleRejectPayment(payment.id)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── Payouts ─── */}
        <TabsContent value="payouts">
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Trader</TableHead>
                    <TableHead className="text-xs">Conta</TableHead>
                    <TableHead className="text-xs">Valor</TableHead>
                    <TableHead className="text-xs">Carteira</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                        Sem pedidos de levantamento.
                      </TableCell>
                    </TableRow>
                  )}
                  {payouts?.map(payout => (
                    <TableRow key={payout.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{payout.id}</TableCell>
                      <TableCell className="text-sm">{payout.userEmail ?? "—"}</TableCell>
                      <TableCell className="font-mono text-sm">#{payout.accountId}</TableCell>
                      <TableCell className="font-mono font-semibold text-sm text-green-400">${payout.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">{payout.walletAddress}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(payout.createdAt), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[payout.status] ?? ""}`}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payout.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20" onClick={() => handleApprovePayout(payout.id)}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" onClick={() => handleRejectPayout(payout.id)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── Users ─── */}
        <TabsContent value="users">
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Contas</TableHead>
                    <TableHead className="text-xs">PnL Total</TableHead>
                    <TableHead className="text-xs">Registado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        Sem utilizadores registados.
                      </TableCell>
                    </TableRow>
                  )}
                  {users?.map(user => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{user.id}</TableCell>
                      <TableCell className="text-sm">{user.email || <span className="text-muted-foreground italic">—</span>}</TableCell>
                      <TableCell className="text-sm">{user.displayName || <span className="text-muted-foreground italic">—</span>}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${user.role === "admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-muted/40 text-muted-foreground"}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.accountCount}</TableCell>
                      <TableCell className={`font-mono font-semibold text-sm ${(user.totalPnl ?? 0) > 0 ? "text-green-400" : (user.totalPnl ?? 0) < 0 ? "text-red-400" : ""}`}>
                        {(user.totalPnl ?? 0) >= 0 ? "+" : ""}${(user.totalPnl ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(user.createdAt), "dd/MM/yy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
