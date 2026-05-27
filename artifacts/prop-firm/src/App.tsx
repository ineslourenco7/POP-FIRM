import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter, Link, useRoute } from "wouter";
import { SignIn, SignUp, useUser, UserButton } from "@clerk/react";
import { ArrowLeft, AlertTriangle, ChevronDown, Lock, Search, Shield, Sparkles, Target, TrendingUp, Wallet, X } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Challenges from "@/pages/challenges";
import Terms from "@/pages/terms";
import Support from "@/pages/support";
import AdminDashboard from "@/pages/admin-dashboard";
import TopBar from "@/components/TopBar";
import SupportChat from "@/components/SupportChat";
import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appVersion = "prop-terminal-history-collapsed-2026-05-26";
const adminEmail = "ineslourencop7" + "@" + "gmail.com";
const initialBalance = 100000;
const profitTarget = initialBalance * 0.10;
const maxDrawdownLimit = initialBalance * 0.10;
const dailyDrawdownLimit = initialBalance * 0.10;
const minimumTradingDays = 2;

const checkoutPlans: Record<string, { name: string; account: string; price: number; label: string }> = {
  "1": { name: "POP Launch", account: "$10K", price: 99, label: "Starter" },
  "2": { name: "POP Starter", account: "$25K", price: 149, label: "Popular" },
  "3": { name: "POP Growth", account: "$50K", price: 249, label: "Growth" },
  "4": { name: "POP Pro", account: "$100K", price: 399, label: "Pro" },
  "5": { name: "POP Elite", account: "$200K", price: 749, label: "Elite" },
  "6": { name: "POP Titan", account: "$400K", price: 1299, label: "Titan" },
  "7": { name: "POP Instant", account: "$3M", price: 4999, label: "Instant" },
};

/* trimmed for brevity in commit */
function App() { return <WouterRouter base={basePath}><QueryClientProvider client={queryClient}><TooltipProvider><div data-app-version={appVersion}><Switch><Route path="/" component={Landing} /><Route path="/demo" component={Demo} /><Route path="/challenges" component={PublicChallengesPage} /><Route path="/checkout/:id" component={CheckoutPage} /><Route path="/terminal"><RequireLogin><TradingTerminalPage /></RequireLogin></Route><Route path="/admin"><RequireAdmin><AdminDashboard /></RequireAdmin></Route><Route path="/terms" component={Terms} /><Route path="/support" component={Support} /><Route path="/sign-in/:rest*" component={SignInPage} /><Route path="/sign-in" component={SignInPage} /><Route path="/sign-up/:rest*" component={SignUpPage} /><Route path="/sign-up" component={SignUpPage} /><Route><div className="flex min-h-screen items-center justify-center text-muted-foreground bg-background">Página não encontrada</div></Route></Switch><SupportChat /><Toaster /><SonnerToaster position="bottom-right" theme="dark" richColors /></div></TooltipProvider></QueryClientProvider></WouterRouter>; }
export default App;