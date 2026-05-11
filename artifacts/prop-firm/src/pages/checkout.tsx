import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetChallenge, useSubmitPayment, getGetChallengeQueryKey, getListMyPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, CreditCard, Bitcoin, Building2, CheckCircle2, Tag, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const DISCOUNT_CODES: Record<string, number> = {
  LEGEND: 80,
};

export default function Checkout() {
  const { challengeId } = useParams();
  const id = parseInt(challengeId || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenge, isLoading } = useGetChallenge(id, {
    query: { enabled: !!id, queryKey: getGetChallengeQueryKey(id) },
  });

  const submitPayment = useSubmitPayment();

  const [method, setMethod] = useState("crypto");
  const [submitted, setSubmitted] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [codeError, setCodeError] = useState("");

  const basePrice = challenge?.price ?? 0;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = +(basePrice - discountAmount).toFixed(2);

  const handleApplyCode = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    const percent = DISCOUNT_CODES[code];
    if (percent !== undefined) {
      setAppliedCode(code);
      setDiscountPercent(percent);
      setCodeError("");
      toast({
        title: "Código aplicado!",
        description: `Desconto de ${percent}% aplicado com sucesso.`,
      });
    } else {
      setCodeError("Código de desconto inválido.");
      setAppliedCode(null);
      setDiscountPercent(0);
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setDiscountCode("");
    setDiscountPercent(0);
    setCodeError("");
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    submitPayment.mutate(
      {
        data: {
          challengeId: challenge.id,
          amount: finalPrice,
          method,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          queryClient.invalidateQueries({ queryKey: getListMyPaymentsQueryKey() });
          toast({
            title: "Pagamento Submetido",
            description: "O seu pagamento está a aguardar verificação.",
          });
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Falha ao submeter pagamento.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return <div className="p-6 text-center">Desafio não encontrado.</div>;
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-lg mx-auto py-20">
        <Card className="text-center border-border">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
            <CardDescription>
              Estamos a verificar o seu pagamento. Quando aprovado, a sua conta será criada automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-1">
              <p><strong>Desafio:</strong> {challenge.name}</p>
              {discountPercent > 0 && (
                <p><strong>Desconto ({appliedCode}):</strong> -{discountPercent}%</p>
              )}
              <p><strong>Valor:</strong> ${finalPrice}</p>
              <p><strong>Método:</strong> {method.charAt(0).toUpperCase() + method.slice(1)}</p>
            </div>
            {method === "crypto" && (
              <div className="p-4 border border-border rounded-lg text-sm">
                <p className="text-muted-foreground mb-2">Envie o valor exato para:</p>
                <code className="block p-2 bg-background rounded border border-border text-xs break-all">
                  0x39a1d82121e428c0b57e79391abf12f0e0df6f15
                </code>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/payments")}>
              Ver os Meus Pagamentos
            </Button>
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
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
                <div
                  className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${method === "crypto" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  onClick={() => setMethod("crypto")}
                >
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <Bitcoin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Criptomoeda</div>
                      <div className="text-xs text-muted-foreground">BTC, ETH, USDT</div>
                    </div>
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${method === "bank" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  onClick={() => setMethod("bank")}
                >
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Transferência Bancária</div>
                      <div className="text-xs text-muted-foreground">Wire / SEPA</div>
                    </div>
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${method === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  onClick={() => setMethod("card")}
                >
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Cartão de Crédito</div>
                      <div className="text-xs text-muted-foreground">Via Stripe</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Discount Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4" />
                Código de Desconto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliedCode ? (
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-500">{appliedCode}</span>
                    <span className="text-sm text-muted-foreground">— {discountPercent}% de desconto</span>
                  </div>
                  <button
                    onClick={handleRemoveCode}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Insere o código de desconto"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setCodeError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                      className={codeError ? "border-red-500" : ""}
                    />
                    {codeError && <p className="text-xs text-red-500 mt-1">{codeError}</p>}
                  </div>
                  <Button variant="outline" onClick={handleApplyCode}>
                    Aplicar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumo da Encomenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{challenge.name}</div>
                  <div className="text-sm text-muted-foreground">${challenge.accountSize.toLocaleString()} Conta</div>
                </div>
                <div className="font-semibold">${basePrice}</div>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-green-500 text-sm">
                  <span>Desconto ({appliedCode} -{discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <div className="text-right">
                    {discountPercent > 0 && (
                      <div className="text-sm text-muted-foreground line-through font-normal">${basePrice}</div>
                    )}
                    <span className={discountPercent > 0 ? "text-green-500" : ""}>${finalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <p>Pagamento seguro com encriptação SSL. Sem taxas ocultas.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={submitPayment.isPending}
              >
                {submitPayment.isPending ? "A processar..." : `Pagar $${finalPrice}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
