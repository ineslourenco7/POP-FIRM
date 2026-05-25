import { useListChallenges } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, Zap, TrendingUp, Shield, CheckCircle } from "lucide-react";

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

const fallbackChallenges: Challenge[] = [
  { id: 1, name: "POP $10K", accountSize: 10000, price: 99, profitTarget: 8, maxDailyDrawdown: 0, maxTotalDrawdown: 10, minTradingDays: 5, leverage: 100 },
  { id: 2, name: "POP $25K", accountSize: 25000, price: 149, profitTarget: 8, maxDailyDrawdown: 0, maxTotalDrawdown: 10, minTradingDays: 5, leverage: 100 },
  { id: 3, name: "POP $50K", accountSize: 50000, price: 249, profitTarget: 8, maxDailyDrawdown: 0, maxTotalDrawdown: 10, minTradingDays: 5, leverage: 100 },
  { id: 4, name: "POP $100K", accountSize: 100000, price: 399, profitTarget: 8, maxDailyDrawdown: 0, maxTotalDrawdown: 10, minTradingDays: 5, leverage: 100 },
  { id: 5, name: "POP $200K", accountSize: 200000, price: 749, profitTarget: 8, maxDailyDrawdown: 0, maxTotalDrawdown: 10, minTradingDays: 5, leverage: 100 },
  { id: 6, name: "POP $400K", accountSize: 400000, price: 1299, profitTarget: 8, maxDailyDrawdown: 0, maxTotalDrawdown: 10, minTradingDays: 5, leverage: 100 },
];

function getChallengeList(raw: unknown): Challenge[] {
  if (Array.isArray(raw) && raw.length > 0) return raw as Challenge[];

  if (raw && typeof raw === "object") {
    const value = raw as { data?: unknown; challenges?: unknown; items?: unknown; result?: unknown };

    if (Array.isArray(value.data) && value.data.length > 0) return value.data as Challenge[];
    if (Array.isArray(value.challenges) && value.challenges.length > 0) return value.challenges as Challenge[];
    if (Array.isArray(value.items) && value.items.length > 0) return value.items as Challenge[];
    if (Array.isArray(value.result) && value.result.length > 0) return value.result as Challenge[];
  }

  return fallbackChallenges;
}

function formatAccountSize(size: number): string {
  if (size >= 1000) return `$${size / 1000}K`;
  return `$${size}`;
}

function ChallengeCard({ plan }: { plan: Challenge }) {
  const popular = plan.accountSize === 100000;
  const premium = plan.accountSize >= 200000;

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${popular ? "border-blue-500/40 ring-1 ring-blue-500/10" : premium ? "border-purple-500/35 ring-1 ring-purple-500/10" : "border-emerald-500/30 ring-1 ring-emerald-500/10"}`}>
      <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${popular ? "from-blue-950/60 via-blue-900/20" : premium ? "from-purple-950/60 via-purple-900/20" : "from-emerald-950/60 via-emerald-900/20"} to-transparent pointer-events-none`} />

      {popular && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white shadow-sm z-10">
          <Star className="w-2.5 h-2.5" />
          Mais Popular
        </div>
      )}

      <div className="relative px-5 pt-5 pb-3">
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${popular ? "text-blue-400" : premium ? "text-purple-400" : "text-emerald-400"}`}>
          {popular ? "Pro" : premium ? "Elite" : "Explorer"}
        </div>
        <div className="text-4xl font-black tabular-nums leading-none mb-1">
          {formatAccountSize(plan.accountSize)}
        </div>
        <p className="text-xs text-muted-foreground leading-snug">{popular ? "O plano mais escolhido." : premium ? "Para traders experientes." : "Ideal para começar."}</p>
      </div>

      <div className="h-px bg-white/5 mx-5" />

      <div className="px-5 py-3 flex-1 space-y-2 text-xs">
        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-muted-foreground">Objetivo de Lucro</span><strong>{plan.profitTarget}%</strong></div>
        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-muted-foreground">Perda Diária Máx.</span><strong className="text-green-400">Sem limite</strong></div>
        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-muted-foreground">Perda Total Máx.</span><strong>{plan.maxTotalDrawdown}%</strong></div>
        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-muted-foreground">Dias Mínimos</span><strong>{plan.minTradingDays} dias</strong></div>
        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-muted-foreground">Alavancagem</span><strong>1:{plan.leverage}</strong></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Divisão de Lucros</span><strong>até 90%</strong></div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-black">${plan.price}</span>
          <span className="text-xs text-muted-foreground">/ pagamento único</span>
        </div>
        <Link href={`/checkout/${plan.id}`} className="block">
          <Button className={`w-full font-semibold h-10 text-sm ${popular ? "bg-blue-600 hover:bg-blue-500 text-white" : ""}`}>
            Começar Agora
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Challenges() {
  const { data: challenges } = useListChallenges();
  const visibleChallenges = getChallengeList(challenges);

  return (
    <div className="min-h-screen">
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

      <div className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleChallenges.map((plan) => (
            <ChallengeCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-gradient-to-b from-card/60 to-card/20 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
              Pronto para provar que és trader?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Escolhe um plano e avança para o checkout seguro.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Zap, title: "1 Única Fase", sub: "Processo simples", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
              { icon: TrendingUp, title: "Até 90% Lucros", sub: "Plano claro", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              { icon: Shield, title: "Sem Mensalidades", sub: "Pagamento único", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { icon: CheckCircle, title: "Suporte", sub: "Ajuda rápida", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
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
        </div>
      </div>
    </div>
  );
}
