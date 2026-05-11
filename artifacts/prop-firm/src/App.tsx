import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Trade from "@/pages/trade";
import Challenges from "@/pages/challenges";
import Checkout from "@/pages/checkout";
import Payments from "@/pages/payments";
import Payouts from "@/pages/payouts";
import Leaderboard from "@/pages/leaderboard";
import Admin from "@/pages/admin";
import Terms from "@/pages/terms";
import Support from "@/pages/support";
import Layout from "@/components/Layout";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(217.2, 91.2%, 59.8%)",
    colorBackground: "hsl(222, 47%, 6%)",
    colorInput: "hsl(217.2, 32.6%, 17.5%)",
    colorInputForeground: "hsl(210, 40%, 98%)",
    colorForeground: "hsl(210, 40%, 98%)",
    colorMutedForeground: "hsl(215, 20.2%, 65.1%)",
    colorNeutral: "hsl(217.2, 32.6%, 17.5%)",
    colorDanger: "hsl(0, 62.8%, 30.6%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-semibold text-2xl",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground text-sm font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-green-500",
    alertText: "text-destructive-foreground",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClientInstance = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClientInstance.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClientInstance]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ElementType, adminOnly?: boolean }) {
  // Normally check user role here if adminOnly is true
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            
            <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/trade/:accountId" component={() => <ProtectedRoute component={Trade} />} />
            <Route path="/challenges" component={() => (
              <>
                <Show when="signed-in">
                  <Layout><Challenges /></Layout>
                </Show>
                <Show when="signed-out">
                  <Challenges />
                </Show>
              </>
            )} />
            <Route path="/checkout/:challengeId" component={() => <ProtectedRoute component={Checkout} />} />
            <Route path="/payments" component={() => <ProtectedRoute component={Payments} />} />
            <Route path="/payouts" component={() => <ProtectedRoute component={Payouts} />} />
            <Route path="/leaderboard" component={() => (
              <>
                <Show when="signed-in">
                  <Layout><Leaderboard /></Layout>
                </Show>
                <Show when="signed-out">
                  <Leaderboard />
                </Show>
              </>
            )} />
            <Route path="/admin" component={() => <ProtectedRoute component={Admin} adminOnly />} />
            <Route path="/terms" component={Terms} />
            <Route path="/support" component={Support} />
            
            <Route>
              <div className="flex min-h-screen items-center justify-center text-muted-foreground bg-background">
                404 - Not Found
              </div>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
