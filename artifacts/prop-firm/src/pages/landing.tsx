import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Trophy, Zap, BadgeCheck, Star, HeadphonesIcon, FileText, ChevronDown, ClipboardList, UserCheck, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LICENSE_NUMBER } from "@/lib/constants";

const FAQS = [
  {
    q: "Como funciona o desafio QuantFund?",
    a: "Escolhe um plano de capital, cumpre as metas de lucro respeitando os limites de drawdown e, após aprovação, recebes uma conta financiada para operar e ficar com até 90% dos lucros.",
  },
  {
    q: "Quanto tempo tenho para passar a avaliação?",
    a: "Tens no mínimo 2 dias e no máximo 30 dias para completar o desafio. O importante é cumprir os critérios de forma consistente dentro desse período.",
  },
  {
    q: "Quais são as regras de drawdown?",
    a: "Cada conta tem um limite de drawdown diário e um limite de drawdown total. Se qualquer um dos limites for atingido, a conta é encerrada automaticamente. Consulta a página de Desafios para ver os limites exatos de cada plano.",
  },
  {
    q: "Posso operar durante a noite ou ao fim de semana?",
    a: "Sim. Podes operar a qualquer hora do dia ou da noite, incluindo sessões asiáticas, europeias e americanas. Não existem restrições de horário — a plataforma está disponível 24 horas por dia.",
  },
  {
    q: "Posso deixar posições abertas de um dia para o outro?",
    a: "Sim, podes. Não há obrigatoriedade de fechar posições no final do dia. Podes manter trades abertos overnight ou ao longo do fim de semana, desde que respeites os limites de drawdown em vigor.",
  },
  {
    q: "Como e quando posso solicitar um pagamento?",
    a: "Após seres financiado, podes solicitar pagamentos quinzenais. Os pagamentos são processados via criptomoeda ou transferência bancária em até 24 horas.",
  },
  {
    q: "Posso usar Expert Advisors (EAs) ou bots?",
    a: "Sim, são permitidos. No entanto, estratégias de arbitragem, exploração de latência ou qualquer forma de manipulação do sistema são estritamente proibidas.",
  },
];

const TESTIMONIALS = [
  {
    name: "Pedro Silva",
    country: "Portugal",
    flag: "🇵🇹",
    role: "Trader Forex",
    photo: "testimonials/pedro.png",
    text: "Passei o desafio em 12 dias com uma conta de $100k. O terminal é rápido, os spreads são justos e o suporte respondeu em minutos. Melhor plataforma que já usei.",
    stars: 5,
    profit: "+$8.240",
  },
  {
    name: "Maria Santos",
    country: "Brasil",
    flag: "🇧🇷",
    role: "Day Trader",
    photo: "testimonials/maria.png",
    text: "Já tentei outras prop firms mas as regras eram complicadas demais. Aqui é simples: siga as regras, ganhe dinheiro. Já recebi dois pagamentos sem problemas.",
    stars: 5,
    profit: "+$5.180",
  },
  {
    name: "James Chen",
    country: "Singapore",
    flag: "🇸🇬",
    role: "Algorithmic Trader",
    photo: "testimonials/james.png",
    text: "The API is stable, execution is fast and the risk management tools are exactly what I needed. I scaled from $50k to $200k account in just 3 months.",
    stars: 5,
    profit: "+$22.600",
  },
  {
    name: "Sophia Williams",
    country: "United Kingdom",
    flag: "🇬🇧",
    role: "Swing Trader",
    photo: "testimonials/sophia.png",
    text: "I was skeptical at first, but the transparency of QuantFund won me over. Clear rules, fast payouts via crypto and excellent customer support. Highly recommend.",
    stars: 5,
    profit: "+$11.340",
  },
  {
    name: "Marco Rossi",
    country: "Italia",
    flag: "🇮🇹",
    role: "Trader de Índices",
    photo: "testimonials/marco.png",
    text: "Ho guadagnato $11.000 nel primo mese. Il sistema è trasparente, i prelievi arrivano in 24 ore e il team è sempre disponibile. Consigliatissimo a tutti i trader seri.",
    stars: 5,
    profit: "+$11.020",
  },
  {
    name: "Ahmed Hassan",
    country: "UAE",
    flag: "🇦🇪",
    role: "Gold & Oil Trader",
    photo: "testimonials/ahmed.png",
    text: "QuantFund gave me the capital I needed to trade properly. The platform is professional, payouts are fast and the challenge rules are fair. Best decision I made.",
    stars: 5,
    profit: "+$17.800",
  },
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
  { name: "PayPal", icon: "P", color: "#003087" },
  { name: "Skrill", icon: "S", color: "#862165" },
  { name: "Neteller", icon: "N", color: "#CC0000" },
  { name: "Crypto.com", icon: "Ø", color: "#002D74" },
];

function PaymentBanner() {
  const items = [...PAYMENT_METHODS, ...PAYMENT_METHODS];
  return (
    <div className="bg-card border-y border-border py-4 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Métodos de Pagamento Aceites</p>
      <div className="relative">
        <div className="flex items-center gap-6 animate-[scroll_30s_linear_infinite] whitespace-nowrap w-max">
          {items.map((method, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border shrink-0">
              <span className="text-lg font-bold" style={{ color: method.color }}>{method.icon}</span>
              <span className="text-sm font-medium text-foreground">{method.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-medium text-sm">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          {faq.a}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-4 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3">
        <img
          src={t.photo}
          alt={t.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
        />
        <div>
          <div className="font-semibold text-sm">{t.name} <span className="text-base">{t.flag}</span></div>
          <div className="text-xs text-muted-foreground">{t.role} · {t.country}</div>
        </div>
        <div className="ml-auto text-green-400 font-bold text-sm font-mono">{t.profit}</div>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: t.stars }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">QuantFund</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como Funciona</a>
            <Link href="/challenges" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Desafios</Link>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testemunhos</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/demo">
              <Button variant="ghost" className="text-sm text-primary hover:text-primary/80">Experimentar Demo</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="text-sm">Entrar</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="text-sm">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <Zap className="w-4 h-4" /> O Terminal de Trading de Elite
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Prova o teu edge. <br />
              <span className="text-primary">Opera até $3M.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Passa a avaliação e recebe capital. Fica com até 90% dos lucros com condições de trading institucionais e liquidez simulada.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Sem taxas ocultas
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Regras claras
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Ativação imediata
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Até 90% dos lucros
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-8 h-14 w-full sm:w-auto">
                  Iniciar Desafio <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-base px-8 h-14 w-full sm:w-auto border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
                  Experimentar Demo Grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Competitive claim strip */}
        <div className="bg-primary/5 border-y border-primary/20 py-5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Aprovação <span className="text-primary">2× mais rápida</span> que a concorrência</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Preços até <span className="text-primary">40% mais baixos</span> do que as líderes do mercado</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Capital até <span className="text-primary">$3.000.000</span> — o maior do mercado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Banner */}
        <PaymentBanner />

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-card border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
                <Zap className="w-3.5 h-3.5" /> Processo Simples
              </div>
              <h2 className="text-4xl font-bold mb-3">Torna-te um Trader Financiado</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base">Quatro passos simples para teres acesso a capital e começares a receber os teus lucros.</p>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {[
                {
                  num: "01",
                  icon: <ClipboardList className="w-6 h-6 text-primary" />,
                  title: "Escolhe o Desafio",
                  desc: "Seleciona um plano de capital entre $10K e $1M. Paga a taxa única de avaliação e começa de imediato.",
                  points: ["Ativação instantânea", "Taxa única, sem mensalidades"],
                },
                {
                  num: "02",
                  icon: <BarChart3 className="w-6 h-6 text-primary" />,
                  title: "Completa a Avaliação",
                  desc: "Opera no nosso webtrader com gráficos TradingView, atinge a meta de lucro e respeita os drawdowns.",
                  points: ["Meta de lucro: 8%", "Até 30 dias para completar"],
                },
                {
                  num: "03",
                  icon: <UserCheck className="w-6 h-6 text-primary" />,
                  title: "Conta Financiada",
                  desc: "Após aprovação a tua conta é ativada com capital total. Opera livremente e fica com até 90% dos lucros.",
                  points: ["Aprovação em 24h", "Até 90% profit split"],
                },
                {
                  num: "04",
                  icon: <Wallet className="w-6 h-6 text-primary" />,
                  title: "Recebe os Lucros",
                  desc: "Solicita pagamentos quinzenais via cripto ou transferência bancária. Processados em até 24 horas.",
                  points: ["Cripto ou wire transfer", "Pagamento em 24h"],
                },
              ].map((step, i, arr) => (
                <div key={i} className="relative flex">
                  {/* Card */}
                  <div className="flex-1 flex flex-col bg-background border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors">
                    {/* Number + Icon row */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-4xl font-black text-primary/20 leading-none select-none">{step.num}</span>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        {step.icon}
                      </div>
                    </div>
                    {/* Text */}
                    <h3 className="text-base font-bold mb-2 leading-snug">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{step.desc}</p>
                    {/* Points */}
                    <div className="flex flex-col gap-1.5 mt-auto">
                      {step.points.map((pt, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Arrow connector (desktop only, not after last) */}
                  {i < arr.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center w-0 overflow-visible z-10">
                      <ArrowRight className="w-4 h-4 text-primary/40 absolute -right-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-10 h-12">
                  Começar o Desafio <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4 border border-yellow-500/20">
                <Star className="w-4 h-4 fill-yellow-400" /> Traders Verificados
              </div>
              <h2 className="text-3xl font-bold mb-4">O que dizem os nossos traders</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Mais de 2.400 traders já passaram o nosso desafio e receberam capital real para operar.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
            <div className="text-center mt-10">
              <div className="inline-flex items-center gap-6 flex-wrap justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2.400+</div>
                  <div className="text-sm text-muted-foreground">Traders Financiados</div>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">$12M+</div>
                  <div className="text-sm text-muted-foreground">Capital Alocado</div>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.9★</div>
                  <div className="text-sm text-muted-foreground">Avaliação Média</div>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Tempo Médio de Pagamento</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3M Instant Challenge spotlight */}
        <section className="py-16 relative overflow-hidden border-y border-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto rounded-3xl border border-primary/30 bg-card/80 backdrop-blur-sm p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              {/* Left */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/30 tracking-widest uppercase">
                  <Zap className="w-3 h-3" /> Exclusivo QuantFund
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                  Desafio <span className="text-primary">$3.000.000</span><br />Instant Funded
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
                  O maior desafio do mercado. Passa a avaliação e opera com três milhões de dólares em capital. Fica com até 90% dos lucros, sem limites de crescimento.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  {[
                    { label: "Capital", value: "$3.000.000" },
                    { label: "Lucro partilhado", value: "até 90%" },
                    { label: "Meta de lucro", value: "8%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-background border border-border rounded-xl px-4 py-2 text-center">
                      <div className="text-lg font-black text-primary leading-tight">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link href="/challenges">
                  <Button size="lg" className="text-sm px-8 h-11">
                    Ver Detalhes do $3M <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {/* Right — price callout */}
              <div className="shrink-0 flex flex-col items-center justify-center bg-primary/10 border border-primary/30 rounded-2xl px-10 py-8 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Taxa de avaliação</div>
                <div className="text-5xl font-black text-foreground leading-tight">$7.497</div>
                <div className="text-xs text-muted-foreground mt-1">pagamento único</div>
                <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground text-left">
                  <div className="flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" /> Sem mensalidades</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" /> Overnight permitido</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" /> EAs permitidos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground">Tudo o que precisas de saber antes de começares.</p>
            </div>
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} faq={faq} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-card border-t border-border">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8">Junta-te a milhares de traders e começa o teu desafio hoje. Sem riscos reais — só simulação profissional.</p>
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-10 h-14">
                Começar Gratuitamente <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-5 text-xs text-muted-foreground/60">
            <Link href="/terms" className="hover:text-muted-foreground transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3" /> Termos &amp; Condições
            </Link>
            <span>·</span>
            <Link href="/support" className="hover:text-muted-foreground transition-colors flex items-center gap-1">
              <HeadphonesIcon className="w-3 h-3" /> Suporte
            </Link>
            <span>·</span>
            <span>&copy; {new Date().getFullYear()} QuantFund</span>
          </div>
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed max-w-3xl mx-auto text-center">
            A QuantFund fornece desafios de trading simulado. Nenhuma informação disponibilizada constitui aconselhamento de investimento, oferta ou solicitação de compra/venda de qualquer instrumento financeiro. Os resultados simulados não são indicativos de resultados futuros.
          </p>
          <p className="text-[10px] text-muted-foreground/30 text-center mt-3 font-mono tracking-widest">
            Licença Nº {LICENSE_NUMBER}
          </p>
        </div>
      </footer>
    </div>
  );
}
