import { Activity, BarChart3, CreditCard, MessageSquare, Search, Shield, Target, Users } from "lucide-react";

const adminStats = [
  { label: "Clientes", value: "128", sub: "+18 este mês", icon: Users },
  { label: "Challenges", value: "74", sub: "41 ativos", icon: Target },
  { label: "Receita", value: "$18.4K", sub: "checkout demo", icon: CreditCard },
  { label: "Suporte", value: "12", sub: "4 urgentes", icon: MessageSquare },
];

const supportMessages = [
  { name: "Marta Silva", email: "marta@email.com", subject: "Pagamento aprovado mas challenge bloqueado", status: "Urgente", time: "09:42" },
  { name: "Tiago Ramos", email: "tiago@email.com", subject: "Pedido de reset da conta", status: "Aberto", time: "10:18" },
  { name: "Ana Costa", email: "ana@email.com", subject: "Dúvida sobre payout", status: "Novo", time: "11:04" },
  { name: "Rafael Mendes", email: "rafael@email.com", subject: "KYC pendente", status: "Aberto", time: "12:31" },
];

const clients = [
  { name: "Marta Silva", email: "marta@email.com", plan: "POP Pro $100K", equity: "$104,820", status: "In Progress", risk: "Normal" },
  { name: "Tiago Ramos", email: "tiago@email.com", plan: "POP Growth $50K", equity: "$45,920", status: "Failed", risk: "Max DD" },
  { name: "Ana Costa", email: "ana@email.com", plan: "POP Elite $200K", equity: "$221,340", status: "Passed", risk: "Clean" },
  { name: "Rafael Mendes", email: "rafael@email.com", plan: "POP Starter $25K", equity: "$26,110", status: "In Progress", risk: "Daily DD 62%" },
];

const challenges = [
  { id: "CH-1001", client: "Marta Silva", account: "$100K", target: "48%", dailyDd: "12%", maxDd: "22%", days: "2/3", status: "In Progress" },
  { id: "CH-1002", client: "Tiago Ramos", account: "$50K", target: "0%", dailyDd: "100%", maxDd: "100%", days: "1/3", status: "Failed" },
  { id: "CH-1003", client: "Ana Costa", account: "$200K", target: "100%", dailyDd: "8%", maxDd: "14%", days: "5/3", status: "Passed" },
  { id: "CH-1004", client: "Rafael Mendes", account: "$25K", target: "24%", dailyDd: "62%", maxDd: "38%", days: "3/3", status: "In Progress" },
];

function statusClass(status: string) {
  if (status === "Passed" || status === "Clean") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (status === "Failed" || status === "Urgente" || status.includes("DD")) return "bg-red-500/10 text-red-300 border-red-500/20";
  if (status === "Novo") return "bg-blue-500/10 text-blue-300 border-blue-500/20";
  return "bg-amber-500/10 text-amber-300 border-amber-500/20";
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Admin</p>
            <h1 className="text-3xl font-black">Painel de Administração</h1>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            Procurar cliente, challenge, ticket...
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 px-6 py-8">
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

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Inbox de suporte</h2>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-300">4 urgentes</span>
            </div>
            <div className="space-y-3">
              {supportMessages.map((message) => (
                <div key={message.email} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(message.status)}`}>{message.status}</span>
                  </div>
                  <p className="mt-3 text-sm">{message.subject}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Recebida às {message.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Estado dos challenges</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <tr><th className="py-3">ID</th><th>Cliente</th><th>Conta</th><th>Target</th><th>Daily DD</th><th>Max DD</th><th>Dias</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {challenges.map((challenge) => (
                    <tr key={challenge.id} className="border-t border-border">
                      <td className="py-4 font-black">{challenge.id}</td><td>{challenge.client}</td><td>{challenge.account}</td><td>{challenge.target}</td><td>{challenge.dailyDd}</td><td>{challenge.maxDd}</td><td>{challenge.days}</td>
                      <td><span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(challenge.status)}`}>{challenge.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black">Clientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr><th className="py-3">Cliente</th><th>Email</th><th>Plano</th><th>Equity</th><th>Status</th><th>Risco</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.email} className="border-t border-border">
                    <td className="py-4 font-black">{client.name}</td><td>{client.email}</td><td>{client.plan}</td><td className="font-black">{client.equity}</td>
                    <td><span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(client.status)}`}>{client.status}</span></td>
                    <td><span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(client.risk)}`}>{client.risk}</span></td>
                    <td><button className="rounded-xl border border-border px-3 py-2 text-xs font-black hover:bg-background">Ver perfil</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><Shield className="mb-3 h-6 w-6 text-primary" /><h3 className="font-black">Risk Engine</h3><p className="mt-2 text-sm text-muted-foreground">Alertas de daily drawdown, max drawdown, violação de regras e contas próximas do fail.</p></div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><BarChart3 className="mb-3 h-6 w-6 text-primary" /><h3 className="font-black">Challenge Analytics</h3><p className="mt-2 text-sm text-muted-foreground">Win rate, equity curve, PnL realizado e progresso do objetivo por cliente.</p></div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><Activity className="mb-3 h-6 w-6 text-primary" /><h3 className="font-black">Supabase-ready</h3><p className="mt-2 text-sm text-muted-foreground">Preparado para substituir dados mock por tabelas reais: profiles, challenges, trades, support_tickets.</p></div>
        </section>
      </main>
    </div>
  );
}
