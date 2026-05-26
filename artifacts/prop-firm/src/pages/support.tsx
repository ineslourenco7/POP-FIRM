import { HeadphonesIcon, Mail, MessageSquare, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { LICENSE_NUMBER } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FAQS = [
  { q: "O que é a POP FIRM?", a: "A POP FIRM é uma plataforma de desafios de trading simulado. Avaliamos traders através de contas simuladas e pagamentos de incentivo baseados em performance simulada." },
  { q: "O trading envolve dinheiro real nos mercados?", a: "Não. Toda a atividade de trading na plataforma é 100% simulada. As ordens não são executadas em mercados reais." },
  { q: "Como funciona o processo de avaliação?", a: "Escolhes um desafio, cumpres o objetivo de lucro e respeitas os limites de drawdown. Após aprovação, a conta passa para estado financiado simulado." },
  { q: "Quais são os métodos de pagamento aceites?", a: "Nesta fase, a POP FIRM está focada em pagamentos por criptomoeda, com prioridade para USDT TRC20." },
  { q: "Como solicito um payout?", a: "Após cumprir os critérios de elegibilidade, podes solicitar o teu payout na área de cliente. Os pagamentos são revistos antes de aprovação." },
  { q: "O que acontece se violar uma regra de trading?", a: "A violação de qualquer regra de trading pode resultar na desqualificação imediata do desafio." },
];

function FAQItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-card" onClick={() => setOpen(!open)}>
        <span className="text-sm font-medium">{faq.q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border bg-card px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>}
    </div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar title="Suporte" right={<HeadphonesIcon className="h-4 w-4 text-muted-foreground" />} />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <HeadphonesIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-3 text-3xl font-bold">Como podemos ajudar?</h1>
          <p className="mx-auto max-w-lg text-muted-foreground">A equipa POP FIRM está disponível para responder às tuas dúvidas.</p>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Mail className="h-6 w-6 text-primary" /></div>
            <h3 className="mb-2 font-semibold">E-mail</h3>
            <p className="mb-4 text-sm text-muted-foreground">Resposta em até 24 horas úteis</p>
            <span className="text-sm font-medium text-primary">support@popfirm.com</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><MessageSquare className="h-6 w-6 text-primary" /></div>
            <h3 className="mb-2 font-semibold">Live Chat</h3>
            <p className="mb-4 text-sm text-muted-foreground">Disponível diretamente no site</p>
            <Button size="sm" className="text-xs">Iniciar Chat</Button>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Clock className="h-6 w-6 text-primary" /></div>
            <h3 className="mb-2 font-semibold">Horário</h3>
            <p className="mb-1 text-sm text-muted-foreground">Seg–Sex: 9h–22h UTC</p>
            <p className="text-sm text-muted-foreground">Sáb–Dom: 10h–18h UTC</p>
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="text-2xl font-bold">Perguntas Frequentes</h2></div>
          <div className="space-y-3">{FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}</div>
        </div>

        <div className="mt-12 rounded-xl border border-border p-4 text-xs leading-relaxed text-muted-foreground/70">
          <p className="mb-1 font-semibold text-muted-foreground">Aviso Legal</p>
          <p>A POP FIRM fornece desafios de trading simulado. Nenhum dos serviços prestados constitui serviços de investimento ou aconselhamento financeiro.</p>
          <p className="mt-2 font-mono tracking-widest text-muted-foreground/40">Licença Nº {LICENSE_NUMBER}</p>
        </div>
      </main>
      <footer className="mt-12 border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} POP FIRM · <Link href="/terms" className="hover:text-foreground">Termos e Condições</Link></div>
      </footer>
    </div>
  );
}
