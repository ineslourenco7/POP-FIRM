import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter } from "wouter";
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

function PublicChallengesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar backHref="/" backLabel="Início" />
      <Challenges />
    </div>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/demo" component={Demo} />
            <Route path="/challenges" component={PublicChallengesPage} />
            <Route path="/terms" component={Terms} />
            <Route path="/support" component={Support} />
            <Route>
              <div className="flex min-h-screen items-center justify-center text-muted-foreground bg-background">
                Página não encontrada
              </div>
            </Route>
          </Switch>
          <SupportChat />
          <Toaster />
          <SonnerToaster position="bottom-right" theme="dark" richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
