import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { Shield, Mail, MapPin, Phone } from 'lucide-react'

export default function PrivacyPolicyIndex() {
  return (
    <PublicLayout>
      <Head title="Política de Privacidade - Câmara de Sumé" />
      <PageHero title="Política de Privacidade" subtitle="Lei Geral de Proteção de Dados Pessoais (LGPD)" icon={<Shield className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Política de Privacidade' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">

          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-lg max-w-none">
            <h2 className="text-xl font-bold text-navy">1. Apresentação</h2>
            <p>
              Esta Política de Privacidade tem por finalidade informar como a Câmara Municipal de
              Sumé – PB realiza o tratamento de dados pessoais por meio do seu portal institucional,
              em conformidade com a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais
              (LGPD). O objetivo é garantir a transparência e segurança das informações pessoais dos
              cidadãos que utilizam nossos serviços eletrônicos.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8">2. Aplicação</h2>
            <p>Aplica-se a todos os usuários que acessam ou interagem com os serviços da Câmara por meio do portal institucional, incluindo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Preenchimento de formulários</li>
              <li>Envio de mensagens à Ouvidoria ou e-SIC</li>
              <li>Participação em processos legislativos</li>
              <li>Acesso a conteúdos informativos</li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8">3. Dados Coletados e Finalidade</h2>
            <p>Podem ser coletados os seguintes dados:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo</li>
              <li>CPF ou CNPJ</li>
              <li>E-mail e telefone</li>
              <li>Assuntos e mensagens enviadas por formulários</li>
              <li>Dados de navegação (via cookies)</li>
            </ul>
            <p>Essas informações são utilizadas para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prestação de serviços públicos digitais</li>
              <li>Atendimento a solicitações da população</li>
              <li>Comunicação institucional</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8">4. Base Legal para o Tratamento</h2>
            <p>Os dados pessoais são tratados com fundamento nas seguintes bases legais previstas na LGPD:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cumprimento de obrigação legal ou regulatória (art. 7º, II)</li>
              <li>Execução de políticas públicas (art. 7º, III)</li>
              <li>Consentimento do titular (art. 7º, I)</li>
              <li>Legítimo interesse do controlador (art. 7º, IX)</li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8">5. Consentimento</h2>
            <p>
              Ao utilizar o site, o usuário declara estar ciente desta política e consente, de forma
              livre e informada, com o tratamento dos dados fornecidos.
            </p>
            <p>O consentimento pode ser revogado a qualquer momento pelo e-mail:</p>
            <div className="flex items-center gap-2 my-2">
              <Mail className="w-5 h-5 text-navy" />
              <a href="mailto:contato@camaradesume.pb.gov.br" className="text-navy font-semibold hover:underline">
                contato@camaradesume.pb.gov.br
              </a>
            </div>
            <p>Ou por correspondência para:</p>
            <div className="flex items-center gap-2 my-2">
              <MapPin className="w-5 h-5 text-navy" />
              <span className="font-semibold">Rua Alice Japiassú de Queiróz, 52 – Centro – Sumé – PB – CEP: 58540-000</span>
            </div>

            <h2 className="text-xl font-bold text-navy mt-8">6. Direitos do Titular</h2>
            <p>O titular de dados pode exercer os seguintes direitos previstos no art. 18 da LGPD:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Confirmação da existência do tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Informação sobre uso e compartilhamento</li>
              <li>Revogação do consentimento</li>
            </ul>
            <p className="mt-4"><strong>Para exercer seus direitos, o pedido deve conter:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo ou razão social</li>
              <li>CPF ou CNPJ</li>
              <li>E-mail e telefone de contato</li>
              <li>Direito que deseja exercer</li>
              <li>Documento que comprove a titularidade dos dados</li>
              <li>Data e assinatura do titular</li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8">7. Compartilhamento de Dados</h2>
            <p>
              A Câmara <strong>não compartilha dados pessoais com terceiros</strong>, exceto:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Por exigência legal</li>
              <li>Mediante decisão judicial</li>
              <li>Para fiscalização de órgãos de controle</li>
              <li>Quando necessário para execução de políticas públicas</li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8">8. Segurança dos Dados</h2>
            <p>
              A Câmara adota medidas técnicas e administrativas aptas a proteger os dados pessoais
              de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda,
              alteração, comunicação ou difusão, em conformidade com o art. 46 da LGPD.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8">9. Cookies</h2>
            <p>
              O portal pode utilizar cookies para melhorar a experiência de navegação. Os cookies
              são pequenos arquivos armazenados no dispositivo do usuário que permitem personalizar
              o acesso e gerar estatísticas de visitação. O usuário pode desabilitar os cookies nas
              configurações do navegador.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8">10. Encarregado de Proteção de Dados (DPO)</h2>
            <p>Em cumprimento ao art. 41 da LGPD, informamos os dados do encarregado pela proteção de dados pessoais:</p>
            <div className="bg-gray-50 rounded-lg p-6 my-4">
              <p className="font-semibold text-navy text-lg mb-2">Encarregado de Dados</p>
              <p><strong>Câmara Municipal de Sumé</strong></p>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href="mailto:contato@camaradesume.pb.gov.br" className="text-navy hover:underline">contato@camaradesume.pb.gov.br</a>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>(83) 3353-1191</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>Rua Alice Japiassú de Queiróz, 52 – Centro – Sumé – PB</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-navy mt-8">11. Alterações nesta Política</h2>
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças
              na legislação ou nas práticas da Câmara. A versão atualizada estará sempre disponível
              nesta página.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8">12. Legislação Aplicável</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD)</li>
              <li>Lei nº 12.527/2011 – Lei de Acesso à Informação (LAI)</li>
              <li>Lei nº 12.965/2014 – Marco Civil da Internet</li>
              <li>Constituição Federal de 1988, art. 5º, X e XII</li>
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <p>Última atualização: Fevereiro de 2026</p>
              <p>Câmara Municipal de Sumé – Paraíba</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
