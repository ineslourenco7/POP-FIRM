import { useQuery } from "@tanstack/react-query";

type Account = {
  id?: number;
  initialBalance?: number;
  currentBalance?: number;
  equity?: number;
  [key: string]: unknown;
};

export function useAccount(accountId: number) {
  return useQuery<Account>({
    queryKey: ["account", accountId],
    queryFn: async () => {
      const res = await fetch(`/api/accounts/${accountId}`);
      if (!res.ok) throw new Error("Failed to fetch account");
      return res.json();
    },
    enabled: !!accountId,
  });
}
