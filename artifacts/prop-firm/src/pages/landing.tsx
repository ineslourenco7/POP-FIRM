import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, BarChart3, ChevronDown, ClipboardList, FileText, HeadphonesIcon, Shield, Star, Trophy, UserCheck, Wallet, Zap } from "lucide-react";
import { useState } from "react";

import { LICENSE_NUMBER } from "@/lib/constants";

const CHALLENGE_PLANS = [
  { id: 1, name: "POP Launch", account: "$10K", price: 99, tag: "Starter", tone: "emerald" },
  { id: 2, name: "POP Starter", account: "$25K", price: 149, tag: "Popular", tone: "emerald" },
  { id: 3, name: "POP Growth", account: "$50K", price: 249, tag: "Growth", tone: "blue" },
  { id: 4, name: "POP Pro", account: "$100K", price: 399, tag: "Mais escolhido", tone: "blue" },
  { id: 5, name: "POP Elite", account: "$200K", price: 749, tag: "Elite", tone: "purple" },
  { id: 6, name: "POP Titan", account: "$400K", price: 1299, tag: "Titan", tone: "purple" },
  { id: 7, name: "POP Institutional", account: "$3M", price: 4999, tag: "Instant", tone: "primary" },
];

const FAQS = [
  { q: "Como funciona o desafio POP FIRM?", a: "Escolhe um plano de capital, cumpre o objetivo de lucro de 10% respeitando a perda diária máxima de 10% e a perda total máxima de 10%. Após aprovação, recebes uma conta financiada para operar e ficar com até 90% dos lucros." },
  { q: "Quanto tempo tenho para passar a avaliação?", a: "Tens no mínimo 2 dias para completar o desafio. O importante é cumprir os critérios de forma consistente respeitando todas as regras." },
  { q: "Quais são as regras de drawdown?", a: "Cada conta tem perda diária máxima de 10% e perda total máxima de 10%. Se qualquer um dos limites for atingido, a conta é encerrada automaticamente." },
  { q: "Posso operar durante a noite ou ao fim de semana?", a: "Sim. Podes operar a qualquer hora, incluindo sessões asiáticas, europeias e americanas. Também podes manter posições abertas overnight ou ao fim de semana." },
  { q: "Como e quando posso solicitar um pagamento?", a: "Após seres financiado, podes solicitar pagamentos quinzenais. Os pagamentos são processados via criptomoeda ou transferência bancária em até 24 horas." },
];

const TESTIMONIALS = [
  { name: "Pedro Silva", country: "Portugal", flag: "🇵🇹", role: "Trader Forex", photo: "testimonials/pedro.png", text: "Passei o desafio em 12 dias com uma conta de $100k. O terminal é rápido, os spreads são justos e o suporte respondeu em minutos.", stars: 5, profit: "+$8.240" },
  { name: "Maria Santos", country: "Brasil", flag: "🇧🇷", role: "Day Trader", photo: "testimonials/maria.png", text: "Já tentei outras prop firms mas as regras eram complicadas demais. Aqui é simples: segue as regras, passa e recebe.", stars: 5, profit: "+$5.180" },
  { name: "James Chen", country: "Singapore", flag: "🇸🇬", role: "Algorithmic Trader", photo: "testimonials/james.png", text: "The platform is stable, execution is fast and the risk management tools are exactly what I needed.", stars: 5, profit: "+$22.600" },
];

const PAYMENT_METHODS = [
  { name: "Bitcoin", icon: "₿", color: "#F7931A" },
  { name: "Ethereum", icon: "Ξ", color: "#627EEA" },
  { name: "USDT", icon: "₮", color: "#26A17B" },
  { name: "USDC", icon: "◎", color: "#2775CA" },
  { name: "Binance Pay", icon: "⬡", color: "#F3BA2F" },
  { name: "Bank Transfer", icon: "🏦", color: "#6366f1" },
  { name: "Visa", icon: "VISA", color: "#1A1F71" },
  { name: "Mastercard", icon: "◉", color: "#EB001B" },
];

function PaymentBanner() {
  const items = [...PAYMENT_METHODS, ...PAYMENT_METHODS];
  return (
    <div className="overflow-hidden border-y border-border bg-card py-4">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Métodos de Pagamento Aceites</p>
      <div className="flex w-max animate-[scroll_30s_linear_infinite] items-center gap-6 whitespace-nowrap">
        {items.map((method, i) => (
          <div key={`${method.name}-${i}`} className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
            <span className="text-lg font-bold" style={{ color: method.color }}>{method.icon}</span>
            <span className="text-sm font-medium text-foreground">{method.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <button className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/30" onClick={() => setOpen((value) => !value)}>
        <span className="text-sm font-medium">{faq.q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border px-6 pb-4 pt-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>}
    </div>
  );
}

function ChallengePlanCard({ plan }: { plan: (typeof CHALLENGE_PLANS)[number] }) {
  const featured = plan.account === "$100K";
  const colorClass = plan.tone === "purple" ? "border-purple-500/35 from-purple-950/60 text-purple-400" : plan.tone === "blue" ? "border-blue-500/40 from-blue-950/60 text-blue-400" : plan.tone === "primary" ? "border-primary/50 from-primary/30 text-primary" : "border-emerald-500/30 from-emerald-950/60 text-emerald-400";

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${colorClass}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent" />
      {featured && <div className="absolute right-3 top-3 z-10 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Mais Popular</div>}
      <div className="relative p-5">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]">{plan.tag}</div>
        <div className="mb-1 text-4xl font-black leading-none text-foreground">{plan.account}</div>
        <p className="mb-4 text-sm font-semibold text-foreground/90">{plan.name}</p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between border-b border-white/5 pb-2"><span>Objetivo de lucro</span><strong className="text-foreground">10%</strong></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span>Perda diária máx.</span><strong className="text-foreground">10%</strong></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span>Perda total máx.</span><strong className="text-foreground">10%</strong></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span>Dias mínimos</span><strong className="text-foreground">2 dias</strong></div>
          <div className="flex justify-between"><span>Profit split</span><strong className="text-foreground">até 90%</strong></div>
        </div>
      </div>
      <div className="mt-auto px-5 pb-5">
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground">${plan.price}</span>
          <span className="text-xs text-muted-foreground">/ pagamento único</span>
        </div>
        <Link href={`/checkout/${plan.id}`} className="block">
          <Button className="h-11 w-full font-semibold">Começar Agora</Button>
        </Link>
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
      <div className="flex items-center gap-3">
        <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-full border-2 border-primary/30 object-cover" />
        <div><div className="text-sm font-semibold">{t.name} <span className="text-base">{t.flag}</span></div><div className="text-xs text-muted-foreground">{t.role} · {t.country}</div></div>
        <div className="ml-auto font-mono text-sm font-bold text-green-400">{t.profit}</div>
      </div>
      <div className="flex gap-0.5">{Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div>
      <p className="text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="POP FIRM" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">POP FIRM</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Como Funciona</a>
            <a href="#challenges" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Desafios</a>
            <a href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Testemunhos</a>
            <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/demo"><Button variant="ghost" className="hidden text-sm text-primary hover:text-primary/80 sm:inline-flex">Demo</Button></Link>
            <Link href="/sign-in"><Button variant="ghost" className="text-sm">Entrar</Button></Link>
            <Link href="/sign-in"><Button className="text-sm">Começar</Button></Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"><Zap className="h-4 w-4" /> O Terminal de Trading de Elite</div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">Prova o teu edge.<br /><span className="text-primary">Opera até $3M.</span></h1>
            <p className="mx-auto mb-6 max-w-2xl text-xl text-muted-foreground">Passa a avaliação e recebe capital. Objetivo de 10%, perda diária máxima de 10%, mínimo de 2 dias e até 90% dos lucros.</p>
            <div className="mb-10 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {['Sem taxas ocultas', 'Regras claras', 'Ativação imediata', 'Até 90% dos lucros'].map((item) => <div key={item} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> {item}</div>)}
            </div>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="#challenges"><Button size="lg" className="h-14 w-full px-8 text-base sm:w-auto">Ver Desafios <ArrowRight className="ml-2 h-5 w-5" /></Button></a>
              <Link href="/demo"><Button size="lg" variant="outline" className="h-14 w-full border-primary/40 px-8 text-base text-primary hover:bg-primary/10 hover:text-primary sm:w-auto">Experimentar Demo Grátis</Button></Link>
            </div>
          </div>
        </section>

        <div className="border-y border-primary/20 bg-primary/5 py-5">
          <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 text-center md:flex-row md:gap-12">
            <div className="flex items-center gap-3"><Zap className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Aprovação <span className="text-primary">2× mais rápida</span></span></div>
            <div className="hidden h-6 w-px bg-border md:block" />
            <div className="flex items-center gap-3"><BadgeCheck className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Objetivo <span className="text-primary">10%</span></span></div>
            <div className="hidden h-6 w-px bg-border md:block" />
            <div className="flex items-center gap-3"><Trophy className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Capital até <span className="text-primary">$3.000.000</span></span></div>
          </div>
        </div>

        <PaymentBanner />

        <section id="challenges" className="border-y border-border bg-background py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"><Zap className="h-3.5 w-3.5" /> Avaliação de 1 Fase</div>
              <h2 className="mb-3 text-4xl font-black tracking-tight">Escolhe o Teu Desafio</h2>
              <p className="mx-auto max-w-xl text-muted-foreground">Planos de capital de $10K até $3M. Objetivo de lucro 10%, perda diária máxima 10%, perda total máxima 10% e mínimo de 2 dias.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CHALLENGE_PLANS.map((plan) => <ChallengePlanCard key={plan.id} plan={plan} />)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-card py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"><Zap className="h-3.5 w-3.5" /> Processo Simples</div><h2 className="mb-3 text-4xl font-bold">Torna-te um Trader Financiado</h2><p className="mx-auto max-w-lg text-base text-muted-foreground">Quatro passos simples para teres acesso a capital.</p></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { num: "01", icon: ClipboardList, title: "Escolhe o Desafio", desc: "Seleciona um plano de capital e começa de imediato." },
                { num: "02", icon: BarChart3, title: "Completa a Avaliação", desc: "Atinge 10% de lucro e respeita os limites de 10%." },
                { num: "03", icon: UserCheck, title: "Conta Financiada", desc: "Após aprovação, opera com capital alocado." },
                { num: "04", icon: Wallet, title: "Recebe os Lucros", desc: "Solicita pagamentos via cripto ou transferência." },
              ].map(({ num, icon: Icon, title, desc }) => <div key={num} className="rounded-2xl border border-border bg-background p-6"><div className="mb-5 flex items-center gap-3"><span className="text-4xl font-black text-primary/20">{num}</span><Icon className="h-6 w-6 text-primary" /></div><h3 className="mb-2 font-bold">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{desc}</p></div>)}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400"><Star className="h-4 w-4 fill-yellow-400" /> Traders Verificados</div><h2 className="mb-4 text-3xl font-bold">O que dizem os nossos traders</h2></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{TESTIMONIALS.map((item) => <TestimonialCard key={item.name} t={item} />)}</div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-primary/20 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
          <div className="container relative z-10 mx-auto px-4"><div className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-3xl border border-primary/30 bg-card/80 p-8 text-center backdrop-blur-sm md:flex-row md:p-12 md:text-left"><div className="flex-1"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary"><Zap className="h-3 w-3" /> Exclusivo POP FIRM</div><h2 className="mb-3 text-3xl font-black tracking-tight md:text-4xl">Desafio <span className="text-primary">$3.000.000</span><br />Instant Funded</h2><p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">O maior desafio do mercado. Passa a avaliação e opera com três milhões de dólares em capital.</p><a href="#challenges"><Button size="lg" className="h-11 px-8 text-sm">Ver Desafios <ArrowRight className="ml-2 h-4 w-4" /></Button></a></div><div className="rounded-2xl border border-primary/30 bg-primary/10 px-10 py-8 text-center"><div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Taxa de avaliação</div><div className="text-5xl font-black">$4.999</div><div className="mt-1 text-xs text-muted-foreground">pagamento único</div></div></div></div>
        </section>

        <section id="faq" className="border-y border-border bg-card py-20">
          <div className="container mx-auto max-w-3xl px-4"><div className="mb-12 text-center"><h2 className="mb-4 text-3xl font-bold">Perguntas Frequentes</h2><p className="text-muted-foreground">Tudo o que precisas de saber antes de começares.</p></div><div className="flex flex-col gap-3">{FAQS.map((faq) => <FaqItem key={faq.q} faq={faq} />)}</div></div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/60"><Link href="/terms" className="flex items-center gap-1 transition-colors hover:text-muted-foreground"><FileText className="h-3 w-3" /> Termos &amp; Condições</Link><span>·</span><Link href="/support" className="flex items-center gap-1 transition-colors hover:text-muted-foreground"><HeadphonesIcon className="h-3 w-3" /> Suporte</Link><span>·</span><span>&copy; {new Date().getFullYear()} POP FIRM</span></div>
          <p className="mx-auto max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground/50">A POP FIRM fornece desafios de trading simulado. Nenhuma informação constitui aconselhamento de investimento.</p>
          <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-muted-foreground/30">Licença Nº {LICENSE_NUMBER}</p>
        </div>
      </footer>
    </div>
  );
}
