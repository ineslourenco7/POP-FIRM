import { Link } from "wouter";
import { LayoutDashboard } from "lucide-react";

interface TopBarProps {
  backHref?: string;
  backLabel?: string;
  title?: string;
  right?: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function TopBar({
  backHref = "/dashboard",
  backLabel = "Menu",
  title,
  right,
  className = "",
  dark = false,
}: TopBarProps) {
  const bg = dark
    ? "bg-[#0a0e1a] border-[#1e2a3a]"
    : "bg-background/80 backdrop-blur-sm border-border";

  return (
    <header className={`h-14 border-b sticky top-0 z-50 flex items-center px-4 justify-between shrink-0 ${bg} ${className}`}>
      {/* Left: logo + back */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="QuantFund"
            className="w-7 h-7"
          />
          <span className="font-bold text-base tracking-tight hidden sm:block">QuantFund</span>
        </Link>

        {/* Separator */}
        <span className="text-muted-foreground/30 select-none">|</span>

        {/* Back to menu */}
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Center: optional title */}
      {title && (
        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground pointer-events-none">
          {title}
        </span>
      )}

      {/* Right: optional slot */}
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
