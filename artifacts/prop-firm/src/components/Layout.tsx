import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { Activity, LayoutDashboard, Trophy, Wallet, CreditCard, Shield, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/challenges", label: "Desafios", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: Activity },
    { href: "/payments", label: "Pagamentos", icon: CreditCard },
    { href: "/payouts", label: "Saques", icon: Wallet },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  const handleSignOut = () => {
    signOut(() => {
      window.location.href = import.meta.env.BASE_URL;
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-white">QuantFund</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{user?.fullName || "Trader"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.emailAddresses[0]?.emailAddress}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-6 h-6" />
          <span className="text-lg font-bold">QuantFund</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground mt-4"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pl-0 pt-16 md:pt-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
