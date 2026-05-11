import { FileText } from "lucide-react";
import TopBar from "@/components/TopBar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar
        title="Termos e Condições"
        right={<FileText className="w-4 h-4 text-muted-foreground" />}
      />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="QuantFund" className="w-7 h-7" />
            <span className="text-xl font-bold">QuantFund</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Termos e Condições</h1>
          <p className="text-sm text-muted-foreground">ECI Ventures Pte. Ltd. – UEN 202329954C · Última atualização: Janeiro 2025</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
            <p>Ao aceder ou utilizar a plataforma QuantFund, operada pela ECI Ventures Pte. Ltd. ("Empresa", "nós", "nosso"), o utilizador ("Trader", "você") concorda em ficar vinculado aos presentes Termos e Condições. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.</p>
            <p className="mt-2">A Empresa reserva-se o direito de atualizar estes termos a qualquer momento. As alterações serão notificadas por e-mail ou através de aviso na plataforma. A utilização continuada dos serviços após a notificação constitui aceitação dos termos atualizados.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Natureza dos Serviços</h2>
            <p>A QuantFund é uma plataforma de desafios de trading simulado, fornecida exclusivamente para fins de entretenimento, educação e treino. Todos os desafios e contas de trading operados através da plataforma são <strong className="text-foreground">100% simulados</strong> e não envolvem execução de ordens em mercados reais, nem capital real de terceiros.</p>
            <p className="mt-2">Os resultados de trading simulado não representam resultados de trading real. A Empresa não oferece serviços de investimento, gestão de ativos, nem qualquer forma de assessoria financeira regulada, nos termos da Singapore Securities and Futures Act 2001 ou legislação equivalente de outros países.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Critérios de Elegibilidade</h2>
            <p>Para utilizar os serviços da QuantFund, o utilizador deve:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Ter pelo menos 18 anos de idade;</li>
              <li>Fornecer informações verdadeiras e precisas durante o registo;</li>
              <li>Não ser residente em jurisdições onde o acesso à plataforma seja proibido por lei;</li>
              <li>Não estar sujeito a sanções internacionais ou listas de restrição de transações financeiras.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Desafios de Avaliação</h2>
            <p>Os desafios de avaliação da QuantFund consistem em fases simuladas durante as quais o trader deve cumprir metas específicas de performance, respeitando os limites de risco definidos. As regras de cada desafio estão disponíveis na página de Desafios.</p>
            <p className="mt-2">A taxa de participação no desafio é não reembolsável, exceto nos casos expressamente previstos na nossa política de reembolso. A aprovação no desafio não garante rendimentos futuros. Os valores de payouts indicados são pagamentos de incentivo baseados em performance simulada e não constituem remuneração de trabalho nem dividendos de investimento.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Regras de Trading</h2>
            <p>O trader concorda em cumprir todas as regras de trading da plataforma, incluindo mas não se limitando a:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Limite máximo de drawdown diário e global;</li>
              <li>Meta mínima de lucro para aprovação de fases;</li>
              <li>Proibição de estratégias de arbitragem exploratória, scalping abusivo ou qualquer forma de manipulação da plataforma;</li>
              <li>Proibição de partilha de acesso à conta com terceiros;</li>
              <li>Proibição de utilização de software de trading automático não declarado.</li>
            </ul>
            <p className="mt-2">A violação de qualquer regra pode resultar na rescisão imediata da conta, sem reembolso.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Pagamentos e Payouts</h2>
            <p>Os traders aprovados que cumpram os critérios de elegibilidade para payout poderão solicitar pagamentos de incentivo de acordo com o calendário e os limites definidos no seu plano. Os pagamentos são processados dentro de 5 dias úteis após aprovação.</p>
            <p className="mt-2">A Empresa reserva-se o direito de reter ou cancelar pagamentos em caso de suspeita de fraude, manipulação ou violação dos presentes termos. Todos os payouts estão sujeitos a verificação de identidade (KYC).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Propriedade Intelectual</h2>
            <p>Todo o conteúdo, software, logótipos, marcas e materiais disponibilizados na plataforma são propriedade exclusiva da ECI Ventures Pte. Ltd. e estão protegidos por lei. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitação de Responsabilidade</h2>
            <p>Na máxima extensão permitida por lei, a Empresa não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequentes decorrentes do uso ou da impossibilidade de uso dos serviços, incluindo perdas financeiras de qualquer natureza.</p>
            <p className="mt-2">A plataforma é fornecida "tal como está", sem garantias de qualquer tipo, expressas ou implícitas, incluindo garantias de comercialização, adequação a um fim específico ou não-infração.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Política de Privacidade e Dados</h2>
            <p>A recolha e tratamento de dados pessoais é realizada em conformidade com o Regulamento Geral de Proteção de Dados (RGPD) e legislação aplicável. Os dados recolhidos são utilizados exclusivamente para prestação dos serviços e não são partilhados com terceiros sem consentimento, exceto quando exigido por lei.</p>
            <p className="mt-2">O utilizador tem o direito de aceder, corrigir ou solicitar a eliminação dos seus dados pessoais através do e-mail: <a href="mailto:privacy@quantfund.io" className="text-primary hover:underline">privacy@quantfund.io</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Rescisão</h2>
            <p>A Empresa pode suspender ou encerrar a conta do utilizador a qualquer momento, com ou sem aviso prévio, caso seja detetada violação destes termos, atividade fraudulenta ou qualquer comportamento que prejudique a integridade da plataforma.</p>
            <p className="mt-2">O utilizador pode encerrar a sua conta a qualquer momento através das definições da conta ou contactando o suporte.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Lei Aplicável e Jurisdição</h2>
            <p>Os presentes termos são regidos pela legislação de Singapura. Qualquer litígio decorrente da interpretação ou execução destes termos será submetido à jurisdição exclusiva dos tribunais de Singapura.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contacto</h2>
            <p>Para questões sobre estes Termos e Condições, contacte:</p>
            <div className="mt-2 p-4 bg-card border border-border rounded-lg">
              <p className="font-medium text-foreground">ECI Ventures Pte. Ltd.</p>
              <p>UEN: 202329954C</p>
              <p>E-mail: <a href="mailto:legal@quantfund.io" className="text-primary hover:underline">legal@quantfund.io</a></p>
              <p>Suporte: <a href="mailto:support@quantfund.io" className="text-primary hover:underline">support@quantfund.io</a></p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="border-t border-border pt-8">
            <div className="p-4 bg-card border border-border rounded-lg text-xs text-muted-foreground/70 leading-relaxed">
              <p className="font-semibold text-muted-foreground mb-2">Aviso Legal / Legal Disclaimer</p>
              <p>A QuantFund (operada pela ECI Ventures Pte. Ltd. – UEN 202329954C) fornece desafios de trading simulado exclusivamente para fins de entretenimento, educação e treino. Os resultados passados não são indicativos de resultados futuros. Os resultados hipotéticos ou simulados têm limitações inerentes e não representam trading real, uma vez que as ordens não são executadas em contrapartes reais de mercado. Nenhuma representação é feita de que qualquer utilizador irá ou poderá obter lucros ou perdas semelhantes aos apresentados no ambiente simulado.</p>
              <p className="mt-2">Nenhuma informação disponibilizada pela Empresa constitui aconselhamento de investimento, oferta ou solicitação de compra/venda, recomendação, endosso ou patrocínio de qualquer produto financeiro ou de investimento. Os serviços prestados não são serviços de investimento nem aconselhamento financeiro regulado, nos termos da Singapore Securities and Futures Act 2001 ou legislação equivalente de outros países. A utilização das informações é da exclusiva responsabilidade do utilizador.</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} QuantFund · ECI Ventures Pte. Ltd. · <Link href="/support" className="hover:text-foreground">Suporte</Link>
        </div>
      </footer>
    </div>
  );
}
