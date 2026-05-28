import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { SignIn, SignUp, useUser } from "@clerk/react";
import { Lock, Shield } from "lucide-react";
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
import CheckoutPage from "@/pages/checkout";
import TerminalFullPage from "@/pages/terminal-full";
import SupportChat from "@/components/SupportChat";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appVersion = "quantfund-terminal-hotfix-2026-05-28";
const adminEmail = "ineslourencop7" + "@" + "gmail.com";

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

function NotFoundPage() {
  return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Página não encontrada</div>;
}

function App() {
  return <WouterRouter base={basePath}><QueryClientProvider client={queryClient}><TooltipProvider><div data-app-version={appVersion}><Switch><Route path="/" component={Landing} /><Route path="/demo" component={Demo} /><Route path="/challenges" component={Challenges} /><Route path="/terms" component={Terms} /><Route path="/support" component={Support} /><Route path="/sign-in/:rest*" component={SignInPage} /><Route path="/sign-in" component={SignInPage} /><Route path="/sign-up/:rest*" component={SignUpPage} /><Route path="/sign-up" component={SignUpPage} /><Route path="/checkout/:id"><RequireLogin><CheckoutPage /></RequireLogin></Route><Route path="/terminal"><RequireLogin><TerminalFullPage /></RequireLogin></Route><Route path="/trade/:accountId"><RequireLogin><Trade /></RequireLogin></Route><Route path="/admin"><RequireAdmin><AdminDashboard /></RequireAdmin></Route><Route component={NotFoundPage} /></Switch><SupportChat /><Toaster /><SonnerToaster position="bottom-right" theme="dark" richColors /></div></TooltipProvider></QueryClientProvider></WouterRouter>;
}

export default App;
