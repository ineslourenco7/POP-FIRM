import { useState, useMemo } from "react";
import { Calculator, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INSTRUMENTS = [
  { label: "EUR/USD", value: "EURUSD", pipValue: 10, contractSize: 100000, pipDecimal: 4 },
  { label: "GBP/USD", value: "GBPUSD", pipValue: 10, contractSize: 100000, pipDecimal: 4 },
  { label: "USD/JPY", value: "USDJPY", pipValue: 9.1, contractSize: 100000, pipDecimal: 2 },
  { label: "USD/CHF", value: "USDCHF", pipValue: 11.2, contractSize: 100000, pipDecimal: 4 },
  { label: "AUD/USD", value: "AUDUSD", pipValue: 10, contractSize: 100000, pipDecimal: 4 },
  { label: "USD/CAD", value: "USDCAD", pipValue: 7.4, contractSize: 100000, pipDecimal: 4 },
  { label: "NZD/USD", value: "NZDUSD", pipValue: 10, contractSize: 100000, pipDecimal: 4 },
  { label: "EUR/GBP", value: "EURGBP", pipValue: 12.6, contractSize: 100000, pipDecimal: 4 },
  { label: "EUR/JPY", value: "EURJPY", pipValue: 9.1, contractSize: 100000, pipDecimal: 2 },
  { label: "GBP/JPY", value: "GBPJPY", pipValue: 9.1, contractSize: 100000, pipDecimal: 2 },
  { label: "XAU/USD (Ouro)", value: "XAUUSD", pipValue: 10, contractSize: 100, pipDecimal: 2 },
  { label: "XAG/USD (Prata)", value: "XAGUSD", pipValue: 50, contractSize: 5000, pipDecimal: 3 },
  { label: "US30 (Dow Jones)", value: "US30", pipValue: 1, contractSize: 1, pipDecimal: 0 },
  { label: "NAS100 (Nasdaq)", value: "NAS100", pipValue: 1, contractSize: 1, pipDecimal: 1 },
  { label: "SPX500 (S&P)", value: "SPX500", pipValue: 1, contractSize: 1, pipDecimal: 1 },
];

const ACCOUNT_SIZES = [10000, 25000, 50000, 100000, 200000, 1000000];

function StatBox({ label, value, sub, color = "" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xl font-bold font-mono tabular-nums ${color}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function LotCalculator() {
  const [accountSize, setAccountSize] = useState(100000);
  const [customAccount, setCustomAccount] = useState("");
  const [riskPct, setRiskPct] = useState(1);
  const [stopLossPips, setStopLossPips] = useState(20);
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [leverage, setLeverage] = useState(100);

  const effectiveAccount = customAccount ? Number(customAccount) || 0 : accountSize;

  const result = useMemo(() => {
    if (!effectiveAccount || !riskPct || !stopLossPips || !instrument) return null;

    const riskAmount = (effectiveAccount * riskPct) / 100;
    const pipValuePerLot = instrument.pipValue;
    const lots = riskAmount / (stopLossPips * pipValuePerLot);
    const margin = (lots * instrument.contractSize) / leverage;
    const profitAt2R = riskAmount * 2;
    const profitAt3R = riskAmount * 3;

    return {
      lots: Math.max(0, lots),
      riskAmount,
      margin: Math.max(0, margin),
      profitAt2R,
      profitAt3R,
    };
  }, [effectiveAccount, riskPct, stopLossPips, instrument, leverage]);

  const sliderBg = `linear-gradient(to right, hsl(217.2,91.2%,59.8%) ${riskPct * 50}%, hsl(217.2,32.6%,17.5%) ${riskPct * 50}%)`;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calculadora de Lot</h1>
          <p className="text-sm text-muted-foreground">Calcula o tamanho ideal da posição com base no risco</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card className="border-border">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Parâmetros</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">

            {/* Instrument */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Instrumento</label>
              <select
                value={instrument.value}
                onChange={e => setInstrument(INSTRUMENTS.find(i => i.value === e.target.value) ?? INSTRUMENTS[0])}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {INSTRUMENTS.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>

            {/* Account size */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tamanho da Conta</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ACCOUNT_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => { setAccountSize(s); setCustomAccount(""); }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                      accountSize === s && !customAccount
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    ${s >= 1_000_000 ? "1M" : s >= 1000 ? (s / 1000) + "K" : s}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Ou insere um valor personalizado..."
                value={customAccount}
                onChange={e => setCustomAccount(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {effectiveAccount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Conta: <span className="text-foreground font-medium">${effectiveAccount.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Risk % slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Risco por Trade</label>
                <span className="text-sm font-bold text-primary">{riskPct}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2}
                step={0.1}
                value={riskPct}
                onChange={e => setRiskPct(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
                style={{ background: sliderBg }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1">
                <span>0.1%</span>
                <span className="text-xs text-muted-foreground">
                  = <span className="text-foreground font-semibold">${((effectiveAccount * riskPct) / 100).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
                <span>2%</span>
              </div>
            </div>

            {/* Stop Loss */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Stop Loss (pips)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={stopLossPips}
                  onChange={e => setStopLossPips(Math.max(1, Number(e.target.value)))}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex gap-1">
                  {[10, 20, 30, 50].map(p => (
                    <button
                      key={p}
                      onClick={() => setStopLossPips(p)}
                      className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                        stopLossPips === p
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leverage */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Alavancagem</label>
              <div className="flex gap-1.5 flex-wrap">
                {[10, 30, 50, 100, 200, 500].map(l => (
                  <button
                    key={l}
                    onClick={() => setLeverage(l)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                      leverage === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    1:{l}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* Main result */}
              <Card className="border-primary/40 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Tamanho da Posição</p>
                  <p className="text-5xl font-black tabular-nums text-foreground">
                    {result.lots < 0.01
                      ? result.lots.toFixed(4)
                      : result.lots < 0.1
                      ? result.lots.toFixed(3)
                      : result.lots.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">lots</p>
                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      = {Math.round(result.lots * 100) / 100} lot
                      {result.lots >= 1 ? "" : result.lots >= 0.1 ? " (mini)" : " (micro)"}
                    </span>
                    {result.lots >= 0.01 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {result.lots >= 1 ? "Standard" : result.lots >= 0.1 ? "Mini" : "Micro"}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Risco ($)"
                  value={`$${result.riskAmount.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub={`${riskPct}% da conta`}
                  color="text-red-400"
                />
                <StatBox
                  label="Margem Necessária"
                  value={`$${result.margin.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub={`Alavancagem 1:${leverage}`}
                />
                <StatBox
                  label="Lucro 2R (TP)"
                  value={`+$${result.profitAt2R.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub={`SL × 2 (${stopLossPips * 2} pips)`}
                  color="text-green-400"
                />
                <StatBox
                  label="Lucro 3R (TP)"
                  value={`+$${result.profitAt3R.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub={`SL × 3 (${stopLossPips * 3} pips)`}
                  color="text-green-400"
                />
              </div>

              {/* Pip value info */}
              <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">{instrument.label}</span>
                  {" "}— Valor por pip: <span className="text-foreground font-medium">${instrument.pipValue}</span> /lot ·
                  Stop Loss de <span className="text-foreground font-medium">{stopLossPips} pips</span> ·
                  Pip decimal: {instrument.pipDecimal === 4 ? "0.0001" : instrument.pipDecimal === 2 ? "0.01" : "1"}
                </div>
              </div>

              {/* Risk warning */}
              {riskPct > 1 && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-400 leading-relaxed">
                  ⚠️ Risco acima de 1% por trade é considerado agressivo. Para desafios prop firm, recomendamos máximo 1-2% por posição.
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Preenche os parâmetros para calcular
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
