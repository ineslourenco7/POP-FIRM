import { useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const checkoutPlans: Record<string, { name: string; account: string; price: number; label: string; balance: number }> = {
  "1": { name: "POP Launch", account: "$10K", price: 99, label: "Starter", balance: 10000 },
  "2": { name: "POP Starter", account: "$25K", price: 149, label: "Popular", balance: 25000 },
  "3": { name: "POP Growth", account: "$50K", price: 249, label: "Growth", balance: 50000 },
  "4": { name: "POP Pro", account: "$100K", price: 399, label: "Pro", balance: 100000 },
  "5": { name: "POP Elite", account: "$200K", price: 749, label: "Elite", balance: 200000 },
  "6": { name: "POP Titan", account: "$400K", price: 1299, label: "Titan", balance: 400000 },
  "7": { name: "POP Instant", account: "$3M", price: 4999, label: "Instant", balance: 3000000 },
};

type CheckoutStep = "review" | "creating" | "payment" | "waiting" | "success" | "error";

export default function CheckoutPage() {
  const [, params] = useRoute("/checkout/:id");
  const [, navigate] = useLocation();
  const { user, isSignedIn } = useUser();

  const planId = params?.id ?? "1";
  const plan = checkoutPlans[planId] ?? checkoutPlans["1"];

  const [step, setStep] = useState<CheckoutStep>("review");
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const status = search.get("payment_status");
    const challenge = search.get("challenge");

    if (status === "success" && challenge) {
      setChallengeId(parseInt(challenge));
      setStep("success");
    }
  }, []);

  async function handleContinue() {
    if (!isSignedIn || !user) {
      toast.error("Precisas de iniciar sessão para comprar um challenge");
      navigate("/sign-in");
      return;
    }

    setStep("creating");
    setError("");

    try {
      const createRes = await fetch(`${API_URL}/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId,
          planName: plan.name,
          accountSize: plan.account,
          price: plan.price,
          balance: plan.balance,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || "Erro ao criar challenge");
      }

      const { challenge } = await createRes.json();
      setChallengeId(challenge.id);

      const paymentRes = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challengeId: challenge.id,
          amount: plan.price,
          currency: "USD",
          payCurrency: "btc",
        }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json();
        throw new Error(err.error || "Erro ao criar pagamento");
      }

      const { paymentUrl: url } = await paymentRes.json();
      setPaymentUrl(url);
      setStep("payment");
    } catch (err: any) {
      setError(err.message);
      setStep("error");
      toast.error(err.message);
    }
  }

  function openPaymentWindow() {
    if (!paymentUrl) return;
    window.open(paymentUrl, "_blank", "width=800,height=600");
    setStep("waiting");
    startPolling();
  }

  function startPolling() {
    if (!challengeId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/challenges/${challengeId}`, {
          credentials: "include",
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.challenge?.status === "active") {
          clearInterval(interval);
          setStep("success");
          toast.success("Pagamento confirmado! Challenge ativado.");
        }
      } catch {
        // Ignorar erros de polling
      }
    }, 5000);

    setTimeout(() => clearInterval(interval), 600000);
  }

  if (step === "success" && challengeId) {
    return (
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        <main className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-[2rem] border border-green-500/20 bg-card/80 p-12 shadow-2xl text-center">
            <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-400" />
            <h1 className="text-4xl font-black">Pagamento Confirmado! 🎉</h1>
            <p className="mt-4 text-muted-foreground">
              O teu challenge <strong>{plan.name}</strong> foi ativado com sucesso.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href={`/trade/${challengeId}`}>
                <Button className="rounded-2xl bg-primary px-8 py-4 text-lg font-black">
                  Abrir Terminal de Trading
                </Button>
              </Link>
              <Link href="/terminal">
                <Button variant="outline" className="rounded-2xl px-8 py-4 text-lg font-bold">
                  Área do Trader
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === "payment" && paymentUrl) {
    return (
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        <main className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-[2rem] border border-primary/20 bg-card/80 p-12 shadow-2xl text-center">
            <h1 className="text-3xl font-black">Pagamento Crypto</h1>
            <p className="mt-4 text-muted-foreground">
              Clica no botão abaixo para abrir a página de pagamento segura da NOWPayments.
            </p>
            <div className="mt-8">
              <Button onClick={openPaymentWindow} className="rounded-2xl bg-primary px-8 py-4 text-lg font-black">
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir Página de Pagamento
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Após completares o pagamento, volta a esta página ou espera pela confirmação automática.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        <main className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-[2rem] border border-yellow-500/20 bg-card/80 p-12 shadow-2xl text-center">
            <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-yellow-400" />
            <h1 className="text-3xl font-black">A aguardar confirmação...</h1>
            <p className="mt-4 text-muted-foreground">
              Estamos a verificar o teu pagamento. Isto pode levar alguns minutos.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Não fecha esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        <main className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-[2rem] border border-red-500/20 bg-card/80 p-12 shadow-2xl text-center">
            <AlertCircle className="mx-auto mb-6 h-12 w-12 text-red-400" />
            <h1 className="text-3xl font-black">Erro no Processamento</h1>
            <p className="mt-4 text-red-400">{error}</p>
            <div className="mt-8">
              <Button onClick={() => setStep("review")} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative mx-auto max-w-6xl px-6 py-8 md:py-12">
        <Link href="/challenges" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Voltar aos desafios
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur md:p-9">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
              Checkout QuantFund
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Confirma o teu desafio
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Revê o plano escolhido e prepara-te para iniciar a tua avaliação de trading.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-border bg-background/50 p-5">
                <h3 className="font-bold text-lg mb-3">Condições do Challenge</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Fase única — atinge 10% de lucro para passar</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Máximo drawdown: 10% do capital inicial</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Mínimo 2 dias de trading</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Pagamento via crypto (BTC, ETH, USDT, etc.)</li>
                </ul>
              </div>

              {!isSignedIn && (
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                  <p className="text-sm text-yellow-200">
                    Precisas de <Link href="/sign-in" className="underline font-bold">iniciar sessão</Link> para comprar um challenge.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-primary/20 bg-card/90 p-6 shadow-2xl backdrop-blur md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Resumo</p>
            <h2 className="mt-1 text-2xl font-black">{plan.name}</h2>

            <div className="mt-5 rounded-3xl border border-border bg-background/70 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3"><span className="text-muted-foreground">Desafio</span><strong>{plan.account}</strong></div>
              <div className="flex items-center justify-between border-b border-border pb-3"><span className="text-muted-foreground">Tipo</span><strong>1 fase</strong></div>
              <div className="flex items-center justify-between border-b border-border pb-3"><span className="text-muted-foreground">Capital</span><strong>${plan.balance.toLocaleString("en-US")}</strong></div>
              <div className="flex items-end justify-between pt-2"><span className="text-muted-foreground">Total</span><strong className="text-4xl font-black">${plan.price}</strong></div>
            </div>

            <Button onClick={handleContinue} disabled={step === "creating"} className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-black text-primary-foreground shadow-xl hover:bg-primary/90">
              {step === "creating" ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />A criar challenge...</span>
              ) : (
                "Continuar para Pagamento"
              )}
            </Button>

            <p className="mt-4 text-xs text-center text-muted-foreground">Pagamento seguro via NOWPayments. Crypto aceite.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
