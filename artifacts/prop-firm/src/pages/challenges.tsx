import { useListChallenges } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Infinity, ShieldAlert } from "lucide-react";

export default function Challenges() {
  const { data: challenges, isLoading } = useListChallenges();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Escolhe o Teu Desafio</h1>
        <p className="text-muted-foreground text-lg">
          Demonstra as tuas capacidades de trading no nosso ambiente simulado. Passa a avaliação para te tornares um trader financiado e fica com até 90% dos lucros.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges?.map((plan) => {
            const isLegend = plan.accountSize >= 1_000_000;
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden border-border flex flex-col ${isLegend ? "border-yellow-500/40 shadow-[0_0_24px_rgba(234,179,8,0.08)]" : ""}`}
              >
                {isLegend && (
                  <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-yellow-500/30" />
                )}
                <div className="absolute top-0 right-0 p-4">
                  <ShieldAlert className={`w-6 h-6 ${isLegend ? "text-yellow-500/40" : "text-primary/20"}`} />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {isLegend && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                        Legend
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <span
                      className={`font-bold leading-tight block ${
                        plan.accountSize >= 1_000_000
                          ? "text-2xl text-yellow-400"
                          : plan.accountSize >= 100_000
                          ? "text-3xl"
                          : "text-4xl"
                      }`}
                    >
                      ${plan.accountSize.toLocaleString()}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">
                        Objetivo de Lucro: <strong>{plan.profitTarget}%</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                        <Infinity className="w-3 h-3" />
                      </div>
                      <span className="text-sm">
                        Perda Diária Máx.:{" "}
                        <strong className="text-green-500">Sem limite</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">
                        Perda Total Máx.: <strong>{plan.maxTotalDrawdown}%</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">
                        Dias Mín. de Trading: <strong>{plan.minTradingDays}</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">
                        Alavancagem: <strong>1:{plan.leverage}</strong>
                      </span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="pt-6 border-t border-border mt-auto">
                  <div className="w-full flex items-center justify-between">
                    <div className={`text-2xl font-bold ${isLegend ? "text-yellow-400" : ""}`}>
                      ${plan.price}
                    </div>
                    <Link href={`/checkout/${plan.id}`}>
                      <Button variant={isLegend ? "outline" : "default"} className={isLegend ? "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10" : ""}>
                        Selecionar Plano
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
