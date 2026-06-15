import type { ComponentType, ReactNode } from "react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  CalendarDays,
  Cookie,
  Database,
  Mail,
  ScrollText,
  Share2,
  ShieldCheck,
  Target,
  UserCheck,
} from "lucide-react";

interface Props {
  content?: string;
}

const LAST_UPDATED = "12 de junho de 2026";

interface Section {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  body: ReactNode;
}

const PROSE =
  "prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary";

const SECTIONS: Section[] = [
  {
    id: "dados-coletados",
    title: "Quais dados coletamos",
    icon: Database,
    body: (
      <>
        <p>
          A Câmara Municipal de Sumé coleta apenas os dados pessoais estritamente necessários à
          prestação dos serviços oferecidos por este portal, sempre fornecidos voluntariamente
          pelo cidadão:
        </p>
        <ul>
          <li>
            <strong>Formulários da Ouvidoria e do e-SIC (Lei de Acesso à Informação):</strong>{" "}
            nome, e-mail, telefone e o conteúdo da manifestação ou do pedido de informação.
            Manifestações anônimas são aceitas nos casos previstos em lei.
          </li>
          <li>
            <strong>Pesquisa de satisfação:</strong> respostas às perguntas da pesquisa e,
            quando informado, CPF utilizado exclusivamente para evitar respostas duplicadas.
          </li>
          <li>
            <strong>Dados de navegação:</strong> registros básicos de acesso (endereço IP, data
            e hora), mantidos por obrigação legal (Marco Civil da Internet, Lei nº 12.965/2014).
          </li>
        </ul>
        <p>
          Não coletamos dados sensíveis nem dados de crianças e adolescentes de forma
          intencional por meio deste portal.
        </p>
      </>
    ),
  },
  {
    id: "finalidade",
    title: "Finalidade e base legal",
    icon: Target,
    body: (
      <>
        <p>Os dados pessoais são tratados para finalidades específicas e legítimas:</p>
        <ul>
          <li>Responder a manifestações de ouvidoria e a pedidos de acesso à informação;</li>
          <li>Apurar resultados da pesquisa de satisfação e melhorar os serviços públicos;</li>
          <li>Cumprir obrigações legais de transparência e prestação de contas;</li>
          <li>Garantir a segurança e o funcionamento adequado do portal.</li>
        </ul>
        <p>
          O tratamento fundamenta-se nas bases legais do art. 7º da LGPD, em especial o{" "}
          <strong>cumprimento de obrigação legal ou regulatória</strong> (inciso II) e a{" "}
          <strong>execução de políticas públicas</strong> (inciso III), além do consentimento
          do titular quando aplicável.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    title: "Compartilhamento de dados",
    icon: Share2,
    body: (
      <>
        <p>
          <strong>A Câmara Municipal de Sumé não vende, aluga nem comercializa dados pessoais
          em nenhuma hipótese.</strong>
        </p>
        <p>O compartilhamento ocorre somente quando:</p>
        <ul>
          <li>For necessário para responder à sua solicitação (ex.: encaminhamento interno de
          um pedido de informação ao setor competente);</li>
          <li>Houver determinação legal ou judicial;</li>
          <li>For exigido por órgãos de controle (Tribunal de Contas, Ministério Público) no
          exercício de suas atribuições.</li>
        </ul>
        <p>
          Informações publicadas no Portal da Transparência por exigência legal (como nomes de
          agentes públicos e atos oficiais) seguem o princípio da publicidade da administração
          pública e não se confundem com dados fornecidos em formulários.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    icon: Cookie,
    body: (
      <>
        <p>
          Este portal utiliza apenas <strong>cookies essenciais de sessão</strong>, necessários
          ao funcionamento do site — por exemplo, para manter preferências de acessibilidade
          (alto contraste, tamanho de fonte) e a sessão de usuários autorizados do painel
          administrativo.
        </p>
        <ul>
          <li>Não utilizamos cookies de publicidade ou de rastreamento comercial;</li>
          <li>Não vendemos nem compartilhamos dados de navegação com anunciantes;</li>
          <li>Você pode bloquear ou excluir cookies nas configurações do seu navegador — o
          portal continuará acessível, podendo apenas perder preferências salvas.</li>
        </ul>
      </>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos (LGPD)",
    icon: UserCheck,
    body: (
      <>
        <p>
          Nos termos do art. 18 da Lei nº 13.709/2018, você, titular de dados pessoais, pode
          solicitar a qualquer momento:
        </p>
        <ul>
          <li><strong>Confirmação</strong> da existência de tratamento dos seus dados;</li>
          <li><strong>Acesso</strong> aos dados que mantemos sobre você;</li>
          <li><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados;</li>
          <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou
          tratados em desconformidade com a lei;</li>
          <li><strong>Informação</strong> sobre o compartilhamento dos seus dados;</li>
          <li><strong>Revogação do consentimento</strong>, quando esta for a base legal do
          tratamento.</li>
        </ul>
        <p>
          As solicitações são gratuitas e serão respondidas nos prazos previstos na LGPD,
          observadas as hipóteses legais de conservação de dados pela administração pública.
        </p>
      </>
    ),
  },
  {
    id: "contato-dpo",
    title: "Contato do encarregado (DPO)",
    icon: Mail,
    body: (
      <>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em
          contato com o Encarregado pelo Tratamento de Dados Pessoais (DPO) da Câmara
          Municipal de Sumé:
        </p>
        <ul>
          <li>
            <strong>Ouvidoria:</strong> <a href="/ouvidoria">formulário eletrônico da Ouvidoria</a>;
          </li>
          <li>
            <strong>E-mail:</strong>{" "}
            <a href="mailto:contato@camaradesume.pb.gov.br">contato@camaradesume.pb.gov.br</a>;
          </li>
          <li>
            <strong>Presencialmente:</strong> Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB,
            de segunda a sexta, das 8h às 14h.
          </li>
        </ul>
        <p>
          Caso entenda que seus direitos não foram atendidos, você também pode peticionar à
          Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyIndex({ content }: Props) {
  return (
    <>
      <SeoHead title="Política de Privacidade - Câmara Municipal de Sumé" description="Conheça nossa política de privacidade e como tratamos seus dados pessoais, em conformidade com a LGPD." url="/politica-de-privacidade" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Política de Privacidade" }]} />
        <PageHero badge="LGPD" title="Política de Privacidade" subtitle="Em conformidade com a Lei Geral de Proteção de Dados — Lei nº 13.709/2018" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                {content ? (
                  <article className="card-modern !transform-none p-6 md:p-10">
                    <div className={PROSE} dangerouslySetInnerHTML={{ __html: content }} />
                  </article>
                ) : (
                  <>
                    {/* Introdução + data de atualização */}
                    <div className="card-modern !transform-none p-6 md:p-8 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm md:text-[15px] leading-relaxed m-0">
                            A Câmara Municipal de Sumé está comprometida com a proteção da
                            privacidade e dos dados pessoais de todos os cidadãos que utilizam
                            este portal. Esta política explica, de forma transparente, quais
                            dados coletamos, por que coletamos, com quem podemos compartilhá-los
                            e como você pode exercer seus direitos garantidos pela LGPD.
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mt-3 mb-0">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Última atualização: {LAST_UPDATED}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8 lg:items-start">
                      {/* Sumário lateral (desktop) */}
                      <nav aria-label="Sumário da política" className="hidden lg:block sticky top-24">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          <ScrollText className="w-3.5 h-3.5" /> Nesta página
                        </p>
                        <ul className="space-y-1 text-sm border-l border-border/60">
                          {SECTIONS.map((s) => (
                            <li key={s.id}>
                              <a
                                href={`#${s.id}`}
                                className="block pl-3 py-1 -ml-px border-l border-transparent text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors no-underline"
                              >
                                {s.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>

                      {/* Seções */}
                      <div className="space-y-6">
                        {SECTIONS.map((s, i) => {
                          const Icon = s.icon;
                          return (
                            <article key={s.id} id={s.id} className="card-modern !transform-none p-6 md:p-8 scroll-mt-24">
                              <header className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-[18px] h-[18px] text-primary" />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-foreground m-0">
                                  <span className="text-primary/60 mr-1.5">{i + 1}.</span>
                                  {s.title}
                                </h2>
                              </header>
                              <div className={PROSE}>{s.body}</div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
