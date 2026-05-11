import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetChallenge, useSubmitPayment, getGetChallengeQueryKey, getListMyPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, CreditCard, Bitcoin, Building2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { challengeId } = useParams();
  const id = parseInt(challengeId || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenge, isLoading } = useGetChallenge(id, { query: { enabled: !!id, queryKey: getGetChallengeQueryKey(id) } });
  
  const submitPayment = useSubmitPayment();
  
  const [method, setMethod] = useState("crypto");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!challenge) return;
    
    submitPayment.mutate({
      data: {
        challengeId: challenge.id,
        amount: challenge.price,
        method
      }
    }, {
      onSuccess: () => {
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: getListMyPaymentsQueryKey() });
        toast({
          title: "Payment Submitted",
          description: "Your payment is pending verification.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: "Failed to submit payment.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!challenge) {
    return <div className="p-6 text-center">Challenge not found.</div>;
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-lg mx-auto py-20">
        <Card className="text-center border-border">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Pending</CardTitle>
            <CardDescription>
              We are verifying your payment. Once approved, your account will be provisioned automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm text-left">
              <p><strong>Challenge:</strong> {challenge.name}</p>
              <p><strong>Amount:</strong> ${challenge.price}</p>
              <p><strong>Method:</strong> {method.charAt(0).toUpperCase() + method.slice(1)}</p>
            </div>
            {method === 'crypto' && (
              <div className="p-4 border border-border rounded-lg text-sm">
                <p className="text-muted-foreground mb-2">Please send the exact amount to:</p>
                <code className="block p-2 bg-background rounded border border-border text-xs break-all">
                  0x39a1d82121e428c0b57e79391abf12f0e0df6f15
                </code>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/payments")}>View My Payments</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
                <div className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${method === 'crypto' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setMethod('crypto')}>
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <Bitcoin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Cryptocurrency</div>
                      <div className="text-xs text-muted-foreground">BTC, ETH, USDT</div>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${method === 'bank' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setMethod('bank')}>
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-muted-foreground">Wire / SEPA</div>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${method === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setMethod('card')}>
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Credit Card</div>
                      <div className="text-xs text-muted-foreground">Via Stripe</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{challenge.name}</div>
                  <div className="text-sm text-muted-foreground">${challenge.accountSize.toLocaleString()} Account</div>
                </div>
                <div className="font-semibold">${challenge.price}</div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${challenge.price}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <p>Secure SSL encrypted payment. No hidden fees.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmit}
                disabled={submitPayment.isPending}
              >
                {submitPayment.isPending ? 'Processing...' : `Pay $${challenge.price}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
