import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, Link, useRoute } from "wouter";
import { SignIn, SignUp, useUser, UserButton } from "@clerk/react";
import { CheckCircle, Shield, Sparkles, ArrowLeft, Lock, BarChart3, Users, CreditCard, Activity, TrendingUp, Wallet } from "lucide-react";
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
const appVersion = "admin-terminal-2026-05-25";
const adminEmail = "ineslourencop7" + "@" + "gmail.com";

const checkoutPlans: Record<string, { name: string; account: string; price: number; label: string }> = {
  "1": { name: "POP Launch", account: "$10K", price: 99, label: "Starter" },
  "2": { name: "POP Starter", account: "$25K", price: 149, label: "Popular" },
  "3": { name: "POP Growth", account: "$50K", price: 249, label: "Growth" },
  "4": { name: "POP Pro", account: "$100K", price: 399, label: "Pro" },
  "5": { name: "POP Elite", account: "$200K", price: 749, label: "Elite" },
  "6": { name: "POP Titan", account: "$400K", price: 1299, label: "Titan" },
  "7": { name: "POP Instant", account: "$3M", price: 4999, label: "Instant" },
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
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/terminal" />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/terminal" />
    </div>
  );
}

function RequireLogin({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">A carregar sessão...</div>;

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <Lock className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="mb-2 text-3xl font-black">Login necessário</h1>
          <p className="mb-6 text-sm text-muted-foreground">Inicia sessão para aceder ao terminal POP FIRM.</p>
          <Link href="/sign-in" className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Entrar</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const allowed = isSignedIn && email === adminEmail;

  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">A validar admin...</div>;

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
          <Shield className="mx-auto mb-4 h-10 w-10 text-red-400" />
          <h1 className="mb-2 text-3xl font-black">Acesso admin bloqueado</h1>
          <p className="mb-6 text-sm text-muted-foreground">Entra com o email autorizado para gerir a POP FIRM.</p>
          <Link href="/sign-in" className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Entrar com admin</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminPage() {
  const { user } = useUser();
  const cards = [
    { icon: Users, label: "Utilizadores", value: "128", sub: "clientes registados" },
    { icon: CreditCard, label: "Compras", value: "$18.4K", sub: "volume demo" },
    { icon: BarChart3, label: "Challenges", value: "7", sub: "tiers ativos" },
    { icon: Activity, label: "Terminal", value: "Online", sub: "demo funcional" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Admin</p>
            <h1 className="text-2xl font-black">Painel de Administração</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-primary/20 bg-primary/5 p-6">
          <p className="text-sm text-muted-foreground">Admin ativo</p>
          <p className="text-xl font-bold">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-6 shadow-xl">
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-3xl font-black">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Link href="/terminal" className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 transition hover:bg-emerald-500/15">
            <h2 className="text-xl font-black">Abrir terminal demo</h2>
            <p className="mt-2 text-sm text-muted-foreground">Testa a experiência que o cliente vê depois do login.</p>
          </Link>
          <Link href="/challenges" className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6 transition hover:bg-blue-500/15">
            <h2 className="text-xl font-black">Ver challenges</h2>
            <p className="mt-2 text-sm text-muted-foreground">Confirma preços, tiers e checkout.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

function TradingTerminalPage() {
  const { user } = useUser();
  const trades = [
    ["EURUSD", "BUY", "+$420", "+1.4%"],
    ["NAS100", "SELL", "+$180", "+0.6%"],
    ["XAUUSD", "BUY", "-$95", "-0.3%"],
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Terminal</p>
            <h1 className="text-2xl font-black">Trading Terminal Demo</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-5 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sessão</p>
              <p className="font-bold">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">Terminal Online</span>
          </div>
          <div className="h-80 rounded-2xl border border-border bg-background/70 p-5">
            <div className="flex h-full items-end gap-2">
              {[35, 52, 45, 70, 64, 82, 75, 90, 84, 96, 88, 104].map((height, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-primary/70" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
            <Wallet className="mb-3 h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">Equity demo</p>
            <p className="text-4xl font-black">$102,840</p>
            <p className="mt-1 text-sm text-emerald-400">+$2,840 lucro</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
            <TrendingUp className="mb-3 h-6 w-6 text-primary" />
            <p className="mb-4 text-lg font-black">Trades recentes</p>
            <div className="space-y-3">
              {trades.map(([symbol, side, pnl, pct]) => (
                <div key={symbol} className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-3 text-sm">
                  <div><strong>{symbol}</strong><p className="text-xs text-muted-foreground">{side}</p></div>
                  <div className="text-right"><strong className={pnl.startsWith("-") ? "text-red-400" : "text-emerald-400"}>{pnl}</strong><p className="text-xs text-muted-foreground">{pct}</p></div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
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
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">Confirma o teu desafio antes de avançar</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Revê o plano escolhido, as condições principais e prepara a tua conta para iniciar a avaliação.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Conta</p><p className="mt-1 text-2xl font-black">{plan.account}</p></div>
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Fase</p><p className="mt-1 text-2xl font-black">1</p></div>
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Lucros</p><p className="mt-1 text-2xl font-black">até 90%</p></div>
            </div>
          </section>
          <aside className="rounded-[2rem] border border-primary/20 bg-card/90 p-6 shadow-2xl backdrop-blur md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Resumo</p>
            <h2 className="mt-1 text-2xl font-black">{plan.name}</h2>
            <div className="mt-5 rounded-3xl border border-border bg-background/70 p-5">
              <div className="flex items-center justify-between border-b border-border pb-4"><span className="text-muted-foreground">Desafio</span><strong>{plan.account}</strong></div>
              <div className="flex items-center justify-between border-b border-border py-4"><span className="text-muted-foreground">Tipo</span><strong>1 fase</strong></div>
              <div className="flex items-end justify-between pt-5"><span className="text-muted-foreground">Total</span><strong className="text-4xl font-black">${plan.price}</strong></div>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-black text-primary-foreground shadow-xl">Continuar</button>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"><Shield className="h-5 w-5 shrink-0" /><p>Checkout preparado para ligar Stripe ou outro processador no próximo passo.</p></div>
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
              <Route path="/terminal"><RequireLogin><TradingTerminalPage /></RequireLogin></Route>
              <Route path="/admin"><RequireAdmin><AdminPage /></RequireAdmin></Route>
              <Route path="/terms" component={Terms} />
              <Route path="/support" component={Support} />
              <Route path="/sign-in" component={SignInPage} />
              <Route path="/sign-up" component={SignUpPage} />
              <Route>
                <div className="flex min-h-screen items-center justify-center text-muted-foreground bg-background">Página não encontrada</div>
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
