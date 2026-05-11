import { useListChallenges } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Infinity, Star, Zap, TrendingUp, Shield, Clock, BarChart2, Layers, CheckCircle, ArrowRight } from "lucide-react";

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
  gradient: string;
  accent: string;
  accentText: string;
  accentBg: string;
  ring: string;
  popular?: boolean;
  legend?: boolean;
};

function getTierConfig(accountSize: number): TierConfig {
  if (accountSize >= 1_000_000) return {
    gradient: "from-yellow-950/60 via-yellow-900/20 to-transparent",
    accent: "border-yellow-500/50",
    accentText: "text-yellow-400",
    accentBg: "bg-yellow-500/10",
    ring: "ring-yellow-500/20",
    legend: true,
  };
  if (accountSize >= 200_000) return {
    gradient: "from-purple-950/60 via-purple-900/20 to-transparent",
    accent: "border-purple-500/40",
    accentText: "text-purple-400",
    accentBg: "bg-purple-500/10",
    ring: "ring-purple-500/10",
  };
  if (accountSize >= 100_000) return {
    gradient: "from-blue-950/60 via-blue-900/20 to-transparent",
    accent: "border-blue-500/40",
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/10",
    ring: "ring-blue-500/10",
    popular: true,
  };
  if (accountSize >= 50_000) return {
    gradient: "from-cyan-950/60 via-cyan-900/20 to-transparent",
    accent: "border-cyan-500/30",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    ring: "ring-cyan-500/10",
  };
  if (accountSize >= 25_000) return {
    gradient: "from-emerald-950/60 via-emerald-900/20 to-transparent",
    accent: "border-emerald-500/30",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    ring: "ring-emerald-500/10",
  };
  return {
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

function PhaseBadge({ phase, label, target }: { phase: 1 | 2; label: string; target: string }) {
  return (
    <div className="flex-1 rounded-lg bg-white/[0.04] border border-white/10 p-2.5 text-center min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Fase {phase}</div>
      <div className="text-xs font-semibold text-foreground truncate">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{target}</div>
    </div>
  );
}

function ChallengeCard({ plan }: { plan: Challenge }) {
  const tier = getTierConfig(plan.accountSize);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${tier.accent} ring-1 ${tier.ring}`}
    >
      {/* Top gradient band */}
      <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${tier.gradient} pointer-events-none`} />

      {/* Popular / Legend badge */}
      {tier.popular && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg z-10">
          <Star className="w-2.5 h-2.5" />
          Mais Popular
        </div>
      )}
      {tier.legend && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/20 text-[10px] font-bold uppercase tracking-wider text-yellow-400 border border-yellow-500/40 z-10">
          <Zap className="w-2.5 h-2.5" />
          Legend
        </div>
      )}

      {/* Header */}
      <div className="relative px-5 pt-5 pb-4">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 ${tier.accentText}`}>
          {plan.name.replace(" Challenge", "")}
        </p>
        <div className={`text-4xl font-black tabular-nums leading-none mb-0.5 ${tier.legend ? "text-yellow-400" : ""}`}>
          {formatAccountSize(plan.accountSize)}
        </div>
        <p className="text-xs text-muted-foreground">Capital virtual simulado</p>
      </div>

      {/* Phase progression */}
      <div className="px-5 pb-3">
        <div className="flex items-stretch gap-1.5">
          <PhaseBadge phase={1} label="Avaliação" target={`${plan.profitTarget}% lucro`} />
          <div className="flex items-center text-muted-foreground/40 shrink-0">
            <ArrowRight className="w-3 h-3" />
          </div>
          <PhaseBadge phase={2} label="Verificação" target="5% lucro" />
          <div className="flex items-center text-muted-foreground/40 shrink-0">
            <ArrowRight className="w-3 h-3" />
          </div>
          <div className="flex-1 rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-center min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Funded</div>
            <div className="text-xs font-semibold text-foreground">Conta Real</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">até 90%</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mx-5" />

      {/* Features */}
      <div className="px-5 py-3 flex-1">
        <FeatureRow
          icon={TrendingUp}
          label="Obj. de Lucro (Fase 1)"
          value={`${plan.profitTarget}%`}
          accentText={tier.accentText}
        />
        <FeatureRow
          icon={Infinity}
          label="Perda Diária Máx."
          value="Sem limite"
          highlight
        />
        <FeatureRow
          icon={Shield}
          label="Perda Total Máx."
          value={`${plan.maxTotalDrawdown}%`}
        />
        <FeatureRow
          icon={Clock}
          label="Dias Mín. de Trading"
          value={`${plan.minTradingDays} dias`}
        />
        <FeatureRow
          icon={BarChart2}
          label="Alavancagem"
          value={`1:${plan.leverage}`}
        />
        <FeatureRow
          icon={Layers}
          label="Divisão de Lucros"
          value="até 90%"
          accentText={tier.accentText}
        />
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
              tier.popular
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 shadow-lg"
                : tier.legend
                ? "bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/40"
                : ""
            }`}
            variant={tier.popular ? "default" : tier.legend ? "outline" : "default"}
          >
            Começar Agora
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
          Avaliação em 2 Fases
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
          Escolhe o Teu Desafio
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          Demonstra as tuas capacidades num ambiente 100% simulado. Passa as 2 fases, torna-te trader financiado e fica com até <strong className="text-foreground">90% dos lucros</strong>.
        </p>
      </div>

      {/* How phases work */}
      <div className="px-6 pb-8 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { step: "Fase 1", title: "Avaliação", desc: "Atinge o objetivo de lucro respeitando os limites de risco", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { step: "Fase 2", title: "Verificação", desc: "Confirma a consistência da tua estratégia (5% de lucro)", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { step: "Funded", title: "Conta Financiada", desc: "Opera com capital real simulado e recebe até 90% dos lucros", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          ].map(({ step, title, desc, color, bg }) => (
            <div key={step} className={`rounded-xl border p-4 ${bg}`}>
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${color}`}>{step}</div>
              <div className="text-sm font-bold text-foreground mb-1">{title}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="px-6 pb-16 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[500px] rounded-2xl bg-card border border-border animate-pulse" />
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

      {/* Bottom trust bar */}
      <div className="border-t border-border bg-card/30 px-6 py-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          {[
            { icon: CheckCircle, text: "Pagamento único, sem mensalidades" },
            { icon: Zap, text: "Conta ativada em minutos" },
            { icon: Shield, text: "100% simulado, sem risco real" },
            { icon: Star, text: "Até 90% de divisão de lucros" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
