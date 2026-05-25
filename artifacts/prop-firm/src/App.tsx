import { useState } from "react";
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
const appVersion = "terminal-watchlist-2026-05-25";
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

const assets = [
  { label: "XAU/USD", name: "Gold", value: "OANDA:XAUUSD", price: "2,356.40", change: "+0.82%", category: "Metals" },
  { label: "BTC/USD", name: "Bitcoin", value: "BITSTAMP:BTCUSD", price: "67,420.00", change: "+1.94%", category: "Crypto" },
  { label: "ETH/USD", name: "Ethereum", value: "BITSTAMP:ETHUSD", price: "3,520.80", change: "+1.21%", category: "Crypto" },
  { label: "EUR/USD", name: "Euro Dollar", value: "OANDA:EURUSD", price: "1.0842", change: "+0.14%", category: "Forex" },
  { label: "GBP/USD", name: "Pound Dollar", value: "OANDA:GBPUSD", price: "1.2710", change: "-0.08%", category: "Forex" },
  { label: "USD/JPY", name: "Dollar Yen", value: "OANDA:USDJPY", price: "156.82", change: "+0.22%", category: "Forex" },
  { label: "USD/CHF", name: "Dollar Franc", value: "OANDA:USDCHF", price: "0.9124", change: "-0.11%", category: "Forex" },
  { label: "AUD/USD", name: "Aussie Dollar", value: "OANDA:AUDUSD", price: "0.6631", change: "+0.05%", category: "Forex" },
  { label: "NAS100", name: "Nasdaq 100", value: "OANDA:NAS100USD", price: "18,724.2", change: "+0.64%", category: "Indices" },
  { label: "US30", name: "Dow Jones", value: "OANDA:US30USD", price: "39,128.6", change: "-0.18%", category: "Indices" },
  { label: "SPX500", name: "S&P 500", value: "OANDA:SPX500USD", price: "5,304.1", change: "+0.31%", category: "Indices" },
  { label: "USOIL", name: "WTI Crude", value: "TVC:USOIL", price: "78.42", change: "+0.47%", category: "Commodities" },
];

function TradingViewChart({ symbol }: { symbol: string }) {
  const params = new URLSearchParams({
    symbol,
    interval: "60",
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    withdateranges: "1",
    hide_side_toolbar: "0",
    allow_symbol_change: "1",
    save_image: "0",
    details: "1",
    hotlist: "0",
    calendar: "0",
    studies: "[]",
    locale: "en",
  });

  return (
    <iframe
      title="TradingView Chart"
      src={`https://s.tradingview.com/widgetembed/?${params.toString()}`}
      className="h-full w-full border-0"
      allowFullScreen
    />
  );
}

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
    { icon: Activity, label: "Terminal", value: "TradingView", sub: "gráfico ligado" },
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
            <h2 className="text-xl font-black">Abrir terminal</h2>
            <p className="mt-2 text-sm text-muted-foreground">Testa a experiência pós-login com TradingView.</p>
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
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [lotSize, setLotSize] = useState("0.10");
  const [lastAction, setLastAction] = useState("Nenhuma ordem enviada nesta sessão.");

  const openPositions = [
    { symbol: "EURUSD", side: "BUY", lots: "0.20", entry: "1.0812", pnl: "+$420" },
    { symbol: "BTCUSD", side: "BUY", lots: "0.03", entry: "66,110", pnl: "+$312" },
    { symbol: "XAUUSD", side: "BUY", lots: "0.10", entry: "2,341", pnl: "-$95" },
  ];

  const sendOrder = (side: "BUY" | "SELL") => {
    setLastAction(`${side} ${lotSize} lot em ${selectedAsset.label} enviado em modo demo.`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">POP FIRM Terminal</p>
            <h1 className="text-2xl font-black">Trading Terminal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-6 py-8">
        <section className="grid gap-4 md:grid-cols-5">
          {[
            ["Saldo", "$100,000.00"],
            ["Equity", "$102,840.00"],
            ["Margem usada", "$1,240.00"],
            ["Margem livre", "$101,600.00"],
            ["Drawdown", "0.9%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-xl">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-black">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.42fr_1.1fr_0.48fr]">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Mercados</p>
                <h2 className="text-xl font-black">Ativos</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">Live</span>
            </div>
            <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {assets.map((asset) => {
                const active = asset.value === selectedAsset.value;
                const positive = asset.change.startsWith("+");
                return (
                  <button
                    key={asset.value}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:bg-background/70"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">{asset.label}</p>
                        <p className="text-[11px] text-muted-foreground">{asset.name} · {asset.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{asset.price}</p>
                        <p className={`text-xs font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>{asset.change}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessão</p>
                <p className="font-bold">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedAsset.value}
                  onChange={(event) => setSelectedAsset(assets.find((asset) => asset.value === event.target.value) ?? assets[0])}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold outline-none"
                >
                  {assets.map((asset) => (
                    <option key={asset.value} value={asset.value}>{asset.label}</option>
                  ))}
                </select>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">TradingView Online</span>
              </div>
            </div>
            <div className="h-[620px] overflow-hidden rounded-2xl border border-border bg-background">
              <TradingViewChart symbol={selectedAsset.value} />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Nova ordem</p>
              <h2 className="mt-1 text-2xl font-black">{selectedAsset.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Preço indicativo: <strong className="text-foreground">{selectedAsset.price}</strong></p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Lot size</label>
                  <input
                    value={lotSize}
                    onChange={(event) => setLotSize(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <div className="mt-1 rounded-xl border border-border bg-background px-3 py-3 text-sm font-bold">Market</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => sendOrder("BUY")} className="rounded-2xl bg-emerald-500 px-4 py-4 font-black text-white shadow-lg hover:bg-emerald-400">BUY</button>
                <button onClick={() => sendOrder("SELL")} className="rounded-2xl bg-red-500 px-4 py-4 font-black text-white shadow-lg hover:bg-red-400">SELL</button>
              </div>

              <p className="mt-4 rounded-2xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">{lastAction}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
              <Wallet className="mb-3 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Conta POP Demo</p>
              <p className="text-4xl font-black">$102,840</p>
              <p className="mt-1 text-sm text-emerald-400">+$2,840 lucro aberto</p>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Posições abertas</h2>
            <span className="text-xs text-muted-foreground">Modo demo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-3">Ativo</th>
                  <th>Lado</th>
                  <th>Lotes</th>
                  <th>Entrada</th>
                  <th className="text-right">P/L</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map((position) => (
                  <tr key={position.symbol} className="border-t border-border">
                    <td className="py-4 font-bold">{position.symbol}</td>
                    <td className={position.side === "BUY" ? "font-bold text-emerald-400" : "font-bold text-red-400"}>{position.side}</td>
                    <td>{position.lots}</td>
                    <td>{position.entry}</td>
                    <td className={`text-right font-black ${position.pnl.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}>{position.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
