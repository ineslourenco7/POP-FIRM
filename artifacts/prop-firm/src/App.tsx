import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, Link, useRoute } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { CheckCircle, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Challenges from "@/pages/challenges";
import Terms from "@/pages/terms";
import Support from "@/pages/support";
import TopBar from "@/components/TopBar";
import SupportChat from "@/components/SupportChat";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appVersion = "checkout-design-2026-05-25";

const checkoutPlans: Record<string, { name: string; account: string; price: number; label: string }> = {
  "1": { name: "POP Starter", account: "$25K", price: 149, label: "Ideal para começar" },
  "2": { name: "POP Pro", account: "$100K", price: 399, label: "Mais escolhido" },
};

function PublicChallengesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-app-version={appVersion}>
      <TopBar backHref="/" backLabel="Início" />
      <Challenges />
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/challenges" />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/challenges" />
    </div>
  );
}

function CheckoutPage() {
  const [, params] = useRoute("/checkout/:id");
  const plan = checkoutPlans[params?.id ?? "1"] ?? checkoutPlans["1"];

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_35%)]" />

      <main className="relative mx-auto max-w-6xl px-6 py-8 md:py-12">
        <Link href="/challenges" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos desafios
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur md:p-9">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Checkout POP FIRM
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Confirma o teu desafio antes de avançar
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Revê o plano escolhido, as condições principais e prepara a tua conta para iniciar a avaliação.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">Conta</p>
                <p className="mt-1 text-2xl font-black">{plan.account}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">Fase</p>
                <p className="mt-1 text-2xl font-black">1</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">Lucros</p>
                <p className="mt-1 text-2xl font-black">até 90%</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {[
                "Pagamento único, sem mensalidades",
                "Regras simples e transparentes",
                "Acesso ao desafio após confirmação",
                "Suporte POP FIRM disponível",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-4">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-primary/20 bg-card/90 p-6 shadow-2xl backdrop-blur md:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Resumo</p>
                <h2 className="mt-1 text-2xl font-black">{plan.name}</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{plan.label}</span>
            </div>

            <div className="rounded-3xl border border-border bg-background/70 p-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-muted-foreground">Desafio</span>
                <strong>{plan.account}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-border py-4">
                <span className="text-muted-foreground">Tipo</span>
                <strong>1 fase</strong>
              </div>
              <div className="flex items-end justify-between pt-5">
                <span className="text-muted-foreground">Total</span>
                <strong className="text-4xl font-black">${plan.price}</strong>
              </div>
            </div>

            <button className="mt-6 h-13 w-full rounded-2xl bg-primary px-6 py-4 text-base font-black text-primary-foreground shadow-xl transition hover:scale-[1.01] hover:opacity-90">
              Continuar
            </button>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <Shield className="h-5 w-5 shrink-0" />
              <p>Checkout preparado para ligar Stripe ou outro processador no próximo passo.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div data-app-version={appVersion}>
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/demo" component={Demo} />
              <Route path="/challenges" component={PublicChallengesPage} />
              <Route path="/checkout/:id" component={CheckoutPage} />
              <Route path="/terms" component={Terms} />
              <Route path="/support" component={Support} />
              <Route path="/sign-in" component={SignInPage} />
              <Route path="/sign-up" component={SignUpPage} />
              <Route>
                <div className="flex min-h-screen items-center justify-center text-muted-foreground bg-background">
                  Página não encontrada
                </div>
              </Route>
            </Switch>
            <SupportChat />
            <Toaster />
            <SonnerToaster position="bottom-right" theme="dark" richColors />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
