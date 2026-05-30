import { Link } from "wouter";
import { UserButton, useUser } from "@clerk/react";
import { ArrowRight, CheckCircle, Shield, Trophy, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const { user } = useUser();
  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "trader";

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

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <section className="rounded-[2rem] border border-primary/20 bg-card/80 p-8 shadow-2xl backdrop-blur md:p-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
            Conta criada
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Bem-vinda à QuantFund, {firstName}.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A tua conta foi criada com sucesso. Se já tens um challenge ativo, entra diretamente na tua área de contas para abrir o terminal de trading.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <Shield className="mb-4 h-7 w-7 text-primary" />
              <h3 className="font-black">1. Escolhe o desafio</h3>
              <p className="mt-2 text-sm text-muted-foreground">Seleciona o capital que queres operar: 10K, 25K, 50K, 100K ou superior.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <Wallet className="mb-4 h-7 w-7 text-primary" />
              <h3 className="font-black">2. Faz o pagamento</h3>
              <p className="mt-2 text-sm text-muted-foreground">O pagamento é processado por NOWPayments. Após confirmação, a conta é criada automaticamente.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <Trophy className="mb-4 h-7 w-7 text-primary" />
              <h3 className="font-black">3. Entra no terminal</h3>
              <p className="mt-2 text-sm text-muted-foreground">Depois da compra, o terminal fica pronto para operar com o challenge comprado.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/accounts">
              <Button className="rounded-2xl px-8 py-4 text-base font-black">
                Entrar na área do trader
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="outline" className="rounded-2xl px-8 py-4 text-base font-bold">
                Ver desafios
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" className="rounded-2xl px-8 py-4 text-base font-bold">
                Falar com suporte
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Se já tens um challenge ativo, clica em “Entrar na área do trader”.
          </div>
        </section>
      </main>
    </div>
  );
}
