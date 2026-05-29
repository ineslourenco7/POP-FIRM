import { Link } from "wouter";
import { UserButton } from "@clerk/react";
import { ArrowRight, Loader2, Plus, Shield, TrendingUp, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type AccountData = {
  id: number;
  challengeName: string | null;
  status: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  floatingPnl: number;
  totalPnl: number;
  tradingDays: number;
};

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function AccountSelectPage() {
  const { data: accounts = [], isLoading, isError } = useQuery<AccountData[]>({
    queryKey: ["accounts", "select"],
    queryFn: async () => {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return res.json();
    },
  });

  const activeAccounts = accounts.filter((account) => account.status === "active");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black tracking-tight">
            Quant<span className="text-primary">Fund</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              Área do trader
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Seleciona a conta</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Escolhe qual challenge queres abrir no terminal de trading.
            </p>
          </div>
          <Link href="/challenges">
            <Button variant="outline" className="rounded-2xl font-bold">
              <Plus className="mr-2 h-4 w-4" /> Comprar novo desafio
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> A carregar contas...
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            Não foi possível carregar as tuas contas. Tenta novamente ou contacta o suporte.
          </div>
        )}

        {!isLoading && !isError && activeAccounts.length === 0 && (
          <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-2xl">
            <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="text-2xl font-black">Ainda não tens nenhum challenge ativo</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Compra um desafio para ativar a tua conta de trading e desbloquear o terminal.
            </p>
            <Link href="/challenges">
              <Button className="mt-6 rounded-2xl px-8 py-4 font-black">
                Ver desafios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {activeAccounts.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeAccounts.map((account) => {
              const pnlPositive = account.totalPnl >= 0;
              return (
                <Link key={account.id} href={`/terminal/${account.id}`}>
                  <article className="group h-full cursor-pointer rounded-[1.5rem] border border-border bg-card/90 p-6 shadow-xl transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-black uppercase text-green-300">
                        Ativa
                      </span>
                    </div>

                    <h2 className="text-xl font-black">{account.challengeName || `Challenge #${account.id}`}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Conta #{account.id}</p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-border bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Capital</p>
                        <p className="mt-1 font-mono font-black">{money(account.initialBalance)}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Equity</p>
                        <p className="mt-1 font-mono font-black">{money(account.equity)}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">P&L</p>
                        <p className={`mt-1 font-mono font-black ${pnlPositive ? "text-green-400" : "text-red-400"}`}>
                          {pnlPositive ? "+" : ""}{money(account.totalPnl)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Dias</p>
                        <p className="mt-1 font-mono font-black">{account.tradingDays}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm font-black text-primary">
                      <span>Abrir terminal</span>
                      <TrendingUp className="h-5 w-5 transition group-hover:translate-x-1" />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
