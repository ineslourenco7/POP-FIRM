import { useListChallenges } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Infinity, Star, Zap, TrendingUp, Shield, Clock, BarChart2, Layers, CheckCircle, Flame } from "lucide-react";

type Challenge = {
  id: number;
  name: string;
  accountSize: number;
  price: number;
  profitTarget: number;
  maxDailyDrawdown: number;
  maxTotalDrawdown: number;
  minTradingDays: number;
  leverage: number;
};

type TierConfig = {
  tierName: string;
  tierLabel: string;
  gradient: string;
  accent: string;
  accentText: string;
  accentBg: string;
  ring: string;
  badge?: { label: string; color: string; textColor: string; icon: React.ElementType };
};

function getTierConfig(accountSize: number): TierConfig {
  if (accountSize >= 3_000_000) return {
    tierName: "Instant",
    tierLabel: "Conta financiada de imediato. Sem avaliação.",
    gradient: "from-orange-950/80 via-red-900/30 to-transparent",
    accent: "border-orange-500/60",
    accentText: "text-orange-400",
    accentBg: "bg-orange-500/10",
    ring: "ring-orange-500/30",
    badge: { label: "Instant Funded", color: "bg-orange-500", textColor: "text-white", icon: Flame },
  };
  if (accountSize >= 1_000_000) return {
    tierName: "Legend",
    tierLabel: "O máximo. Para os melhores do mundo.",
    gradient: "from-yellow-950/60 via-yellow-900/20 to-transparent",
    accent: "border-yellow-500/50",
    accentText: "text-yellow-400",
    accentBg: "bg-yellow-500/10",
    ring: "ring-yellow-500/20",
    badge: { label: "Legend", color: "bg-yellow-500/15 border border-yellow-500/40", textColor: "text-yellow-400", icon: Zap },
  };
  if (accountSize >= 200_000) return {
    tierName: "Elite",
    tierLabel: "Para traders experientes e consistentes.",
    gradient: "from-purple-950/60 via-purple-900/20 to-transparent",
    accent: "border-purple-500/40",
    accentText: "text-purple-400",
    accentBg: "bg-purple-500/10",
    ring: "ring-purple-500/10",
    badge: { label: "Elite", color: "bg-purple-500/15 border border-purple-500/30", textColor: "text-purple-400", icon: Star },
  };
  if (accountSize >= 100_000) return {
    tierName: "Pro",
    tierLabel: "O mais escolhido pelos nossos traders.",
    gradient: "from-blue-950/60 via-blue-900/20 to-transparent",
    accent: "border-blue-500/40",
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/10",
    ring: "ring-blue-500/10",
    badge: { label: "Mais Popular", color: "bg-blue-500", textColor: "text-white", icon: Star },
  };
  if (accountSize >= 50_000) return {
    tierName: "Trader",
    tierLabel: "Para quem já tem estratégia definida.",
    gradient: "from-cyan-950/60 via-cyan-900/20 to-transparent",
    accent: "border-cyan-500/30",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    ring: "ring-cyan-500/10",
  };
  if (accountSize >= 25_000) return {
    tierName: "Explorer",
    tierLabel: "Dá o próximo passo na tua carreira.",
    gradient: "from-emerald-950/60 via-emerald-900/20 to-transparent",
    accent: "border-emerald-500/30",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    ring: "ring-emerald-500/10",
  };
  return {
    tierName: "Starter",
    tierLabel: "O ponto de partida ideal para começar.",
    gradient: "from-slate-800/60 via-slate-800/20 to-transparent",
    accent: "border-slate-600/40",
    accentText: "text-slate-400",
    accentBg: "bg-slate-500/10",
    ring: "ring-slate-500/10",
  };
}

function formatAccountSize(size: number): string {
  if (size >= 1_000_000) return "$" + (size / 1_000_000).toFixed(0) + "M";
  if (size >= 1_000) return "$" + (size / 1_000).toFixed(0) + "K";
  return "$" + size;
}

function FeatureRow({
  icon: Icon,
  label,
  value,
  highlight,
  accentText,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  accentText?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`w-3.5 h-3.5 shrink-0 ${highlight ? "text-green-500" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <span className={`text-xs font-semibold tabular-nums ml-2 shrink-0 ${highlight ? "text-green-400" : accentText ?? "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function ChallengeCard({ plan }: { plan: Challenge }) {
  const tier = getTierConfig(plan.accountSize);
  const BadgeIcon = tier.badge?.icon;
  const isInstant = plan.profitTarget === 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${tier.accent} ring-1 ${tier.ring}`}
    >
      {/* Top gradient band */}
      <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${tier.gradient} pointer-events-none`} />

      {/* Badge */}
      {tier.badge && BadgeIcon && (
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${tier.badge.color} ${tier.badge.textColor}`}>
          <BadgeIcon className="w-2.5 h-2.5" />
          {tier.badge.label}
        </div>
      )}

      {/* Header */}
      <div className="relative px-5 pt-5 pb-3">
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${tier.accentText}`}>
          {tier.tierName}
        </div>
        <div className={`text-4xl font-black tabular-nums leading-none mb-1 ${tier.accentText === "text-yellow-400" ? "text-yellow-400" : ""}`}>
          {formatAccountSize(plan.accountSize)}
        </div>
        <p className="text-xs text-muted-foreground leading-snug">{tier.tierLabel}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mx-5" />

      {/* Features */}
      <div className="px-5 py-3 flex-1">
        {isInstant ? (
          <>
            <FeatureRow icon={CheckCircle} label="Avaliação" value="Sem avaliação" highlight />
            <FeatureRow icon={Flame} label="Conta Ativa" value="Imediatamente" highlight />
            <FeatureRow icon={Infinity} label="Perda Diária Máx." value="Sem limite" highlight />
            <FeatureRow icon={Shield} label="Perda Total Máx." value={`${plan.maxTotalDrawdown}%`} />
            <FeatureRow icon={BarChart2} label="Alavancagem" value={`1:${plan.leverage}`} accentText={tier.accentText} />
            <FeatureRow icon={Layers} label="Divisão de Lucros" value="até 90%" accentText={tier.accentText} />
          </>
        ) : (
          <>
            <FeatureRow icon={TrendingUp} label="Objetivo de Lucro" value={`${plan.profitTarget}%`} accentText={tier.accentText} />
            <FeatureRow icon={Infinity} label="Perda Diária Máx." value="Sem limite" highlight />
            <FeatureRow icon={Shield} label="Perda Total Máx." value={`${plan.maxTotalDrawdown}%`} />
            <FeatureRow icon={Clock} label="Dias Mín. de Trading" value={`${plan.minTradingDays} dias`} />
            <FeatureRow icon={BarChart2} label="Alavancagem" value={`1:${plan.leverage}`} />
            <FeatureRow icon={Layers} label="Divisão de Lucros" value="até 90%" accentText={tier.accentText} />
          </>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-black">${plan.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">/ pagamento único</span>
        </div>
        <Link href={`/checkout/${plan.id}`} className="block">
          <Button
            className={`w-full font-semibold h-10 text-sm ${
              isInstant
                ? "bg-orange-500 hover:bg-orange-400 text-white shadow-orange-900/40 shadow-lg"
                : tier.accentText === "text-blue-400"
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 shadow-lg"
                : tier.accentText === "text-yellow-400"
                ? "bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/40"
                : ""
            }`}
            variant={isInstant || tier.accentText === "text-blue-400" ? "default" : tier.accentText === "text-yellow-400" ? "outline" : "default"}
          >
            {isInstant ? "Obter Conta Agora" : "Começar Agora"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Challenges() {
  const { data: challenges, isLoading } = useListChallenges();

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-widest mb-4">
          <Zap className="w-3 h-3" />
          Avaliação de 1 Fase
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
          Escolhe o Teu Tier
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          Uma única fase de avaliação. Passa, torna-te trader financiado e fica com até <strong className="text-foreground">90% dos lucros</strong>.
        </p>
      </div>

      {/* Cards grid */}
      <div className="px-6 pb-16 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[420px] rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges?.map(plan => (
              <ChallengeCard key={plan.id} plan={plan as Challenge} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA section */}
      <div className="border-t border-border bg-gradient-to-b from-card/60 to-card/20 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
              Pronto para provar que és trader?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Junta-te a centenas de traders que já recebem saques mensais da QuantFund.
            </p>
          </div>

          {/* Trust pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Zap,
                title: "1 Única Fase",
                sub: "Sem fases intermináveis",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10 border-yellow-500/20",
              },
              {
                icon: TrendingUp,
                title: "Até 90% Lucros",
                sub: "A tua performance, o teu dinheiro",
                color: "text-green-400",
                bg: "bg-green-500/10 border-green-500/20",
              },
              {
                icon: Shield,
                title: "Sem Mensalidades",
                sub: "Pagamento único, sem surpresas",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                icon: CheckCircle,
                title: "Saques em 48h",
                sub: "Processamento rápido garantido",
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
            ].map(({ icon: Icon, title, sub, color, bg }) => (
              <div key={title} className={`rounded-xl border p-4 text-center ${bg}`}>
                <div className={`flex justify-center mb-2 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`text-sm font-bold mb-0.5 ${color}`}>{title}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{sub}</div>
              </div>
            ))}
          </div>

          {/* Guarantee strip */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-center md:text-left">
            <Star className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">Satisfação garantida.</span>{" "}
              Se passares a avaliação e não recebermos o teu saque nos prazos, reembolsamos a taxa de inscrição na íntegra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
