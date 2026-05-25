import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
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
const appVersion = "checkout-route-2026-05-25";

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
  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <Link href="/challenges" className="text-sm text-muted-foreground hover:text-foreground">
          Voltar aos desafios
        </Link>
        <h1 className="mt-8 text-4xl font-black">Checkout POP FIRM</h1>
        <p className="mt-3 text-muted-foreground">Esta página já está ligada ao botão Começar Agora.</p>
        <div className="mt-8 rounded-2xl border border-border bg-background/60 p-6">
          <p className="text-sm text-muted-foreground">Próximo passo</p>
          <p className="text-2xl font-bold">Ligar Stripe ou outro método de pagamento</p>
        </div>
      </div>
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
