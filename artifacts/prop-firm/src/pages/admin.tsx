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
  useAdminCreateChallenge,
  useListChallenges,
  getAdminGetStatsQueryKey,
  getAdminListPaymentsQueryKey,
  getAdminListPayoutsQueryKey,
  getListChallengesQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Users, CreditCard, Wallet, Activity, Check, X,
  ShieldCheck, ShieldX, Clock, DollarSign, Plus, Layers,
} from "lucide-react";

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color = "text-foreground", iconBg = "bg-muted/60",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; iconBg?: string;
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

// ─── Status badge colours ───────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  active:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  funded:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

// ─── Default new-challenge form state ──────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  accountSize: "",
  price: "",
  profitTarget: "8",
  maxDailyDrawdown: "5",
  maxTotalDrawdown: "10",
  minTradingDays: "5",
  maxTradingDays: "60",
  leverage: "100",
  instruments: "EURUSD,GBPUSD,XAUUSD,US30,NAS100",
};

// ─── Main component ─────────────────────────────────────────────────────────
export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: stats }    = useAdminGetStats();
  const { data: payments } = useAdminListPayments();
  const { data: payouts }  = useAdminListPayouts();
  const { data: users }    = useAdminListUsers();
  const { data: challenges } = useListChallenges();

  const approvePayment    = useAdminApprovePayment();
  const rejectPayment     = useAdminRejectPayment();
  const approvePayout     = useAdminApprovePayout();
  const rejectPayout      = useAdminRejectPayout();
  const createChallenge   = useAdminCreateChallenge();

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

  const handleCreateChallenge = () => {
    createChallenge.mutate({
      data: {
        name: form.name,
        accountSize: Number(form.accountSize),
        price: Number(form.price),
        profitTarget: Number(form.profitTarget),
        maxDailyDrawdown: Number(form.maxDailyDrawdown),
        maxTotalDrawdown: Number(form.maxTotalDrawdown),
        minTradingDays: Number(form.minTradingDays),
        maxTradingDays: Number(form.maxTradingDays),
        leverage: Number(form.leverage),
        instruments: form.instruments.split(",").map(s => s.trim()).filter(Boolean),
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
        toast({ title: "Desafio criado com sucesso" });
        setShowNewChallenge(false);
        setForm(EMPTY_FORM);
      },
      onError: () => {
        toast({ title: "Erro ao criar desafio", variant: "destructive" });
      },
    });
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const pendingPaymentsCount = payments?.filter(p => p.status === "pending").length ?? 0;
  const pendingPayoutsCount  = payouts?.filter(p => p.status === "pending").length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Admin</h1>
        <p className="text-muted-foreground mt-1">Visão geral e gestão da plataforma</p>
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Traders"     value={stats?.totalUsers ?? 0}         icon={Users}      iconBg="bg-blue-500/10" />
        <StatCard label="Receita Total"     value={`$${(stats?.totalRevenue ?? 0).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} iconBg="bg-green-500/10"  color="text-green-400" />
        <StatCard label="Contas Ativas"     value={stats?.activeAccounts ?? 0}     icon={Activity}   iconBg="bg-primary/10"  color="text-primary" />
        <StatCard label="Total Contas"      value={stats?.totalAccounts ?? 0}      icon={CreditCard} iconBg="bg-muted/60" />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Aprovadas"              value={stats?.passedAccounts ?? 0}   sub="Desafios concluídos" icon={ShieldCheck} iconBg="bg-green-500/10"  color="text-green-400" />
        <StatCard label="Falhadas"               value={stats?.failedAccounts ?? 0}   sub="Desafios perdidos"   icon={ShieldX}     iconBg="bg-red-500/10"    color="text-red-400" />
        <StatCard label="Pagamentos Pendentes"   value={stats?.pendingPayments ?? 0}  sub="Aguardam revisão"    icon={Clock}       iconBg="bg-yellow-500/10" color={pendingPaymentsCount > 0 ? "text-yellow-400" : "text-foreground"} />
        <StatCard label="Levantamentos Pend."    value={stats?.pendingPayouts ?? 0}   sub="Aguardam aprovação"  icon={Wallet}      iconBg="bg-purple-500/10" color={pendingPayoutsCount > 0 ? "text-purple-400" : "text-foreground"} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">
            Pagamentos
            {pendingPaymentsCount > 0 && (
              <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingPaymentsCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="payouts">
            Levantamentos
            {pendingPayoutsCount > 0 && (
              <span className="ml-2 bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingPayoutsCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="challenges">
            Desafios
            {challenges && <span className="ml-2 text-muted-foreground text-[10px]">{challenges.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="users">
            Utilizadores
            {users && <span className="ml-2 text-muted-foreground text-[10px]">{users.length}</span>}
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
                    <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">Sem pagamentos registados.</TableCell></TableRow>
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
                          : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(payment.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[payment.status] ?? ""}`}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20" onClick={() => handleApprovePayment(payment.id)}><Check className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" onClick={() => handleRejectPayment(payment.id)}><X className="w-3.5 h-3.5" /></Button>
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
                    <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">Sem pedidos de levantamento.</TableCell></TableRow>
                  )}
                  {payouts?.map(payout => (
                    <TableRow key={payout.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{payout.id}</TableCell>
                      <TableCell className="text-sm">{payout.userEmail ?? "—"}</TableCell>
                      <TableCell className="font-mono text-sm">#{payout.accountId}</TableCell>
                      <TableCell className="font-mono font-semibold text-sm text-green-400">${payout.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">{payout.walletAddress}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(payout.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[payout.status] ?? ""}`}>{payout.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payout.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20" onClick={() => handleApprovePayout(payout.id)}><Check className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" onClick={() => handleRejectPayout(payout.id)}><X className="w-3.5 h-3.5" /></Button>
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

        {/* ─── Challenges ─── */}
        <TabsContent value="challenges">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{challenges?.length ?? 0} planos configurados</p>
            <Button size="sm" onClick={() => setShowNewChallenge(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Novo Desafio
            </Button>
          </div>
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">Tamanho</TableHead>
                    <TableHead className="text-xs">Preço</TableHead>
                    <TableHead className="text-xs">Lucro Alvo</TableHead>
                    <TableHead className="text-xs">DD Diário</TableHead>
                    <TableHead className="text-xs">DD Total</TableHead>
                    <TableHead className="text-xs">Dias Min/Max</TableHead>
                    <TableHead className="text-xs">Leverage</TableHead>
                    <TableHead className="text-xs">Instrumentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges?.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center py-10 text-muted-foreground text-sm">Sem desafios criados.</TableCell></TableRow>
                  )}
                  {challenges?.map(c => (
                    <TableRow key={c.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
                      <TableCell className="font-semibold text-sm">{c.name}</TableCell>
                      <TableCell className="font-mono text-sm">${c.accountSize.toLocaleString("pt-PT")}</TableCell>
                      <TableCell className="font-mono text-sm text-green-400">${c.price.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">{c.profitTarget}%</TableCell>
                      <TableCell className="text-sm text-red-400">{c.maxDailyDrawdown}%</TableCell>
                      <TableCell className="text-sm text-red-400">{c.maxTotalDrawdown}%</TableCell>
                      <TableCell className="text-sm font-mono">{c.minTradingDays} / {c.maxTradingDays}</TableCell>
                      <TableCell className="text-sm">1:{c.leverage}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{c.instruments.join(", ")}</TableCell>
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
                    <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Sem utilizadores registados.</TableCell></TableRow>
                  )}
                  {users?.map(user => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{user.id}</TableCell>
                      <TableCell className="text-sm">{user.email || <span className="text-muted-foreground italic">—</span>}</TableCell>
                      <TableCell className="text-sm">{user.displayName || <span className="text-muted-foreground italic">—</span>}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${user.role === "admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-muted/40 text-muted-foreground"}`}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.accountCount}</TableCell>
                      <TableCell className={`font-mono font-semibold text-sm ${(user.totalPnl ?? 0) > 0 ? "text-green-400" : (user.totalPnl ?? 0) < 0 ? "text-red-400" : ""}`}>
                        {(user.totalPnl ?? 0) >= 0 ? "+" : ""}${(user.totalPnl ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(user.createdAt), "dd/MM/yy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── New Challenge Dialog ─── */}
      <Dialog open={showNewChallenge} onOpenChange={setShowNewChallenge}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> Novo Desafio
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input id="name" placeholder="Ex: 50K Standard" {...field("name")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountSize">Tamanho da Conta ($)</Label>
              <Input id="accountSize" type="number" placeholder="50000" {...field("accountSize")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">Preço ($)</Label>
              <Input id="price" type="number" placeholder="297" {...field("price")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profitTarget">Lucro Alvo (%)</Label>
              <Input id="profitTarget" type="number" placeholder="8" {...field("profitTarget")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leverage">Leverage (1:X)</Label>
              <Input id="leverage" type="number" placeholder="100" {...field("leverage")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxDailyDrawdown">DD Diário Máx. (%)</Label>
              <Input id="maxDailyDrawdown" type="number" placeholder="5" {...field("maxDailyDrawdown")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxTotalDrawdown">DD Total Máx. (%)</Label>
              <Input id="maxTotalDrawdown" type="number" placeholder="10" {...field("maxTotalDrawdown")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="minTradingDays">Dias Mínimos</Label>
              <Input id="minTradingDays" type="number" placeholder="5" {...field("minTradingDays")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxTradingDays">Dias Máximos</Label>
              <Input id="maxTradingDays" type="number" placeholder="60" {...field("maxTradingDays")} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="instruments">Instrumentos (separados por vírgula)</Label>
              <Input id="instruments" placeholder="EURUSD,GBPUSD,XAUUSD" {...field("instruments")} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewChallenge(false); setForm(EMPTY_FORM); }}>Cancelar</Button>
            <Button onClick={handleCreateChallenge} disabled={createChallenge.isPending || !form.name || !form.accountSize || !form.price}>
              {createChallenge.isPending ? "A criar..." : "Criar Desafio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
