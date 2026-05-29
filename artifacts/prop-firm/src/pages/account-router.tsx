import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type AccountData = {
  id: number;
  status: string;
};

export default function AccountRouterPage() {
  const [, navigate] = useLocation();

  const { data: accounts, isLoading, isError } = useQuery<AccountData[]>({
    queryKey: ["accounts", "post-login-router"],
    queryFn: async () => {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return res.json();
    },
    retry: 1,
  });

  useEffect(() => {
    if (isLoading) return;

    if (isError) {
      navigate("/welcome", { replace: true });
      return;
    }

    const activeAccount = accounts?.find((account) => account.status === "active");

    if (activeAccount) {
      navigate("/terminal", { replace: true });
    } else {
      navigate("/welcome", { replace: true });
    }
  }, [accounts, isLoading, isError, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-2xl">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-semibold">A preparar a tua área...</span>
      </div>
    </div>
  );
}
