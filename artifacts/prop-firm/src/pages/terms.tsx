import { FileText } from "lucide-react";
import { Link } from "wouter";
import TopBar from "@/components/TopBar";
import { LICENSE_NUMBER } from "@/lib/constants";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar
        title="Termos e Condições"
        right={<FileText className="w-4 h-4 text-muted-foreground" />}
      />

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="POP FIRM" className="h-7 w-7" />
            <span className="text-xl font-bold">POP FIRM</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Termos e Condições</h1>
          <p className="text-sm text-muted-foreground">Última atualização: Janeiro 2025</p>
          <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground/60">Licença Nº {LICENSE_NUMBER}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p>Ao aceder ou utilizar a plataforma POP FIRM, o utilizador concorda em ficar vinculado aos presentes Termos e Condições. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.</p>
            <p className="mt-2">A POP FIRM reserva-se o direito de atualizar estes termos a qualquer momento. As alterações serão notificadas por e-mail ou através de aviso na plataforma.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">2. Natureza dos Serviços</h2>
            <p>A POP FIRM é uma plataforma de desafios de trading simulado. Todos os desafios e contas de trading operados através da plataforma são <strong className="text-foreground">100% simulados</strong> e não envolvem execução de ordens em mercados reais, nem capital real de terceiros.</p>
            <p className="mt-2">Os resultados de trading simulado não representam resultados de trading real. A POP FIRM não oferece serviços de investimento, gestão de ativos, nem qualquer forma de assessoria financeira regulada.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">3. Critérios de Elegibilidade</h2>
            <p>Para utilizar os serviços da POP FIRM, o utilizador deve:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Ter pelo menos 18 anos de idade;</li>
              <li>Fornecer informações verdadeiras e precisas durante o registo;</li>
              <li>Não ser residente em jurisdições onde o acesso à plataforma seja proibido por lei;</li>
              <li>Não estar sujeito a sanções internacionais ou listas de restrição de transações financeiras.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">4. Desafios de Avaliação</h2>
            <p>Os desafios de avaliação da POP FIRM consistem em fases simuladas durante as quais o trader deve cumprir metas específicas de performance, respeitando os limites de risco definidos. As regras de cada desafio estão disponíveis na página de Desafios.</p>
            <p className="mt-2">A taxa de participação no desafio é não reembolsável, exceto nos casos expressamente previstos na nossa política de reembolso. A aprovação no desafio não garante rendimentos futuros.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">5. Regras de Trading</h2>
            <p>O trader concorda em cumprir todas as regras de trading da plataforma, incluindo mas não se limitando a:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Limite máximo de drawdown diário e global;</li>
              <li>Meta mínima de lucro para aprovação;</li>
              <li>Proibição de estratégias de arbitragem exploratória, scalping abusivo ou manipulação da plataforma;</li>
              <li>Proibição de partilha de acesso à conta com terceiros;</li>
              <li>Proibição de utilização de software de trading automático não declarado.</li>
            </ul>
            <p className="mt-2">A violação de qualquer regra pode resultar na rescisão imediata da conta, sem reembolso.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">6. Pagamentos e Payouts</h2>
            <p>Os traders aprovados que cumpram os critérios de elegibilidade para payout poderão solicitar pagamentos de incentivo de acordo com o calendário e os limites definidos no seu plano.</p>
            <p className="mt-2">A POP FIRM reserva-se o direito de reter ou cancelar pagamentos em caso de suspeita de fraude, manipulação ou violação dos presentes termos. Todos os payouts estão sujeitos a verificação de identidade.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">7. Propriedade Intelectual</h2>
            <p>Todo o conteúdo, software, logótipos, marcas e materiais disponibilizados na plataforma POP FIRM estão protegidos por lei. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
            <p>Na máxima extensão permitida por lei, a POP FIRM não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequentes decorrentes do uso ou da impossibilidade de uso dos serviços.</p>
            <p className="mt-2">A plataforma é fornecida "tal como está", sem garantias de qualquer tipo, expressas ou implícitas.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">9. Política de Privacidade e Dados</h2>
            <p>A recolha e tratamento de dados pessoais é realizada em conformidade com a legislação aplicável. Os dados recolhidos são utilizados exclusivamente para prestação dos serviços e não são partilhados com terceiros sem consentimento, exceto quando exigido por lei.</p>
            <p className="mt-2">O utilizador tem o direito de aceder, corrigir ou solicitar a eliminação dos seus dados pessoais através do suporte da POP FIRM.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">10. Rescisão</h2>
            <p>A POP FIRM pode suspender ou encerrar a conta do utilizador a qualquer momento, com ou sem aviso prévio, caso seja detetada violação destes termos, atividade fraudulenta ou qualquer comportamento que prejudique a integridade da plataforma.</p>
            <p className="mt-2">O utilizador pode encerrar a sua conta a qualquer momento através das definições da conta ou contactando o suporte.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">11. Contacto</h2>
            <p>Para questões sobre estes Termos e Condições, contacte o suporte da POP FIRM.</p>
          </section>

          <section className="border-t border-border pt-8">
            <div className="rounded-lg border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground/70">
              <p className="mb-2 font-semibold text-muted-foreground">Aviso Legal / Legal Disclaimer</p>
              <p>A POP FIRM fornece desafios de trading simulado. Os resultados passados não são indicativos de resultados futuros. Os resultados hipotéticos ou simulados têm limitações inerentes e não representam trading real, uma vez que as ordens não são executadas em contrapartes reais de mercado.</p>
              <p className="mt-2">Nenhuma informação disponibilizada pela POP FIRM constitui aconselhamento de investimento, oferta ou solicitação de compra/venda, recomendação, endosso ou patrocínio de qualquer produto financeiro ou de investimento.</p>
              <p className="mt-3 font-mono tracking-widest text-muted-foreground/50">Licença Nº {LICENSE_NUMBER}</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} POP FIRM · <Link href="/support" className="hover:text-foreground">Suporte</Link>
        </div>
      </footer>
    </div>
  );
}
