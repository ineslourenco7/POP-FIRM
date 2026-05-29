import { Link } from "wouter";
import { CheckCircle, Clock, ListChecks, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <section className="w-full rounded-[2rem] border border-green-500/20 bg-card/90 p-8 text-center shadow-2xl backdrop-blur md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            <CheckCircle className="h-11 w-11" />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-green-300">
            Compra recebida
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Obrigado pela compra!</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            O pagamento foi recebido pela NOWPayments. Assim que a confirmação da blockchain for concluída, a tua conta de challenge fica ativa automaticamente.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/60 p-5 text-left">
              <Clock className="mb-4 h-7 w-7 text-primary" />
              <h3 className="font-black">Confirmação automática</h3>
              <p className="mt-2 text-sm text-muted-foreground">A NOWPayments envia a confirmação para a QuantFund quando o pagamento fica validado.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-5 text-left">
              <Wallet className="mb-4 h-7 w-7 text-primary" />
              <h3 className="font-black">Conta criada</h3>
              <p className="mt-2 text-sm text-muted-foreground">A conta de trading é criada com o saldo correspondente ao challenge comprado.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-5 text-left">
              <ListChecks className="mb-4 h-7 w-7 text-primary" />
              <h3 className="font-black">Selecionar conta</h3>
              <p className="mt-2 text-sm text-muted-foreground">Depois podes escolher a conta ativa e abrir o terminal de trading.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/accounts">
              <Button className="rounded-2xl px-8 py-4 text-base font-black">
                Ver minhas contas
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="outline" className="rounded-2xl px-8 py-4 text-base font-bold">
                Comprar outro desafio
              </Button>
            </Link>
          </div>

          <p className="mx-auto mt-7 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Se a conta ainda não aparecer, aguarda alguns minutos e atualiza a página. Pagamentos em crypto podem precisar de confirmações adicionais da rede.
          </p>
        </section>
      </main>
    </div>
  );
}
