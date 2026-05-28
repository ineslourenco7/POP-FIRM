import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const checkoutPlans: Record<string, { name: string; account: string; price: number; label: string }> = {
  "1": { name: "POP Launch", account: "$10K", price: 99, label: "Starter" },
  "2": { name: "POP Starter", account: "$25K", price: 149, label: "Popular" },
  "3": { name: "POP Growth", account: "$50K", price: 249, label: "Growth" },
  "4": { name: "POP Pro", account: "$100K", price: 399, label: "Pro" },
  "5": { name: "POP Elite", account: "$200K", price: 749, label: "Elite" },
  "6": { name: "POP Titan", account: "$400K", price: 1299, label: "Titan" },
  "7": { name: "POP Instant", account: "$3M", price: 4999, label: "Instant" },
};

type LocalChallenge = {
  id: string;
  user_id: string;
  user_email?: string;
  plan_id: string;
  plan_name: string;
  account_size: number;
  price: number;
  status: string;
  balance: number;
  equity: number;
  created_at: string;
};

function accountToNumber(account: string) {
  const text = account.toUpperCase();
  const value = Number(text.replace(/[^0-9.]/g, ""));
  if (text.includes("M")) return value * 1000000;
  if (text.includes("K")) return value * 1000;
  return value;
}

function getLocalChallenges(): LocalChallenge[] {
  try {
    return JSON.parse(localStorage.getItem("quantfund_challenges") || "[]") as LocalChallenge[];
  } catch {
    return [];
  }
}

function saveLocalChallenge(challenge: LocalChallenge) {
  const existing = getLocalChallenges().filter((item) => item.id !== challenge.id);
  localStorage.setItem("quantfund_challenges", JSON.stringify([challenge, ...existing]));
  localStorage.setItem(`quantfund_challenge_${challenge.id}`, JSON.stringify(challenge));
}

export default function CheckoutPage() {
  const [, params] = useRoute("/checkout/:id");
  const [, navigate] = useLocation();
  const { user, isSignedIn } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const planId = params?.id ?? "1";
  const plan = checkoutPlans[planId] ?? checkoutPlans["1"];

  async function createChallenge() {
    if (!user?.id) throw new Error("Sessão inválida.");
    const accountSize = accountToNumber(plan.account);
    const fallbackId = `${planId}-${Date.now()}`;
    const payload = {
      user_id: user.id,
      user_email: user.primaryEmailAddress?.emailAddress ?? "",
      plan_id: planId,
      plan_name: plan.name,
      account_size: accountSize,
      price: plan.price,
      status: "pending_payment",
      balance: accountSize,
      equity: accountSize,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from("challenges").insert(payload).select().single();
      if (!error && data?.id) {
        const challenge = { id: String(data.id), ...payload };
        saveLocalChallenge(challenge);
        return challenge;
      }
      console.warn("Supabase insert failed; using local fallback", error);
    }

    const challenge = { id: fallbackId, ...payload };
    saveLocalChallenge(challenge);
    return challenge;
  }

  async function createInvoice(challengeId: string) {
    const response = await fetch("/api/payments/crypto-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, challengeId, price: plan.price, planName: plan.name }),
    });

    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.invoice_url || data?.invoiceUrl || data?.payment_url || data?.paymentUrl || null;
  }

  async function handleContinue() {
    if (!isSignedIn || !user?.id) {
      navigate("/sign-in");
      return;
    }

    setIsProcessing(true);
    try {
      const challenge = await createChallenge();
      sessionStorage.setItem("quantfund_pending_challenge_id", challenge.id);
      const invoiceUrl = await createInvoice(challenge.id);
      toast.success("Challenge criado", { description: invoiceUrl ? "A abrir pagamento cripto." : "Invoice indisponível. Usa o checkout cripto." });
      if (invoiceUrl) window.location.href = invoiceUrl;
      else navigate(`/crypto-checkout.html?plan=${planId}&challenge=${challenge.id}`);
    } catch (error) {
      toast.error("Erro ao iniciar pagamento", { description: error instanceof Error ? error.message : "Tenta novamente." });
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative mx-auto max-w-6xl px-6 py-8 md:py-12">
        <Link href="/challenges" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Voltar aos desafios
        </Link>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur md:p-9">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">Checkout QuantFund</div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">Confirma o teu desafio antes de avançar</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Criamos a challenge em modo pendente e seguimos para o pagamento cripto. Após confirmação, o terminal fica ativo.</p>
          </section>
          <aside className="rounded-[2rem] border border-primary/20 bg-card/90 p-6 shadow-2xl backdrop-blur md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Resumo</p>
            <h2 className="mt-1 text-2xl font-black">{plan.name}</h2>
            <div className="mt-5 rounded-3xl border border-border bg-background/70 p-5">
              <div className="flex items-center justify-between border-b border-border pb-4"><span className="text-muted-foreground">Desafio</span><strong>{plan.account}</strong></div>
              <div className="flex items-center justify-between border-b border-border py-4"><span className="text-muted-foreground">Tipo</span><strong>1 fase</strong></div>
              <div className="flex items-end justify-between pt-5"><span className="text-muted-foreground">Total</span><strong className="text-4xl font-black">${plan.price}</strong></div>
            </div>
            <button onClick={handleContinue} disabled={isProcessing} className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-black text-primary-foreground shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
              {isProcessing ? "A processar..." : "Continuar para pagamento"}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
