import { HeadphonesIcon, Mail, MessageSquare, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "@/components/TopBar";
import { useState } from "react";

const FAQS = [
  {
    q: "O que é a QuantFund?",
    a: "A QuantFund é uma plataforma de desafios de trading simulado. Avaliamos traders através de contas simuladas e, após a aprovação, alocamos capital simulado para que possam operar e receber pagamentos de incentivo baseados na sua performance."
  },
  {
    q: "O trading na QuantFund envolve dinheiro real nos mercados?",
    a: "Não. Toda a atividade de trading na plataforma é 100% simulada. As ordens não são executadas em mercados reais. Os payouts que os traders recebem são pagamentos de incentivo baseados em performance simulada, não lucros de trading real."
  },
  {
    q: "Como funciona o processo de avaliação?",
    a: "O processo consiste em 1 ou 2 fases de avaliação (dependendo do plano). Deves atingir a meta de lucro sem violar o limite de drawdown. Após a aprovação, recebes uma conta financiada onde podes solicitar payouts regulares."
  },
  {
    q: "Quais são as taxas de participação?",
    a: "As taxas variam consoante o tamanho da conta escolhida. Consulta a página de Desafios para ver os preços atualizados. Nota: a taxa de participação não é reembolsável em caso de reprovação no desafio."
  },
  {
    q: "Como solicito um payout?",
    a: "Após cumprir os critérios de elegibilidade (conta financiada, mínimo de dias de trading, sem violações de regras), podes solicitar o teu payout na secção Payouts do dashboard. Os pagamentos são processados em até 5 dias úteis."
  },
  {
    q: "Quais são os métodos de pagamento aceites?",
    a: "Aceitamos Bitcoin (BTC), Ethereum (ETH), USDT, USDC, Binance Pay, Transferência Bancária, Visa, Mastercard, PayPal, Skrill e Neteller. Para compra de desafios e para recebimento de payouts."
  },
  {
    q: "Posso usar Expert Advisors (EAs) ou bots?",
    a: "Sim, desde que declarados e que não explorem falhas técnicas da plataforma (arbitragem, latency trading, etc.). Estratégias que tirem vantagem de vulnerabilidades do sistema serão desqualificadas."
  },
  {
    q: "O que acontece se violar uma regra de trading?",
    a: "A violação de qualquer regra (drawdown diário, drawdown global, hold over weekend quando proibido, etc.) resulta na desqualificação imediata do desafio. A taxa de participação não é reembolsável."
  },
  {
    q: "Posso ter mais do que uma conta?",
    a: "Sim. Cada utilizador pode ter múltiplas contas de diferentes tamanhos. No entanto, não é permitida a correlação de posições entre contas para contornar limites de risco."
  },
  {
    q: "Como funciona a verificação de identidade (KYC)?",
    a: "O KYC é exigido antes do primeiro payout. Deves submeter documento de identificação válido (BI/Passaporte) e comprovativo de morada. O processo demora normalmente 24-48 horas após submissão dos documentos."
  },
  {
    q: "A plataforma está disponível no meu país?",
    a: "A QuantFund está disponível na maioria dos países. No entanto, residentes em países sancionados (Coreia do Norte, Irão, Cuba, Rússia, etc.) não podem aceder à plataforma. Verifica os nossos Termos e Condições para a lista completa."
  },
  {
    q: "Como posso cancelar a minha conta?",
    a: "Podes cancelar a tua conta a qualquer momento através das Definições da conta ou enviando um e-mail para support@quantfund.io. Contas canceladas com payouts pendentes serão processados antes do encerramento."
  },
];

function FAQItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-card transition-colors gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3 bg-card">
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar
        title="Suporte"
        right={<HeadphonesIcon className="w-4 h-4 text-muted-foreground" />}
      />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <HeadphonesIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Como podemos ajudar?</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">A nossa equipa de suporte está disponível 7 dias por semana para responder a todas as tuas dúvidas.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center text-center hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">E-mail</h3>
            <p className="text-sm text-muted-foreground mb-4">Resposta em até 24 horas úteis</p>
            <a href="mailto:support@quantfund.io" className="text-primary text-sm font-medium hover:underline">
              support@quantfund.io
            </a>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center text-center hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-4">Disponível das 9h às 22h UTC</p>
            <Button size="sm" className="text-xs">Iniciar Chat</Button>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center text-center hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Horário</h3>
            <p className="text-sm text-muted-foreground mb-1">Seg–Sex: 9h–22h UTC</p>
            <p className="text-sm text-muted-foreground">Sáb–Dom: 10h–18h UTC</p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16 p-8 bg-card border border-border rounded-2xl">
          <h2 className="text-xl font-bold mb-2">Não encontraste resposta?</h2>
          <p className="text-muted-foreground text-sm mb-6">Envia-nos uma mensagem e respondemos em menos de 24 horas.</p>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome</label>
                <input
                  type="text"
                  placeholder="O teu nome"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                <input
                  type="email"
                  placeholder="teu@email.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Assunto</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-muted-foreground">
                <option value="">Seleciona um assunto</option>
                <option value="challenge">Dúvida sobre Desafio</option>
                <option value="payout">Payout / Pagamento</option>
                <option value="account">Conta / Acesso</option>
                <option value="billing">Faturação</option>
                <option value="technical">Problema Técnico</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
              <textarea
                rows={5}
                placeholder="Descreve o teu problema ou questão..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto px-8">
              Enviar Mensagem
            </Button>
          </form>
        </div>

        {/* Legal note */}
        <div className="mt-12 p-4 border border-border rounded-xl text-xs text-muted-foreground/70 leading-relaxed">
          <p className="font-semibold text-muted-foreground mb-1">Aviso Legal</p>
          <p>A QuantFund (operada pela ECI Ventures Pte. Ltd. – UEN 202329954C) fornece desafios de trading simulado. Nenhum dos serviços prestados constitui serviços de investimento ou aconselhamento financeiro. A utilização das informações é da exclusiva responsabilidade do utilizador.</p>
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} QuantFund · ECI Ventures Pte. Ltd. · <Link href="/terms" className="hover:text-foreground">Termos e Condições</Link>
        </div>
      </footer>
    </div>
  );
}
