import { useState } from "react";
import { Activity, Ban, CreditCard, Gift, History, Lock, MessageSquare, Search, Shield, Target, UserCheck, Users, Wallet, X } from "lucide-react";

const adminStats = [
  { label: "Clientes", value: "128", sub: "+18 este mês", icon: Users },
  { label: "Challenges", value: "74", sub: "41 ativos", icon: Target },
  { label: "Receita", value: "$18.4K", sub: "checkout demo", icon: CreditCard },
  { label: "Suporte", value: "12", sub: "4 urgentes", icon: MessageSquare },
];

const challengePlans = [
  { value: "Todos os desafios", label: "Todos os desafios" },
  { value: "POP Launch $10K", label: "POP Launch · $10K" },
  { value: "POP Starter $25K", label: "POP Starter · $25K" },
  { value: "POP Growth $50K", label: "POP Growth · $50K" },
  { value: "POP Pro $100K", label: "POP Pro · $100K" },
  { value: "POP Elite $200K", label: "POP Elite · $200K" },
  { value: "POP Titan $400K", label: "POP Titan · $400K" },
  { value: "POP Sovereign $1M", label: "POP Sovereign · $1M" },
  { value: "POP Institutional $3M Instant", label: "POP Institutional · $3M Instant" },
];

type Promotion = {
  code: string;
  discount: string;
  challenge: string;
  usage: string;
  expires: string;
  status: string;
};

const initialPromotions: Promotion[] = [
  { code: "POP20", discount: "20%", challenge: "Todos os desafios", usage: "48/250", expires: "2026-06-30", status: "Active" },
  { code: "LAUNCH50", discount: "50%", challenge: "POP Launch $10K", usage: "112/150", expires: "2026-05-31", status: "Active" },
  { code: "VIP100", discount: "$100 off", challenge: "POP Sovereign $1M", usage: "9/25", expires: "2026-07-15", status: "Draft" },
];

const supportMessages = [
  { name: "Marta Silva", email: "marta@email.com", subject: "Pagamento aprovado mas challenge bloqueado", priority: "Urgente", status: "open", time: "09:42" },
  { name: "Tiago Ramos", email: "tiago@email.com", subject: "Pedido de reset da conta", priority: "Alta", status: "pending", time: "10:18" },
  { name: "Ana Costa", email: "ana@email.com", subject: "Dúvida sobre payout", priority: "Normal", status: "open", time: "11:04" },
];

const clients = [
  { name: "Marta Silva", email: "marta@email.com", plan: "POP Pro $100K", status: "In Progress", kyc: "Verified", payment: "Stripe · Visa **** 4242" },
  { name: "Tiago Ramos", email: "tiago@email.com", plan: "POP Growth $50K", status: "Failed", kyc: "Pending", payment: "Crypto · USDT TRC20" },
  { name: "Ana Costa", email: "ana@email.com", plan: "POP Elite $200K", status: "Passed", kyc: "Verified", payment: "Card · Mastercard **** 8821" },
  { name: "Rafael Mendes", email: "rafael@email.com", plan: "POP Starter $25K", status: "In Progress", kyc: "Review", payment: "Stripe · Visa **** 1199" },
];

const challenges = [
  { id: "CH-1001", client: "Marta Silva", account: "$100K", target: "48%", dailyDd: "12%", maxDd: "22%", days: "2/3", status: "In Progress" },
  { id: "CH-1002", client: "Tiago Ramos", account: "$50K", target: "0%", dailyDd: "100%", maxDd: "100%", days: "1/3", status: "Failed" },
  { id: "CH-1003", client: "Ana Costa", account: "$200K", target: "100%", dailyDd: "8%", maxDd: "14%", days: "5/3", status: "Passed" },
];

const auditLogs = [
  { actor: "Admin", action: "Reset challenge", target: "Tiago Ramos", severity: "medium", time: "Hoje 09:22" },
  { actor: "Risk Engine", action: "Suspicious IP activity", target: "Rafael Mendes", severity: "high", time: "Hoje 08:41" },
  { actor: "Admin", action: "Approved payout", target: "Ana Costa", severity: "low", time: "Ontem 16:12" },
];

const secondaryButtonClass = "min-h-11 flex-1 whitespace-nowrap rounded-xl border border-border px-3 py-2 text-center text-xs font-black transition hover:bg-card sm:flex-none";
const tableButtonClass = "min-h-11 whitespace-nowrap rounded-xl border border-border px-3 py-2 text-xs font-black transition hover:bg-background";
const adminActionButtonClass = "flex min-h-[88px] w-full items-center rounded-2xl border border-border bg-background/60 p-4 text-left text-sm font-black transition hover:bg-background";
const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm font-bold outline-none focus:border-primary";

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (["passed", "clean", "verified", "paid", "eligible", "active", "low", "solved"].some((item) => value.includes(item))) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (["failed", "urgent", "urgente", "dd", "chargeback", "blocked", "high", "ban", "inactive", "desativado"].some((item) => value.includes(item))) return "bg-red-500/10 text-red-300 border-red-500/20";
  if (["pending", "review", "medium", "draft"].some((item) => value.includes(item))) return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  return "bg-blue-500/10 text-blue-300 border-blue-500/20";
}

function Badge({ value }: { value: string }) {
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(value)}`}>{value}</span>;
}

export default function AdminDashboard() {
  const [promotionItems, setPromotionItems] = useState<Promotion[]>(initialPromotions);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState("Dashboard admin pronto. Seleciona uma ação para gerir clientes, suporte ou promoções.");
  const [promoForm, setPromoForm] = useState<Promotion>({ code: "", discount: "", challenge: "Todos os desafios", usage: "0/100", expires: "2026-06-30", status: "Active" });

  const registerAction = (action: string, target?: string) => {
    setAdminNotice(`${action}${target ? ` · ${target}` : ""} registado no painel.`);
  };

  const openCreatePromotion = () => {
    setEditingCode(null);
    setPromoForm({ code: "", discount: "", challenge: "Todos os desafios", usage: "0/100", expires: "2026-06-30", status: "Active" });
    setShowPromotionForm(true);
    setAdminNotice("A criar nova promoção. Escolhe o desafio/plano onde o cupão será válido.");
  };

  const openEditPromotion = (promo: Promotion) => {
    setEditingCode(promo.code);
    setPromoForm(promo);
    setShowPromotionForm(true);
    setAdminNotice(`A editar promoção ${promo.code}.`);
  };

  const savePromotion = () => {
    const code = promoForm.code.trim().toUpperCase();
    const discount = promoForm.discount.trim();
    const challenge = promoForm.challenge || "Todos os desafios";

    if (!code || !discount) {
      setAdminNotice("Preenche pelo menos o código e o desconto da promoção.");
      return;
    }

    const nextPromo: Promotion = {
      ...promoForm,
      code,
      discount,
      challenge,
      usage: promoForm.usage.trim() || "0/100",
      expires: promoForm.expires.trim() || "2026-06-30",
    };

    setPromotionItems((current) => editingCode ? current.map((promo) => promo.code === editingCode ? nextPromo : promo) : [nextPromo, ...current]);
    setShowPromotionForm(false);
    setEditingCode(null);
    setAdminNotice(editingCode ? `Promoção ${code} atualizada para ${challenge}.` : `Promoção ${code} criada para ${challenge}.`);
  };

  const deactivatePromotion = (code: string) => {
    setPromotionItems((current) => current.map((promo) => promo.code === code ? { ...promo, status: promo.status === "Inactive" ? "Active" : "Inactive" } : promo));
    setAdminNotice(`Estado da promoção ${code} atualizado.`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-5 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Admin</p>
            <h1 className="text-2xl font-black sm:text-3xl">Painel de Administração</h1>
          </div>
          <button onClick={() => registerAction("Pesquisa admin aberta")} className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-card lg:w-auto lg:min-w-[420px]">
            <Search className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">Procurar cliente, pagamento, challenge, ticket...</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary">{adminNotice}</div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminStats.map(({ label, value, sub, icon: Icon }) => (
            <button key={label} onClick={() => registerAction("Resumo aberto", label)} className="rounded-3xl border border-border bg-card p-6 text-left shadow-xl transition hover:-translate-y-0.5 hover:bg-background/60">
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-4xl font-black">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </button>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Inbox de suporte</h2><Badge value="4 urgentes" /></div>
            <div className="space-y-3">
              {supportMessages.map((message) => (
                <div key={message.email} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0"><p className="font-black">{message.name}</p><p className="truncate text-xs text-muted-foreground">{message.email}</p></div>
                    <div className="flex flex-wrap gap-2"><Badge value={message.priority} /><Badge value={message.status} /></div>
                  </div>
                  <p className="mt-3 text-sm">{message.subject}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => registerAction("Resposta iniciada", message.name)} className={secondaryButtonClass}>Responder</button>
                    <button onClick={() => registerAction("Ticket marcado como pending", message.name)} className={secondaryButtonClass}>Pending</button>
                    <button onClick={() => registerAction("Ticket marcado como solved", message.name)} className={secondaryButtonClass}>Solved</button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Recebida às {message.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Perfil individual do trader</h2></div>
            <div className="rounded-3xl border border-border bg-background/60 p-5">
              <p className="text-2xl font-black">Ana Costa</p>
              <p className="text-sm text-muted-foreground">ana@email.com · POP Elite $200K</p>
              <div className="mt-3 flex flex-wrap gap-2"><Badge value="KYC Verified" /><Badge value="Passed" /><Badge value="Payout Eligible" /></div>
              <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Equity</p><p className="text-xl font-black">$221,340</p></div><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Histórico</p><p className="text-xl font-black">38 trades</p></div><div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Risco</p><p className="text-xl font-black text-emerald-400">Clean</p></div></div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Clientes, contacto e pagamentos</h2></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><tr><th className="py-3">Cliente</th><th>Email</th><th>KYC</th><th>Plano</th><th>Pagamento</th><th>Status</th><th>Ações</th></tr></thead><tbody>{clients.map((client) => <tr key={client.email} className="border-t border-border"><td className="py-4 font-black">{client.name}</td><td>{client.email}</td><td><Badge value={client.kyc} /></td><td>{client.plan}</td><td>{client.payment}</td><td><Badge value={client.status} /></td><td><button onClick={() => registerAction("Perfil aberto", client.name)} className={tableButtonClass}>Ver perfil</button></td></tr>)}</tbody></table></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Estado dos challenges</h2></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><tr><th className="py-3">ID</th><th>Cliente</th><th>Conta</th><th>Target</th><th>Daily DD</th><th>Max DD</th><th>Dias</th><th>Status</th></tr></thead><tbody>{challenges.map((challenge) => <tr key={challenge.id} className="border-t border-border"><td className="py-4 font-black">{challenge.id}</td><td>{challenge.client}</td><td>{challenge.account}</td><td>{challenge.target}</td><td>{challenge.dailyDd}</td><td>{challenge.maxDd}</td><td>{challenge.days}</td><td><Badge value={challenge.status} /></td></tr>)}</tbody></table></div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Ações admin</h2></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={() => registerAction("Reset challenge", "Tiago Ramos")} className={adminActionButtonClass}><span><Activity className="mb-2 h-5 w-5 text-primary" />Reset challenge</span></button>
              <button onClick={() => registerAction("Ban trader", "Rafael Mendes")} className={adminActionButtonClass}><span><Ban className="mb-2 h-5 w-5 text-red-400" />Ban trader</span></button>
              <button onClick={() => registerAction("Freeze account", "Rafael Mendes")} className={adminActionButtonClass}><span><Lock className="mb-2 h-5 w-5 text-amber-300" />Freeze account</span></button>
              <button onClick={() => registerAction("Approve payout", "Ana Costa")} className={adminActionButtonClass}><span><Wallet className="mb-2 h-5 w-5 text-emerald-400" />Approve payout</span></button>
              <button onClick={() => registerAction("Fail manual", "Tiago Ramos")} className={adminActionButtonClass}><span><Shield className="mb-2 h-5 w-5 text-red-400" />Fail manual</span></button>
              <button onClick={() => registerAction("Mensagem direta aberta", "Ana Costa")} className={adminActionButtonClass}><span><MessageSquare className="mb-2 h-5 w-5 text-blue-300" />Mensagem direta</span></button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><div className="mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Pagamentos, invoices e subscrições</h2></div><div className="space-y-3">{clients.map((client) => <div key={client.email} className="rounded-2xl border border-border bg-background/60 p-4"><p className="font-black">{client.name}</p><p className="text-sm text-muted-foreground">{client.plan} · {client.payment}</p></div>)}</div></div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl"><div className="mb-4 flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Auditoria e atividade suspeita</h2></div><div className="space-y-3">{auditLogs.map((log) => <button key={`${log.action}-${log.time}`} onClick={() => registerAction(log.action, log.target)} className="w-full rounded-2xl border border-border bg-background/60 p-4 text-left transition hover:bg-background"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{log.action}</p><p className="text-xs text-muted-foreground">{log.actor} · {log.target}</p></div><Badge value={log.severity} /></div><p className="mt-2 text-xs text-muted-foreground">{log.time}</p></button>)}</div></div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Promoções e cupões</h2></div><button onClick={openCreatePromotion} className="min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-xs font-black text-primary-foreground sm:w-auto">Criar promoção</button></div>

          {showPromotionForm && (
            <div className="mb-5 rounded-3xl border border-primary/20 bg-background/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><p className="text-lg font-black">{editingCode ? "Editar promoção" : "Nova promoção"}</p><p className="text-xs text-muted-foreground">Escolhe se a promoção vale para todos os desafios ou apenas para um plano específico.</p></div>
                <button onClick={() => setShowPromotionForm(false)} className="rounded-xl border border-border p-2 hover:bg-card"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 md:grid-cols-6">
                <input value={promoForm.code} onChange={(event) => setPromoForm((current) => ({ ...current, code: event.target.value }))} placeholder="Código" className={inputClass} />
                <input value={promoForm.discount} onChange={(event) => setPromoForm((current) => ({ ...current, discount: event.target.value }))} placeholder="Desconto" className={inputClass} />
                <select value={promoForm.challenge} onChange={(event) => setPromoForm((current) => ({ ...current, challenge: event.target.value }))} className={`${inputClass} md:col-span-2`}>
                  {challengePlans.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>)}
                </select>
                <input value={promoForm.usage} onChange={(event) => setPromoForm((current) => ({ ...current, usage: event.target.value }))} placeholder="Uso" className={inputClass} />
                <input value={promoForm.expires} onChange={(event) => setPromoForm((current) => ({ ...current, expires: event.target.value }))} placeholder="Expira" className={inputClass} />
                <select value={promoForm.status} onChange={(event) => setPromoForm((current) => ({ ...current, status: event.target.value }))} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={savePromotion} className="min-h-11 flex-1 rounded-xl bg-primary px-4 py-3 text-xs font-black text-primary-foreground sm:flex-none">Guardar promoção</button>
                <button onClick={() => setShowPromotionForm(false)} className={secondaryButtonClass}>Cancelar</button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {promotionItems.map((promo) => (
              <div key={promo.code} className="rounded-3xl border border-border bg-background/60 p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-black">{promo.code}</p><p className="text-sm text-muted-foreground">{promo.discount}</p></div><Badge value={promo.status} /></div>
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Desafio atribuído</p><p className="mt-1 text-sm font-black">{promo.challenge}</p></div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Uso</p><p className="font-black">{promo.usage}</p></div><div><p className="text-xs text-muted-foreground">Expira</p><p className="font-black">{promo.expires}</p></div></div>
                <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => openEditPromotion(promo)} className={secondaryButtonClass}>Editar</button><button onClick={() => deactivatePromotion(promo.code)} className={secondaryButtonClass}>{promo.status === "Inactive" ? "Ativar" : "Desativar"}</button></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
