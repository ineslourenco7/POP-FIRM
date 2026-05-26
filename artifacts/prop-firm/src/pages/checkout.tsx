import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetChallenge, useSubmitPayment, useValidateDiscountCode, getGetChallengeQueryKey, getListMyPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, Bitcoin, CheckCircle2, Tag, X, Zap, Copy, QrCode } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CRYPTO_METHODS = [
  { id: "usdt_trc20", label: "USDT", network: "TRC20", note: "Recomendado · taxas baixas · confirmação rápida", badge: "RECOMENDADO", icon: "₮", address: "TQKpX9c6VtPOPFiRMExampleTRC20Wallet" },
  { id: "usdt_sol", label: "USDT", network: "Solana", note: "Muito rápido · ideal para pagamentos instantâneos", badge: "RÁPIDO", icon: "₮", address: "POPFiRMExampleSolanaUSDTWallet111111111" },
  { id: "btc", label: "Bitcoin", network: "BTC", note: "Confirmação mais lenta · usar apenas se preferires BTC", badge: "BTC", icon: "₿", address: "bc1qpopfirmexamplebtcwallet0000000000000" },
  { id: "eth", label: "Ethereum", network: "ERC20", note: "Rede Ethereum · taxas podem variar", badge: "ETH", icon: "Ξ", address: "0x39a1d82121e428c0b57e79391abf12f0e0df6f15" },
  { id: "sol", label: "Solana", network: "SOL", note: "Confirmação rápida na rede Solana", badge: "SOL", icon: "◎", address: "POPFiRMExampleSolanaWallet111111111111111" },
];

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
  const validateCode = useValidateDiscountCode();

  const [method] = useState("crypto");
  const [cryptoMethod, setCryptoMethod] = useState(CRYPTO_METHODS[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [codeError, setCodeError] = useState("");

  const selectedCrypto = CRYPTO_METHODS.find((item) => item.id === cryptoMethod) ?? CRYPTO_METHODS[0];
  const basePrice = challenge?.price ?? 0;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = +(basePrice - discountAmount).toFixed(2);

  const handleApplyCode = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    validateCode.mutate(
      { data: { code } },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setAppliedCode(result.code);
            setDiscountPercent(result.discountPercent);
            setCodeError("");
            toast({ title: "Código aplicado!", description: `Desconto de ${result.discountPercent}% aplicado com sucesso.` });
          } else {
            setCodeError(result.message ?? "Código de desconto inválido.");
            setAppliedCode(null);
            setDiscountPercent(0);
          }
        },
        onError: () => {
          setCodeError("Erro ao validar o código. Tenta novamente.");
          setAppliedCode(null);
          setDiscountPercent(0);
        },
      }
    );
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setDiscountCode("");
    setDiscountPercent(0);
    setCodeError("");
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(selectedCrypto.address);
    toast({ title: "Endereço copiado", description: `${selectedCrypto.label} ${selectedCrypto.network} copiado para a área de transferência.` });
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    submitPayment.mutate(
      {
        data: {
          challengeId: challenge.id,
          amount: finalPrice,
          method: `${method}:${cryptoMethod}`,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          queryClient.invalidateQueries({ queryKey: getListMyPaymentsQueryKey() });
          toast({ title: "Pagamento cripto criado", description: "Envia o valor exato para o endereço indicado e aguarda confirmação." });
        },
        onError: () => {
          toast({ title: "Erro", description: "Falha ao criar pagamento cripto.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!challenge) {
    return <div className="p-6 text-center">Desafio não encontrado.</div>;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg p-6 py-20">
        <Card className="border-border text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Pagamento Cripto Pendente</CardTitle>
            <CardDescription>Envia o valor exato para o endereço abaixo. Quando confirmado, a challenge será ativada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 rounded-lg bg-muted p-4 text-left text-sm">
              <p><strong>Desafio:</strong> {challenge.name}</p>
              {discountPercent > 0 && <p><strong>Desconto ({appliedCode}):</strong> -{discountPercent}%</p>}
              <p><strong>Valor:</strong> ${finalPrice}</p>
              <p><strong>Método:</strong> {selectedCrypto.label} · {selectedCrypto.network}</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-sm">
              <div className="mb-3 flex items-center justify-center gap-2 text-muted-foreground"><QrCode className="h-4 w-4" /> QR/Invoice será ligado ao gateway cripto.</div>
              <p className="mb-2 text-muted-foreground">Endereço de pagamento:</p>
              <code className="block break-all rounded border border-border bg-background p-2 text-xs">{selectedCrypto.address}</code>
              <Button variant="outline" className="mt-3 w-full" onClick={copyAddress}><Copy className="mr-2 h-4 w-4" /> Copiar endereço</Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/payments")}>Ver os Meus Pagamentos</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bitcoin className="h-5 w-5 text-primary" /> Pagamento por Criptomoeda</CardTitle>
              <CardDescription>Crypto-only nesta fase. Recomendamos USDT TRC20 para taxas baixas e ativação rápida.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={cryptoMethod} onValueChange={setCryptoMethod} className="space-y-3">
                {CRYPTO_METHODS.map((item) => (
                  <div key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${cryptoMethod === item.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setCryptoMethod(item.id)}>
                    <RadioGroupItem value={item.id} id={item.id} />
                    <Label htmlFor={item.id} className="flex flex-1 cursor-pointer items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 font-medium"><span>{item.label}</span><span className="text-xs text-muted-foreground">{item.network}</span><span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{item.badge}</span></div>
                        <div className="text-xs text-muted-foreground">{item.note}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Tag className="h-4 w-4" /> Código de Desconto</CardTitle>
            </CardHeader>
            <CardContent>
              {appliedCode ? (
                <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-sm font-semibold text-green-500">{appliedCode}</span><span className="text-sm text-muted-foreground">— {discountPercent}% de desconto</span></div>
                  <button onClick={handleRemoveCode} className="text-muted-foreground transition-colors hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex-1">
                    <Input placeholder="Insere o código de desconto" value={discountCode} onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setCodeError(""); }} onKeyDown={(e) => e.key === "Enter" && handleApplyCode()} className={codeError ? "border-red-500" : ""} />
                    {codeError && <p className="mt-1 text-xs text-red-500">{codeError}</p>}
                  </div>
                  <Button variant="outline" onClick={handleApplyCode}>Aplicar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader><CardTitle>Resumo da Encomenda</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between"><div><div className="font-semibold">{challenge.name}</div><div className="text-sm text-muted-foreground">${challenge.accountSize.toLocaleString()} Conta</div></div><div className="font-semibold">${basePrice}</div></div>
              {discountPercent > 0 && <div className="flex items-center justify-between text-sm text-green-500"><span>Desconto ({appliedCode} -{discountPercent}%)</span><span>-${discountAmount.toFixed(2)}</span></div>}
              <div className="border-t border-border pt-4"><div className="flex items-center justify-between text-lg font-bold"><span>Total</span><div className="text-right">{discountPercent > 0 && <div className="text-sm font-normal text-muted-foreground line-through">${basePrice}</div>}<span className={discountPercent > 0 ? "text-green-500" : ""}>${finalPrice}</span></div></div></div>
              <div className="rounded border border-primary/20 bg-primary/10 p-3 text-xs text-primary"><div className="mb-1 flex items-center gap-2 font-black"><Zap className="h-4 w-4" /> Crypto selected</div><p>{selectedCrypto.label} · {selectedCrypto.network}</p></div>
              <div className="flex items-start gap-2 rounded bg-muted p-3 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" /><p>Sem cartão e sem chargebacks. Envia apenas pela rede selecionada.</p></div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitPayment.isPending}>{submitPayment.isPending ? "A criar pagamento..." : `Criar pagamento $${finalPrice}`}</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
