import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Trophy, Zap, BadgeCheck, Star, HeadphonesIcon, FileText } from "lucide-react";
import { useEffect, useRef } from "react";

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
            <a href="#plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Desafios</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testemunhos</a>
          </nav>
          <div className="flex items-center gap-4">
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
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-base px-8 h-14 w-full sm:w-auto">
                  Aceder ao Terminal
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Payment Methods Banner */}
        <PaymentBanner />

        {/* Features */}
        <section id="how-it-works" className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Construído para Profissionais</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-background rounded-2xl border border-border">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Terminal Avançado</h3>
                <p className="text-muted-foreground">Opera diretamente no nosso webtrader com gráficos TradingView. Execução rápida, sem slippage.</p>
              </div>
              <div className="p-6 bg-background rounded-2xl border border-border">
                <ShieldCheck className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Regras Transparentes</h3>
                <p className="text-muted-foreground">Sem spreads escondidos ou regras confusas. Limites de drawdown simples e metas de lucro claras.</p>
              </div>
              <div className="p-6 bg-background rounded-2xl border border-border">
                <Trophy className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pagamentos Rápidos</h3>
                <p className="text-muted-foreground">Solicita pagamentos quinzenais via Cripto ou Transferência Bancária assim que ficares financiado.</p>
              </div>
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
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-6 h-6 opacity-50 grayscale" />
              <span className="text-lg font-bold opacity-50">QuantFund</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Termos &amp; Condições
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <HeadphonesIcon className="w-3.5 h-3.5" /> Suporte
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-border pt-8">
            <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-4xl mx-auto text-center">
              PipFarm (operated by ECI Ventures Pte. Ltd. – UEN 202329954C, the "Company") provides simulated trading challenges for entertainment, education and training purposes. Past performance is not necessarily indicative of future results. Hypothetical or simulated performance results have limitations. Simulated trading results do not represent actual trading, as trades have not been executed with counterparties. Simulated trading results may under-or-over compensate for the impact of certain market factors, such as lack of liquidity. Simulated trading programs are subject to the fact that they are designed with the benefit of hindsight. No representation is made that any user will or is likely to achieve profit or losses similar to those shown in the simulated environment.
            </p>
            <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-4xl mx-auto text-center mt-3">
              None of the information provided by the Company is intended as investment advice, an offer or solicitation of an offer to buy or sell, or a recommendation, endorsement, or sponsorship of any security or investment product. Nothing contained herein is a solicitation or an offer to buy or sell futures, options, or forex. Use of the information is at your own risk, and the Company assumes no responsibility or liability for any use or misuse of such information. None of the services provided are investment services or investment advice, per the Singapore Securities and Futures Act 2001 or other countries where the Company provides services.
            </p>
            <p className="text-xs mt-6 text-muted-foreground/40 text-center">&copy; {new Date().getFullYear()} QuantFund · ECI Ventures Pte. Ltd. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
