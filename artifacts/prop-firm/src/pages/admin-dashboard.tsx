import { Activity, Ban, BarChart3, CreditCard, Gift, History, Lock, MessageSquare, Search, Shield, Target, UserCheck, Users, Wallet } from "lucide-react";

const adminStats = [
  { label: "Clientes", value: "128", sub: "+18 este mês", icon: Users },
  { label: "Challenges", value: "74", sub: "41 ativos", icon: Target },
  { label: "Receita", value: "$18.4K", sub: "checkout demo", icon: CreditCard },
  { label: "Suporte", value: "12", sub: "4 urgentes", icon: MessageSquare },
];

const supportMessages = [
  { name: "Marta Silva", email: "marta@email.com", subject: "Pagamento aprovado mas challenge bloqueado", priority: "Urgente", status: "open", time: "09:42" },
  { name: "Tiago Ramos", email: "tiago@email.com", subject: "Pedido de reset da conta", priority: "Alta", status: "pending", time: "10:18" },
  { name: "Ana Costa", email: "ana@email.com", subject: "Dúvida sobre payout", priority: "Normal", status: "open", time: "11:04" },
  { name: "Rafael Mendes", email: "rafael@email.com", subject: "KYC pendente", priority: "Normal", status: "solved", time: "12:31" },
];

const clients = [
  { name: "Marta Silva", email: "marta@email.com", phone: "+351 912 345 100", country: "Portugal", registered: "2026-05-02", lastIp: "85.244.18.21", loginHistory: "12 logins / 2 IPs", kyc: "Verified", plan: "POP Pro $100K", equity: "$104,820", status: "In Progress", risk: "Normal", payment: "Stripe · Visa **** 4242", subscription: "Active", invoices: "3", payouts: "$0", chargebacks: "0" },
  { name: "Tiago Ramos", email: "tiago@email.com", phone: "+351 934 210 992", country: "Portugal", registered: "2026-05-10", lastIp: "2.82.100.45", loginHistory: "8 logins / 1 IP", kyc: "Pending", plan: "POP Growth $50K", equity: "$45,920", status: "Failed", risk: "Max DD", payment: "Crypto · USDT TRC20", subscription: "None", invoices: "1", payouts: "$0", chargebacks: "0" },
  { name: "Ana Costa", email: "ana@email.com", phone: "+351 961 501 337", country: "Spain", registered: "2026-04-28", lastIp: "77.211.44.19", loginHistory: "31 logins / 3 IPs", kyc: "Verified", plan: "POP Elite $200K", equity: "$221,340", status: "Passed", risk: "Clean", payment: "Card · Mastercard **** 8821", subscription: "Active", invoices: "4", payouts: "$8,200", chargebacks: "0" },
  { name: "Rafael Mendes", email: "rafael@email.com", phone: "+55 11 94444 2211", country: "Brazil", registered: "2026-05-18", lastIp: "189.42.88.11", loginHistory: "5 logins / 4 IPs", kyc: "Review", plan: "POP Starter $25K", equity: "$26,110", status: "In Progress", risk: "Daily DD 62%", payment: "Stripe · Visa **** 1199", subscription: "Active", invoices: "2", payouts: "$0", chargebacks: "1" },
];

const challenges = [
  { id: "CH-1001", client: "Marta Silva", account: "$100K", target: "48%", dailyDd: "12%", maxDd: "22%", days: "2/3", status: "In Progress", payout: "Not eligible" },
  { id: "CH-1002", client: "Tiago Ramos", account: "$50K", target: "0%", dailyDd: "100%", maxDd: "100%", days: "1/3", status: "Failed", payout: "Blocked" },
  { id: "CH-1003", client: "Ana Costa", account: "$200K", target: "100%", dailyDd: "8%", maxDd: "14%", days: "5/3", status: "Passed", payout: "Eligible" },
  { id: "CH-1004", client: "Rafael Mendes", account: "$25K", target: "24%", dailyDd: "62%", maxDd: "38%", days: "3/3", status: "In Progress", payout: "Not eligible" },
];

const paymentHistory = [
  { client: "Marta Silva", method: "Stripe", item: "POP Pro $100K", amount: "$399", invoice: "INV-2041", status: "Paid", date: "2026-05-20" },
  { client: "Ana Costa", method: "Card", item: "POP Elite $200K", amount: "$749", invoice: "INV-2033", status: "Paid", date: "2026-05-18" },
  { client: "Rafael Mendes", method: "Stripe", item: "POP Starter $25K", amount: "$149", invoice: "INV-2029", status: "Chargeback", date: "2026-05-17" },
  { client: "Tiago Ramos", method: "Crypto", item: "POP Growth $50K", amount: "$249", invoice: "CRYPTO-991", status: "Paid", date: "2026-05-15" },
];

const auditLogs = [
  { actor: "Admin", action: "Reset challenge", target: "Tiago Ramos", severity: "medium", time: "Hoje 09:22" },
  { actor: "Risk Engine", action: "Suspicious IP activity", target: "Rafael Mendes", severity: "high", time: "Hoje 08:41" },
  { actor: "Admin", action: "Approved payout", target: "Ana Costa", severity: "low", time: "Ontem 16:12" },
  { actor: "System", action: "KYC review requested", target: "Rafael Mendes", severity: "medium", time: "Ontem 13:05" },
];

const promotions = [
  { code: "POP20", discount: "20%", usage: "48/250", expires: "2026-06-30", status: "Active" },
  { code: "LAUNCH50", discount: "50%", usage: "112/150", expires: "2026-05-31", status: "Active" },
  { code: "VIP100", discount: "$100 off", usage: "9/25", expires: "2026-07-15", status: "Draft" },
];

const equityPoints = "0,70 55,62 110,68 165,50 220,42 275,46 330,30 385,24 440,28 495,18";
const secondaryButtonClass = "min-h-11 flex-1 whitespace-nowrap rounded-xl border border-border px-3 py-2 text-center text-xs font-black transition hover:bg-card sm:flex-none";
const tableButtonClass = "min-h-11 whitespace-nowrap rounded-xl border border-border px-3 py-2 text-xs font-black transition hover:bg-background";
const adminActionButtonClass = "flex min-h-[88px] w-full items-center rounded-2xl border border-border bg-background/60 p-4 text-left text-sm font-black transition hover:bg-background";

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (["passed", "clean", "verified", "paid", "eligible", "active", "low", "solved"].some((item) => value.includes(item))) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (["failed", "urgent", "urgente", "dd", "chargeback", "blocked", "high", "ban"].some((item) => value.includes(item))) return "bg-red-500/10 text-red-300 border-red-500/20";
  if (["pending", "review", "medium", "draft"].some((item) => value.includes(item))) return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  return "bg-blue-500/10 text-blue-300 border-blue-500/20";
}

function Badge({ value }: { value: string }) {
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(value)}`}>{value}</span>;
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-5 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Admin</p>
            <h1 className="text-2xl font-black sm:text-3xl">Painel de Administração</h1>
          </div>
          <div className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground lg:w-auto lg:min-w-[420px]">
            <Search className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">Procurar cliente, pagamento, challenge, ticket...</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminStats.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-6 shadow-xl">
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-4xl font-black">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">Inbox de suporte</h2>
              <Badge value="4 urgentes" />
            </div>
            <div className="space-y-3">
              {supportMessages.map((message) => (
                <div key={message.email} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0"><p className="font-black">{message.name}</p><p className="truncate text-xs text-muted-foreground">{message.email}</p></div>
                    <div className="flex flex-wrap gap-2"><Badge value={message.priority} /><Badge value={message.status} /></div>
                  </div>
                  <p className="mt-3 text-sm">{message.subject}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className={secondaryButtonClass}>Responder</button>
                    <button className={secondaryButtonClass}>Pending</button>
                    <button className={secondaryButtonClass}>Solved</button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Recebida às {message.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Perfil individual do trader</h2></div>
            <div className="rounded-3xl border border-border bg-background/60 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div><p className="text-2xl font-black">Ana Costa</p><p className="text-sm text-muted-foreground">ana@email.com · +351 961 501 337 · Spain</p><div className="mt-3 flex flex-wrap gap-2"><Badge value="KYC Verified" /><Badge value="Passed" /><Badge value="Payout Eligible" /></div></div>
                <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Equity</p><p className="text-xl font-black">$221,340</p></div><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Win rate</p><p className="text-xl font-black">63%</p></div></div>
              </div>
              <div className="mt-5 rounded-2xl border border-border bg-card p-4"><p className="mb-3 text-sm font-black">Equity curve</p><svg viewBox="0 0 500 90" className="h-[90px] w-full"><polyline points={equityPoints} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" /></svg></div>
              <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Posições abertas</p><p className="text-xl font-black">2</p></div><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Histórico</p><p className="text-xl font-black">38 trades</p></div><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Risco</p><p className="text-xl font-black text-emerald-400">Clean</p></div></div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Clientes, contacto e pagamentos</h2></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1300px] text-sm"><thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><tr><th className="py-3">Cliente</th><th>Contacto</th><th>País</th><th>Registo</th><th>IP / Login</th><th>KYC</th><th>Plano</th><th>Pagamento</th><th>Invoices</th><th>Payouts</th><th>Chargebacks</th><th>Status</th><th>Ações</th></tr></thead><tbody>{clients.map((client) => <tr key={client.email} className="border-t border-border"><td className="py-4 font-black">{client.name}</td><td><p>{client.email}</p><p className="text-xs text-muted-foreground">{client.phone}</p></td><td>{client.country}</td><td>{client.registered}</td><td><p>{client.lastIp}</p><p className="text-xs text-muted-foreground">{client.loginHistory}</p></td><td><Badge value={client.kyc} /></td><td>{client.plan}</td><td>{client.payment}</td><td>{client.invoices}</td><td>{client.payouts}</td><td><Badge value={client.chargebacks === "0" ? "0" : `${client.chargebacks} chargeback`} /></td><td><Badge value={client.status} /></td><td><button className={tableButtonClass}>Ver perfil</button></td></tr>)}</tbody></table></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Estado dos challenges</h2></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><tr><th className="py-3">ID</th><th>Cliente</th><th>Conta</th><th>Target</th><th>Daily DD</th><th>Max DD</th><th>Dias</th><th>Payout</th><th>Status</th></tr></thead><tbody>{challenges.map((challenge) => <tr key={challenge.id} className="border-t border-border"><td className="py-4 font-black">{challenge.id}</td><td>{challenge.client}</td><td>{challenge.account}</td><td>{challenge.target}</td><td>{challenge.dailyDd}</td><td>{challenge.maxDd}</td><td>{challenge.days}</td><td><Badge value={challenge.payout} /></td><td><Badge value={challenge.status} /></td></tr>)}</tbody></table></div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Ações admin</h2></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button className={adminActionButtonClass}><span><Activity className="mb-2 h-5 w-5 text-primary" />Reset challenge</span></button>
              <button className={adminActionButtonClass}><span><Ban className="mb-2 h-5 w-5 text-red-400" />Ban trader</span></button>
              <button className={adminActionButtonClass}><span><Lock className="mb-2 h-5 w-5 text-amber-300" />Freeze account</span></button>
              <button className={adminActionButtonClass}><span><Wallet className="mb-2 h-5 w-5 text-emerald-400" />Approve payout</span></button>
              <button className={adminActionButtonClass}><span><Shield className="mb-2 h-5 w-5 text-red-400" />Fail manual</span></button>
              <button className={adminActionButtonClass}><span><MessageSquare className="mb-2 h-5 w-5 text-blue-300" />Mensagem direta</span></button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><div className="mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Pagamentos, invoices e subscrições</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><tr><th className="py-3">Cliente</th><th>Método</th><th>Compra</th><th>Valor</th><th>Invoice</th><th>Status</th><th>Data</th></tr></thead><tbody>{paymentHistory.map((payment) => <tr key={payment.invoice} className="border-t border-border"><td className="py-4 font-black">{payment.client}</td><td>{payment.method}</td><td>{payment.item}</td><td>{payment.amount}</td><td>{payment.invoice}</td><td><Badge value={payment.status} /></td><td>{payment.date}</td></tr>)}</tbody></table></div></div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><div className="mb-4 flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Auditoria e atividade suspeita</h2></div><div className="space-y-3">{auditLogs.map((log) => <div key={`${log.action}-${log.time}`} className="rounded-2xl border border-border bg-background/60 p-4"><div className="flex items-start justify-between"><div><p className="font-black">{log.action}</p><p className="text-xs text-muted-foreground">{log.actor} · {log.target}</p></div><Badge value={log.severity} /></div><p className="mt-2 text-xs text-muted-foreground">{log.time}</p></div>)}</div></div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Promoções e cupões</h2></div><button className="min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-xs font-black text-primary-foreground sm:w-auto">Criar promoção</button></div>
          <div className="grid gap-4 md:grid-cols-3">{promotions.map((promo) => <div key={promo.code} className="rounded-3xl border border-border bg-background/60 p-5"><div className="flex items-start justify-between"><div><p className="text-2xl font-black">{promo.code}</p><p className="text-sm text-muted-foreground">{promo.discount}</p></div><Badge value={promo.status} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Uso</p><p className="font-black">{promo.usage}</p></div><div><p className="text-xs text-muted-foreground">Expira</p><p className="font-black">{promo.expires}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><button className={secondaryButtonClass}>Editar</button><button className={secondaryButtonClass}>Desativar</button></div></div>)}</div>
        </section>
      </main>
    </div>
  );
}
