import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Trophy, Zap, BadgeCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">QuantFund</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it Works</a>
            <a href="#plans" className="text-sm text-muted-foreground hover:text-foreground">Challenges</a>
            <a href="#leaderboard" className="text-sm text-muted-foreground hover:text-foreground">Leaderboard</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="text-sm">Get Funded</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <Zap className="w-4 h-4" /> The Elite Trading Terminal
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Prove your edge. <br />
              <span className="text-primary">Trade up to $3M.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Pass our evaluation and get funded. Keep up to 90% of your profits with institutional-grade trading conditions and simulated liquidity.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Zero fees
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> No hidden costs
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Instant account activation
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" /> Keep up to 90% profits
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-8 h-14 w-full sm:w-auto">
                  Start Challenge <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-base px-8 h-14 w-full sm:w-auto">
                  Access Terminal
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Built for Professionals</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-background rounded-2xl border border-border">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Advanced Terminal</h3>
                <p className="text-muted-foreground">Trade directly from our webtrader powered by Lightweight Charts. Fast execution, no slippage.</p>
              </div>
              <div className="p-6 bg-background rounded-2xl border border-border">
                <ShieldCheck className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Clear Rules</h3>
                <p className="text-muted-foreground">No hidden spread markups or tricky rules. Simple drawdown limits and profit targets.</p>
              </div>
              <div className="p-6 bg-background rounded-2xl border border-border">
                <Trophy className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fast Payouts</h3>
                <p className="text-muted-foreground">Request payouts bi-weekly once funded via Crypto or Wire Transfer.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-6 h-6 opacity-50 grayscale" />
            <span className="text-lg font-bold opacity-50">QuantFund</span>
          </div>
          <p className="text-sm max-w-xl mx-auto">
            QuantFund is a simulated trading platform. All trading is performed in a simulated environment and does not involve real market execution.
          </p>
          <p className="text-xs mt-6 opacity-50">&copy; {new Date().getFullYear()} QuantFund. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
