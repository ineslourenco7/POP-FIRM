import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, Link, useRoute } from "wouter";
import { SignIn, SignUp, useUser, UserButton } from "@clerk/react";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Challenges from "@/pages/challenges";
import Trade from "@/pages/trade";
import Terms from "@/pages/terms";
import Support from "@/pages/support";
import AdminDashboard from "@/pages/admin-dashboard";
import TopBar from "@/components/TopBar";
import SupportChat from "@/components/SupportChat";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appVersion = "quantfund-trade-route-2026-05-28";
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
  return <div className="min-h-screen bg-background text-foreground" data-app-version={appVersion}><TopBar backHref="/" backLabel="Início" /><Challenges /></div>;
}

function SignInPage() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/terminal" /></div>;
}

function SignUpPage() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/terminal" /></div>;
}

function RequireLogin({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">A carregar sessão...</div>;
  if (!isSignedIn) return <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"><div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"><Lock className="mx-auto mb-4 h-10 w-10 text-primary" /><h1 className="mb-2 text-3xl font-black">Login necessário</h1><p className="mb-6 text-sm text-muted-foreground">Inicia sessão para aceder ao terminal QuantFund.</p><Link href="/sign-in" className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Entrar</Link></div></div>;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const allowed = isSignedIn && email === adminEmail;
  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">A validar admin...</div>;
  if (!allowed) return <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"><div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl"><Shield className="mx-auto mb-4 h-10 w-10 text-red-400" /><h1 className="mb-2 text-3xl font-black">Acesso admin bloqueado</h1><p className="mb-6 text-sm text-muted-foreground">Entra com o email autorizado para gerir a QuantFund.</p><Link href="/sign-in" className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Entrar com admin</Link></div></div>;
  return <>{children}</>;
}

function TradingTerminalPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const isAdmin = email === adminEmail;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.25em] text-primary">QuantFund Terminal</p><h1 className="text-xl font-black md:text-2xl">Área do Trader</h1></div>
          <div className="flex items-center gap-4"><div className="hidden text-right md:block"><p className="text-xs text-muted-foreground">Conta</p><p className="text-sm font-bold">{email}</p></div>{isAdmin && <Link href="/trade/1" className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground">Trading Admin</Link>}<Link href="/challenges" className="text-sm text-muted-foreground hover:text-foreground">Desafios</Link><UserButton afterSignOutUrl="/" /></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Bem-vindo à QuantFund</p>
          <h2 className="mt-2 text-4xl font-black">A tua jornada funded começa agora 🚀</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">Explora os desafios, escolhe o teu capital e mostra ao mercado o que consegues fazer.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/challenges" className="inline-flex rounded-2xl bg-primary px-6 py-4 font-black text-primary-foreground">Ver desafios</Link>{isAdmin && <Link href="/trade/1" className="inline-flex rounded-2xl border border-primary/30 px-6 py-4 font-black text-primary">Abrir trading terminal</Link>}</div>
        </div>
      </main>
    </div>
  );
}

function CheckoutPage() {
  const [, params] = useRoute("/checkout/:id");
  const plan = checkoutPlans[params?.id ?? "1"] ?? checkoutPlans["1"];
  return <div className="min-h-screen overflow-hidden bg-background text-foreground"><main className="relative mx-auto max-w-6xl px-6 py-8 md:py-12"><Link href="/challenges" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar aos desafios</Link><div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><section className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur md:p-9"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">Checkout QuantFund</div><h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">Confirma o teu desafio antes de avançar</h1><p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Revê o plano escolhido, as condições principais e prepara a tua conta para iniciar a avaliação.</p></section><aside className="rounded-[2rem] border border-primary/20 bg-card/90 p-6 shadow-2xl backdrop-blur md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Resumo</p><h2 className="mt-1 text-2xl font-black">{plan.name}</h2><div className="mt-5 rounded-3xl border border-border bg-background/70 p-5"><div className="flex items-center justify-between border-b border-border pb-4"><span className="text-muted-foreground">Desafio</span><strong>{plan.account}</strong></div><div className="flex items-center justify-between border-b border-border py-4"><span className="text-muted-foreground">Tipo</span><strong>1 fase</strong></div><div className="flex items-end justify-between pt-5"><span className="text-muted-foreground">Total</span><strong className="text-4xl font-black">${plan.price}</strong></div></div><button className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-black text-primary-foreground shadow-xl">Continuar</button></aside></div></main></div>;
}

function NotFoundPage() { return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Página não encontrada</div>; }

function App() {
  return <WouterRouter base={basePath}><QueryClientProvider client={queryClient}><TooltipProvider><div data-app-version={appVersion}><Switch><Route path="/" component={Landing} /><Route path="/demo" component={Demo} /><Route path="/challenges" component={PublicChallengesPage} /><Route path="/checkout/:id" component={CheckoutPage} /><Route path="/terminal"><RequireLogin><TradingTerminalPage /></RequireLogin></Route><Route path="/trade/:accountId"><RequireLogin><Trade /></RequireLogin></Route><Route path="/admin"><RequireAdmin><AdminDashboard /></RequireAdmin></Route><Route path="/terms" component={Terms} /><Route path="/support" component={Support} /><Route path="/sign-in/:rest*" component={SignInPage} /><Route path="/sign-in" component={SignInPage} /><Route path="/sign-up/:rest*" component={SignUpPage} /><Route path="/sign-up" component={SignUpPage} /><Route component={NotFoundPage} /></Switch><SupportChat /><Toaster /><SonnerToaster position="bottom-right" theme="dark" richColors /></div></TooltipProvider></QueryClientProvider></WouterRouter>;
}

export default App;
