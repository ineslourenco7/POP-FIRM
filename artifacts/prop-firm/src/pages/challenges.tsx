import { useListChallenges } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ShieldAlert } from "lucide-react";

export default function Challenges() {
  const { data: challenges, isLoading } = useListChallenges();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Challenge</h1>
        <p className="text-muted-foreground text-lg">
          Prove your trading skills in our simulated environment. Pass the evaluation to become a funded trader and keep up to 90% of profits.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges?.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden border-border flex flex-col">
              <div className="absolute top-0 right-0 p-4">
                <ShieldAlert className="w-6 h-6 text-primary/20" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className={`font-bold leading-tight block ${plan.accountSize >= 1000000 ? 'text-2xl' : plan.accountSize >= 100000 ? 'text-3xl' : 'text-4xl'}`}>
                    ${plan.accountSize.toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 mt-4">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Check className="w-3 h-3" /></div>
                    <span className="text-sm">Profit Target: <strong>{plan.profitTarget}%</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Check className="w-3 h-3" /></div>
                    <span className="text-sm">Max Daily Loss: <strong>{plan.maxDailyDrawdown}%</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Check className="w-3 h-3" /></div>
                    <span className="text-sm">Max Total Loss: <strong>{plan.maxTotalDrawdown}%</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Check className="w-3 h-3" /></div>
                    <span className="text-sm">Min Trading Days: <strong>{plan.minTradingDays}</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Check className="w-3 h-3" /></div>
                    <span className="text-sm">Leverage: <strong>1:{plan.leverage}</strong></span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-6 border-t border-border mt-auto">
                <div className="w-full flex items-center justify-between">
                  <div className="text-2xl font-bold">${plan.price}</div>
                  <Link href={`/checkout/${plan.id}`}>
                    <Button>Select Plan</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
