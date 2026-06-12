/**
 * Matriz de critérios PNTP/ATRICON 2026 aplicável ao Poder Legislativo Municipal.
 * Fonte: Cartilha PNTP 2026 (Atricon) — Matriz Comum (72 critérios) + Matriz
 * Específica do Poder Legislativo (11 critérios) = 83 critérios.
 *
 * Classificação: essencial (peso 2) | obrigatoria (peso 1,5) | recomendada (peso 1).
 * Itens de verificação: disponibilidade, atualidade, série histórica,
 * gravação de relatórios e filtro de pesquisa (variam por critério).
 */

export type AtriconClassification = 'essencial' | 'obrigatoria' | 'recomendada'

export type AtriconStatusValue = 'atendido' | 'parcial' | 'pendente' | 'externo' | 'nao_se_aplica'

export interface AtriconDimension {
  key: string
  label: string
  weight: number
}

export interface AtriconCriterion {
  code: string
  dimension: string
  title: string
  classification: AtriconClassification
  /** Itens de verificação exigidos (D=disponibilidade, A=atualidade, H=série histórica, G=gravação de relatórios, F=filtro de pesquisa) */
  verification: string[]
  /** Orientação rápida de como atender no portal */
  hint: string
  /** Onde a informação vive (ou deve viver) no portal */
  route?: string
  /** Critério atendido por sistema externo contratado (e-SIC/Ouvidoria) */
  external?: boolean
  /** Auto-detecção: chave verificada pelo controller contra os dados do sistema */
  autoCheck?: string
  /** Palavras-chave para localizar links da transparência que evidenciam o critério */
  keywords?: string[]
  /** Deep-link do módulo do painel que resolve o critério (sobrepõe o mapa por autoCheck) */
  actionHref?: string
}

export const ATRICON_DIMENSIONS: AtriconDimension[] = [
  { key: 'prioritarias', label: 'Informações Prioritárias', weight: 2 },
  { key: 'institucionais', label: 'Informações Institucionais', weight: 2 },
  { key: 'receita', label: 'Receita', weight: 4 },
  { key: 'despesa', label: 'Despesa', weight: 4 },
  { key: 'convenios', label: 'Convênios e Transferências', weight: 1 },
  { key: 'rh', label: 'Recursos Humanos', weight: 3 },
  { key: 'diarias', label: 'Diárias', weight: 1 },
  { key: 'licitacoes', label: 'Licitações', weight: 3 },
  { key: 'contratos', label: 'Contratos', weight: 3 },
  { key: 'obras', label: 'Obras', weight: 2 },
  { key: 'planejamento', label: 'Planejamento e Prestação de Contas', weight: 4 },
  { key: 'sic', label: 'Serviço de Informação ao Cidadão (SIC)', weight: 2 },
  { key: 'acessibilidade', label: 'Acessibilidade', weight: 1 },
  { key: 'ouvidoria', label: 'Ouvidoria e Carta de Serviços', weight: 1 },
  { key: 'lgpd', label: 'LGPD e Governo Digital', weight: 1 },
  { key: 'legislativo', label: 'Atividades Finalísticas — Legislativo', weight: 3 },
]

const D = 'Disponibilidade'
const A = 'Atualidade (até 30 dias)'
const H = 'Série histórica (3 anos)'
const G = 'Gravação de relatórios'
const F = 'Filtro de pesquisa'

export const ATRICON_CRITERIA: AtriconCriterion[] = [
  // 1. Informações Prioritárias
  {
    code: '1.1',
    dimension: 'prioritarias',
    title: 'Possui sítio oficial próprio na internet?',
    classification: 'essencial',
    verification: [D],
    hint: 'O portal próprio da Câmara já atende. Critério prejudicial: sem site, índice = 0.',
    route: '/',
    autoCheck: 'always',
  },
  {
    code: '1.2',
    dimension: 'prioritarias',
    title: 'Possui portal da transparência próprio ou compartilhado na internet?',
    classification: 'essencial',
    verification: [D],
    hint: 'Seção "Transparência" do portal com conteúdo mínimo de transparência ativa e passiva.',
    route: '/transparencia',
    autoCheck: 'transparency',
  },
  {
    code: '1.3',
    dimension: 'prioritarias',
    title: 'O acesso ao portal transparência está visível na capa do site?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Link "Transparência" no menu principal/capa, acessível com 1 clique.',
    route: '/',
    autoCheck: 'always',
  },
  {
    code: '1.4',
    dimension: 'prioritarias',
    title: 'O site e o portal de transparência contêm ferramenta de pesquisa de conteúdo?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Busca geral visível na capa, com resultados relevantes independentes de acentos/maiúsculas.',
    route: '/busca',
  },

  // 2. Informações Institucionais
  {
    code: '2.1',
    dimension: 'institucionais',
    title: 'Divulga a estrutura organizacional e a norma que a institui/altera?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Composição da Mesa Diretora e unidades setoriais + íntegra da norma (organograma).',
    route: '/mesa-diretora',
    autoCheck: 'mesaDiretora',
    keywords: ['estrutura organizacional', 'organograma'],
  },
  {
    code: '2.2',
    dimension: 'institucionais',
    title: 'Divulga competências e/ou atribuições?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Descrição das competências da Mesa Diretora, junto da estrutura organizacional.',
    route: '/mesa-diretora',
    autoCheck: 'mesaDiretora',
    keywords: ['competências', 'atribuições'],
  },
  {
    code: '2.3',
    dimension: 'institucionais',
    title: 'Identifica o nome dos atuais responsáveis pela gestão?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Integrantes da Mesa Diretora e vereadores identificados nominalmente.',
    route: '/vereadores',
    autoCheck: 'councilors',
  },
  {
    code: '2.4',
    dimension: 'institucionais',
    title: 'Divulga endereços, telefones atuais e e-mails institucionais?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Endereço, telefone e e-mail da Casa no rodapé/contato (configurável em Aparência).',
    route: '/fale-conosco',
    autoCheck: 'contactSettings',
  },
  {
    code: '2.5',
    dimension: 'institucionais',
    title: 'Divulga o horário de atendimento?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Horário de expediente da Casa Legislativa visível no site.',
    route: '/fale-conosco',
    autoCheck: 'hoursSettings',
  },
  {
    code: '2.6',
    dimension: 'institucionais',
    title: 'Divulga os atos normativos próprios?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Resoluções, portarias e demais atos em seção própria, com filtro por tipo, ano e palavra-chave.',
    route: '/publicacoes',
    autoCheck: 'publications',
    keywords: ['atos normativos', 'legislação', 'leis municipais'],
  },
  {
    code: '2.7',
    dimension: 'institucionais',
    title: 'Divulga perguntas e respostas mais frequentes (FAQ)?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Seção "Perguntas Frequentes" sobre as atividades da Câmara.',
    route: '/perguntas-frequentes',
    autoCheck: 'faq',
  },
  {
    code: '2.8',
    dimension: 'institucionais',
    title: 'Participa de redes sociais e divulga link de acesso ao perfil?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Links das redes sociais na página principal (configurável em Aparência).',
    route: '/',
    autoCheck: 'socialSettings',
  },
  {
    code: '2.9',
    dimension: 'institucionais',
    title: 'Inclui botão do Radar da Transparência Pública no site?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Link "Radar da Transparência Pública" → https://radardatransparencia.atricon.org.br/ em local de fácil acesso (1º nível).',
    route: '/',
    autoCheck: 'radarLink',
    keywords: ['radar da transparência'],
  },

  // 3. Receita
  {
    code: '3.1',
    dimension: 'receita',
    title: 'Divulga as receitas (duodécimos), evidenciando previsão e realização?',
    classification: 'essencial',
    verification: [D, A, H, G, F],
    hint: 'Duodécimos fixados e recebidos mês a mês, em página/arquivo único, com filtros por exercício e mês. Geralmente via portal de transparência do sistema contábil.',
    route: '/transparencia',
    keywords: ['receita', 'duodécimo', 'repasse'],
  },

  // 4. Despesa
  {
    code: '4.1',
    dimension: 'despesa',
    title: 'Divulga o total das despesas empenhadas, liquidadas e pagas?',
    classification: 'essencial',
    verification: [D, A, H, G, F],
    hint: 'Totais de empenho, liquidação e pagamento em página única, com filtros por exercício/mês.',
    route: '/transparencia',
    keywords: ['despesa', 'empenho'],
  },
  {
    code: '4.2',
    dimension: 'despesa',
    title: 'Divulga as despesas por classificação orçamentária?',
    classification: 'essencial',
    verification: [D, A, H, G, F],
    hint: 'Unidade orçamentária, função, subfunção, natureza e fonte de recursos.',
    route: '/transparencia',
    keywords: ['despesa', 'classificação orçamentária'],
  },
  {
    code: '4.3',
    dimension: 'despesa',
    title: 'Possibilita consulta de empenhos com credor, valor, objeto e licitação originária?',
    classification: 'essencial',
    verification: [D, A, H, G, F],
    hint: 'Detalhamento individualizado do empenho com beneficiário, objeto e nº do procedimento licitatório.',
    route: '/transparencia',
    keywords: ['empenho', 'credor'],
  },

  // 5. Convênios e Transferências
  {
    code: '5.1',
    dimension: 'convenios',
    title: 'Divulga as transferências recebidas via convênios/acordos?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Nº/ano, valor previsto e recebido, objeto, vigência, origem e inteiro teor. Se não houver, declarar expressamente a inexistência.',
    route: '/transparencia',
    autoCheck: 'info:transferencias-recebidas',
    keywords: ['convênio', 'transferências recebidas'],
  },
  {
    code: '5.2',
    dimension: 'convenios',
    title: 'Divulga as transferências realizadas via convênios/acordos/ajustes?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Beneficiário, nº/ano, objeto, vigência, valores e inteiro teor, separado das recebidas.',
    route: '/transparencia',
    autoCheck: 'info:transferencias-realizadas',
    keywords: ['convênio', 'transferências realizadas'],
  },
  {
    code: '5.3',
    dimension: 'convenios',
    title: 'Divulga acordos firmados sem transferência de recursos?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Partes, nº/ano, objeto, vigência, obrigações e inteiro teor. Declarar inexistência quando for o caso.',
    route: '/transparencia',
    autoCheck: 'info:acordos',
    keywords: ['acordos', 'termo de cooperação'],
  },

  // 6. Recursos Humanos
  {
    code: '6.1',
    dimension: 'rh',
    title: 'Divulga relação nominal dos servidores com cargo, lotação, admissão e carga horária?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Tabela HTML com nome, cargo/função, lotação, datas de admissão/exoneração e carga horária.',
    route: '/transparencia',
    keywords: ['servidores', 'relação de servidores', 'pessoal'],
  },
  {
    code: '6.2',
    dimension: 'rh',
    title: 'Divulga a remuneração nominal de cada servidor/agente?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Relação aberta (sem exigir CPF/cadastro) com nome, cargo e remuneração.',
    route: '/transparencia',
    keywords: ['remuneração', 'folha de pagamento', 'salário'],
  },
  {
    code: '6.3',
    dimension: 'rh',
    title: 'Divulga tabela com o padrão remuneratório dos cargos e funções?',
    classification: 'obrigatoria',
    verification: [D, A],
    hint: 'Faixas salariais por cargo/função, conforme legislação atualizada.',
    route: '/transparencia',
    keywords: ['padrão remuneratório', 'tabela salarial', 'plano de cargos'],
  },
  {
    code: '6.4',
    dimension: 'rh',
    title: 'Divulga a lista de estagiários com datas de contratação e término?',
    classification: 'recomendada',
    verification: [D, A, H, G, F],
    hint: 'Nome, data de contratação e término. Se não houver, declarar expressamente por exercício.',
    route: '/transparencia',
    autoCheck: 'info:estagiarios',
    keywords: ['estagiários'],
  },
  {
    code: '6.5',
    dimension: 'rh',
    title: 'Publica lista dos terceirizados (nome, função e empresa)?',
    classification: 'recomendada',
    verification: [D, A, H, G, F],
    hint: 'Nome completo, função/atividade e razão social da empregadora. Declarar inexistência quando for o caso.',
    route: '/transparencia',
    autoCheck: 'info:terceirizados',
    keywords: ['terceirizados'],
  },
  {
    code: '6.6',
    dimension: 'rh',
    title: 'Divulga a íntegra dos editais de concursos e seleções públicas?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Íntegra dos editais. Sem concursos recentes, informar expressamente (ex.: "último certame em 20XX").',
    route: '/transparencia',
    autoCheck: 'info:concursos',
    keywords: ['concurso', 'seleção pública', 'processo seletivo'],
  },
  {
    code: '6.7',
    dimension: 'rh',
    title: 'Divulga demais atos dos concursos (lista de aprovados, classificações e nomeações)?',
    classification: 'obrigatoria',
    verification: [D, A, F],
    hint: 'Lista de aprovados com classificações e nomeações; aceita link para site da banca.',
    route: '/transparencia',
    autoCheck: 'info:concursos',
    keywords: ['concurso', 'nomeações', 'aprovados'],
  },

  // 7. Diárias
  {
    code: '7.1',
    dimension: 'diarias',
    title: 'Divulga diárias com beneficiário, cargo, valor, período, motivo e destino?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Seção específica de diárias (não basta o detalhamento da despesa). Declarar inexistência quando for o caso.',
    route: '/transparencia',
    keywords: ['diárias'],
  },
  {
    code: '7.2',
    dimension: 'diarias',
    title: 'Divulga tabela de valores das diárias (dentro/fora do Estado e exterior)?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Tabela da legislação local na seção de diárias. Sem previsão de diária internacional? Informar expressamente.',
    route: '/transparencia',
    keywords: ['tabela de diárias', 'valores de diárias'],
  },

  // 8. Licitações
  {
    code: '8.1',
    dimension: 'licitacoes',
    title: 'Divulga relação das licitações com número, modalidade, objeto, data, valor e situação?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Listagem sequencial incluindo dispensas e inexigibilidades, com filtros por ano, situação e modalidade.',
    route: '/licitacoes',
    autoCheck: 'licitacoes',
  },
  {
    code: '8.2',
    dimension: 'licitacoes',
    title: 'Divulga a íntegra dos editais de licitação?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Anexar o edital (tipo EDITAL) em cada processo licitatório no módulo de licitações.',
    route: '/licitacoes',
    autoCheck: 'licitacaoDocs',
  },
  {
    code: '8.3',
    dimension: 'licitacoes',
    title: 'Divulga a íntegra dos demais documentos das fases interna e externa?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'TR/projeto básico, justificativa, pareceres, orçamento, atas, recursos, adjudicação e homologação — em PDF pesquisável.',
    route: '/licitacoes',
    autoCheck: 'licitacaoDocs',
  },
  {
    code: '8.4',
    dimension: 'licitacoes',
    title: 'Divulga documentos dos processos de dispensa e inexigibilidade?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'TR, justificativa da escolha/preço, pareceres e ratificação (exceto compras diretas de pequeno valor).',
    route: '/licitacoes',
    autoCheck: 'licitacaoDocs',
  },
  {
    code: '8.5',
    dimension: 'licitacoes',
    title: 'Divulga a íntegra das Atas de Adesão – SRP (caronas)?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Atas de registro de preços aderidas de outros órgãos. Declarar inexistência quando for o caso.',
    route: '/licitacoes',
    keywords: ['ata de adesão', 'registro de preços', 'srp'],
  },
  {
    code: '8.6',
    dimension: 'licitacoes',
    title: 'Divulga o plano de contratações anual (PCA)?',
    classification: 'recomendada',
    verification: [D, A],
    hint: 'Publicar o PCA na seção de licitações. Declaração de inexistência NÃO atende este critério.',
    route: '/licitacoes',
    autoCheck: 'info:pca',
    keywords: ['plano de contratações', 'pca'],
  },
  {
    code: '8.7',
    dimension: 'licitacoes',
    title: 'Divulga relação dos licitantes/contratados sancionados?',
    classification: 'recomendada',
    verification: [D, A, H, G, F],
    hint: 'Nomes dos sancionados (art. 156, III e IV, Lei 14.133/2021). Declarar inexistência quando for o caso.',
    route: '/transparencia',
    keywords: ['sancionados', 'sanções'],
  },

  // 9. Contratos
  {
    code: '9.1',
    dimension: 'contratos',
    title: 'Divulga relação dos contratos com contratado, valor, objeto, vigência e aditivos?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Seção específica de contratos em ordem sequencial com resumo.',
    route: '/transparencia',
    keywords: ['contratos'],
  },
  {
    code: '9.2',
    dimension: 'contratos',
    title: 'Divulga o inteiro teor dos contratos e termos aditivos?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Íntegras dos contratos e aditivos (PDF pesquisável). Pode usar o tipo CONTRATO nas licitações.',
    route: '/licitacoes',
    autoCheck: 'contratoDocs',
    keywords: ['contratos', 'inteiro teor'],
  },
  {
    code: '9.3',
    dimension: 'contratos',
    title: 'Divulga relação/lista dos fiscais de cada contrato vigente e encerrado?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Relação consolidada de fiscais com os contratos sob sua responsabilidade (não basta constar só no detalhe).',
    route: '/transparencia',
    keywords: ['fiscais de contrato'],
  },
  {
    code: '9.4',
    dimension: 'contratos',
    title: 'Divulga a ordem cronológica de pagamentos e justificativas de alteração?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Lista mensal de créditos com vencimento, pagamento, credor e valor, por categoria contratual.',
    route: '/transparencia',
    keywords: ['ordem cronológica', 'pagamentos'],
  },

  // 10. Obras
  {
    code: '10.1',
    dimension: 'obras',
    title: 'Divulga obras com objeto, situação, datas, contratada e percentual concluído?',
    classification: 'recomendada',
    verification: [D, A, G, F],
    hint: 'Tabela de obras em seção específica. Sem obras? Informar expressamente no portal.',
    route: '/transparencia',
    autoCheck: 'info:obras',
    keywords: ['obras'],
  },
  {
    code: '10.2',
    dimension: 'obras',
    title: 'Divulga quantitativos, preços unitários e totais contratados das obras?',
    classification: 'obrigatoria',
    verification: [D, A, G],
    hint: 'Planilha contratual (quantitativos × preços unitários) em até 25 dias úteis da assinatura. Declarar inexistência quando for o caso.',
    route: '/transparencia',
    autoCheck: 'info:obras',
    keywords: ['obras', 'preços unitários'],
  },
  {
    code: '10.3',
    dimension: 'obras',
    title: 'Divulga quantitativos executados e preços efetivamente pagos?',
    classification: 'obrigatoria',
    verification: [D, A, G],
    hint: 'Itens executados e valores pagos por obra encerrada. Declarar inexistência quando for o caso.',
    route: '/transparencia',
    autoCheck: 'info:obras',
    keywords: ['obras', 'medições'],
  },
  {
    code: '10.4',
    dimension: 'obras',
    title: 'Divulga relação das obras paralisadas (motivo, responsável e previsão de reinício)?',
    classification: 'obrigatoria',
    verification: [D, A, G, F],
    hint: 'Sem obras paralisadas (ou sem obras), declarar expressamente.',
    route: '/transparencia',
    autoCheck: 'info:obras',
    keywords: ['obras paralisadas'],
  },

  // 11. Planejamento e Prestação de Contas
  {
    code: '11.1',
    dimension: 'planejamento',
    title: 'Publica a Prestação de Contas do Ano Anterior (Balanço Geral)?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Balanço Orçamentário, Financeiro, Patrimonial e DVP em PDF pesquisável.',
    route: '/transparencia',
    autoCheck: 'info:prestacao-contas',
    keywords: ['balanço geral', 'prestação de contas'],
  },
  {
    code: '11.2',
    dimension: 'planejamento',
    title: 'Divulga o Relatório de Gestão ou Atividades?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Relatório consolidado anual da gestão (metas, entregas, resultados). Notícias soltas NÃO atendem.',
    route: '/transparencia',
    autoCheck: 'info:relatorio-gestao',
    keywords: ['relatório de gestão', 'relatório de atividades'],
  },
  {
    code: '11.3',
    dimension: 'planejamento',
    title: 'Divulga a íntegra da decisão de apreciação/julgamento das contas pelo TCE?',
    classification: 'obrigatoria',
    verification: [D, A, H],
    hint: 'Íntegra do Acórdão/Parecer do Tribunal de Contas (aceita link direto ao site do TCE) e indicação das contas pendentes.',
    route: '/transparencia',
    autoCheck: 'info:parecer-contas',
    keywords: ['julgamento das contas', 'parecer prévio', 'acórdão'],
  },
  {
    code: '11.5',
    dimension: 'planejamento',
    title: 'Divulga o Relatório de Gestão Fiscal (RGF)?',
    classification: 'essencial',
    verification: [D, A, H, F],
    hint: 'RGF com todos os anexos, em seção específica. Municípios até 50 mil hab.: semestral (até 30 dias após o semestre).',
    route: '/transparencia',
    autoCheck: 'info:rgf',
    keywords: ['rgf', 'gestão fiscal'],
  },
  {
    code: '11.7',
    dimension: 'planejamento',
    title: 'Divulga o plano estratégico institucional?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Plano com objetivos estratégicos, indicadores e metas (difere do PPA).',
    route: '/transparencia',
    autoCheck: 'info:plano-estrategico',
    keywords: ['plano estratégico'],
  },

  // 12. SIC / e-SIC — atendido por sistema externo
  {
    code: '12.1',
    dimension: 'sic',
    title: 'Existe o SIC no site e indica a unidade/setor responsável?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Indicar no portal a unidade responsável pelo SIC físico.',
    route: '/acesso-a-informacao',
    external: true,
  },
  {
    code: '12.2',
    dimension: 'sic',
    title: 'Indica endereço, telefone, e-mail e horário da unidade do SIC?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Dados completos do SIC físico no portal.',
    route: '/acesso-a-informacao',
    external: true,
  },
  {
    code: '12.3',
    dimension: 'sic',
    title: 'Há possibilidade de envio de pedidos de informação eletrônicos (e-SIC)?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Formulário e-SIC do sistema externo, com link destacado no portal.',
    route: '/acesso-a-informacao',
    external: true,
  },
  {
    code: '12.4',
    dimension: 'sic',
    title: 'A solicitação pelo e-SIC é simples (sem exigências que dificultem o acesso)?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Sem exigência de documentos, assinatura reconhecida ou maioridade no sistema externo.',
    route: '/acesso-a-informacao',
    external: true,
  },
  {
    code: '12.5',
    dimension: 'sic',
    title: 'Divulga instrumento normativo local que regulamenta a LAI?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Ato normativo local (lei/decreto/resolução) que regulamenta a Lei 12.527/2011, em local visível.',
    route: '/acesso-a-informacao',
    keywords: ['regulamenta', 'lai', 'lei de acesso'],
  },
  {
    code: '12.6',
    dimension: 'sic',
    title: 'Divulga prazos de resposta, autoridades competentes e procedimento de recurso?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Prazos (inclusive recursal) e autoridades na seção do e-SIC.',
    route: '/acesso-a-informacao',
    external: true,
  },
  {
    code: '12.7',
    dimension: 'sic',
    title: 'Divulga relatório anual estatístico de pedidos de acesso?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Quantidade de pedidos recebidos/atendidos/indeferidos + perfil genérico dos solicitantes (pode ser do sistema externo).',
    route: '/acesso-a-informacao',
    external: true,
  },
  {
    code: '12.8',
    dimension: 'sic',
    title: 'Divulga lista de documentos classificados em cada grau de sigilo?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Assunto, categoria, fundamento legal e prazo. Sem documentos classificados? Declarar expressamente.',
    route: '/acesso-a-informacao',
    keywords: ['documentos classificados', 'sigilo'],
  },
  {
    code: '12.9',
    dimension: 'sic',
    title: 'Divulga lista das informações desclassificadas nos últimos 12 meses?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Sem informações desclassificadas? Declarar expressamente na seção de transparência.',
    route: '/acesso-a-informacao',
    keywords: ['desclassificadas'],
  },

  // 13. Acessibilidade
  {
    code: '13.1',
    dimension: 'acessibilidade',
    title: 'Site e portal de transparência contêm símbolo de acessibilidade em destaque?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Símbolo de acessibilidade visível (barra de acessibilidade do portal).',
    route: '/',
    autoCheck: 'always',
  },
  {
    code: '13.2',
    dimension: 'acessibilidade',
    title: 'Exibe o "caminho" de páginas percorridas (breadcrumb)?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Breadcrumbs nas páginas internas do portal.',
    route: '/',
    autoCheck: 'always',
  },
  {
    code: '13.3',
    dimension: 'acessibilidade',
    title: 'Contém opção de alto contraste?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Botão de alto contraste na barra de acessibilidade.',
    route: '/',
    autoCheck: 'always',
  },
  {
    code: '13.4',
    dimension: 'acessibilidade',
    title: 'Contém ferramenta de redimensionamento de texto?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Botões A+/A- na barra de acessibilidade.',
    route: '/',
    autoCheck: 'always',
  },
  {
    code: '13.5',
    dimension: 'acessibilidade',
    title: 'Contém mapa do site institucional?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Página "Mapa do Site" linkada no rodapé.',
    route: '/mapa-do-site',
  },

  // 14. Ouvidoria e Carta de Serviços
  {
    code: '14.1',
    dimension: 'ouvidoria',
    title: 'Há informações sobre o atendimento presencial pela Ouvidoria?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Endereço físico, telefone e horário de funcionamento da Ouvidoria no portal.',
    route: '/ouvidoria',
    external: true,
  },
  {
    code: '14.2',
    dimension: 'ouvidoria',
    title: 'Há canal eletrônico de acesso/interação com a Ouvidoria?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Canal para sugestão, elogio, solicitação, reclamação e denúncia (sistema externo).',
    route: '/ouvidoria',
    external: true,
  },
  {
    code: '14.3',
    dimension: 'ouvidoria',
    title: 'Divulga Carta de Serviços ao Usuário?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Seção "Carta de Serviços ao Usuário" com serviços, formas de acesso, etapas e prazos.',
    route: '/transparencia',
    autoCheck: 'info:carta-servicos',
    keywords: ['carta de serviços'],
  },

  // 15. LGPD e Governo Digital
  {
    code: '15.1',
    dimension: 'lgpd',
    title: 'Identifica o encarregado (DPO) e disponibiliza canal de comunicação?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Nome do encarregado pelo tratamento de dados + telefone/e-mail, em seção LGPD.',
    route: '/transparencia',
    keywords: ['encarregado', 'dpo', 'lgpd'],
  },
  {
    code: '15.2',
    dimension: 'lgpd',
    title: 'Publica a Política de Privacidade e Proteção de Dados?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Política de privacidade publicada no portal.',
    route: '/transparencia',
    keywords: ['política de privacidade', 'proteção de dados'],
  },
  {
    code: '15.3',
    dimension: 'lgpd',
    title: 'Possibilita demanda e acesso a serviços públicos por meio digital?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Para o Legislativo: envio de sugestões legislativas e acompanhamento de proposições online.',
    route: '/fale-conosco',
  },
  {
    code: '15.4',
    dimension: 'lgpd',
    title: 'Possibilita acesso automatizado em dados abertos com regras de utilização?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'Pelo menos um conjunto de dados legível por máquina (CSV/JSON) + página com regras de utilização.',
    route: '/dados-abertos',
    keywords: ['dados abertos'],
  },
  {
    code: '15.5',
    dimension: 'lgpd',
    title: 'Regulamenta a Lei 14.129/2021 (Governo Digital) e divulga a normativa?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Norma local regulamentando o Governo Digital, em local de fácil acesso.',
    route: '/transparencia',
    keywords: ['governo digital', '14.129'],
  },
  {
    code: '15.6',
    dimension: 'lgpd',
    title: 'Realiza e divulga resultados de pesquisas de satisfação?',
    classification: 'obrigatoria',
    verification: [D],
    hint: 'O módulo de Pesquisa de Satisfação do portal atende — mantenha pesquisa ativa e resultados publicados.',
    route: '/pesquisa-de-satisfacao',
    autoCheck: 'survey',
  },

  // 20. Atividades Finalísticas — Poder Legislativo
  {
    code: '20.1',
    dimension: 'legislativo',
    title: 'Divulga a composição da Casa, com a biografia dos parlamentares?',
    classification: 'obrigatoria',
    verification: [D, A],
    hint: 'Página de vereadores com foto, partido e biografia de cada parlamentar.',
    route: '/vereadores',
    autoCheck: 'councilors',
  },
  {
    code: '20.2',
    dimension: 'legislativo',
    title: 'Divulga as leis e atos infralegais produzidos?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Leis, resoluções e decretos legislativos com busca por número, data e palavra-chave.',
    route: '/publicacoes',
    autoCheck: 'publications',
    keywords: ['leis municipais', 'legislação'],
  },
  {
    code: '20.3',
    dimension: 'legislativo',
    title: 'Divulga projetos de leis/atos e respectivas tramitações?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Ementa, anexos, situação atual e autor/relator de cada proposição.',
    route: '/atividades-legislativas',
    autoCheck: 'activities',
  },
  {
    code: '20.4',
    dimension: 'legislativo',
    title: 'Divulga a pauta das sessões do Plenário?',
    classification: 'obrigatoria',
    verification: [D, A, G, F],
    hint: 'Pautas publicadas antes das sessões, com download em PDF pesquisável.',
    route: '/pautas',
    autoCheck: 'pautas',
  },
  {
    code: '20.5',
    dimension: 'legislativo',
    title: 'Divulga a pauta das Comissões?',
    classification: 'obrigatoria',
    verification: [D, A, G, F],
    hint: 'Pautas das comissões (aceita pauta conjunta com atividades explicitadas).',
    route: '/comissoes',
    autoCheck: 'committees',
  },
  {
    code: '20.6',
    dimension: 'legislativo',
    title: 'Divulga as atas das sessões, incluindo lista de presença?',
    classification: 'obrigatoria',
    verification: [D, A, H, G, F],
    hint: 'Atas do Plenário com lista de presença dos parlamentares, em PDF pesquisável.',
    route: '/atas',
    autoCheck: 'atas',
  },
  {
    code: '20.7',
    dimension: 'legislativo',
    title: 'Divulga lista sobre as votações nominais?',
    classification: 'recomendada',
    verification: [D, A, H, G, F],
    hint: 'Lista nominal de votação dos projetos (votações unânimes dispensam a lista). Use o módulo Votações Nominais do painel — cadastro manual ou importação das atas via IA.',
    route: '/votacoes',
    autoCheck: 'votacoes',
  },
  {
    code: '20.8',
    dimension: 'legislativo',
    title: 'Divulga o ato que aprecia as Contas do Prefeito e o teor do julgamento?',
    classification: 'obrigatoria',
    verification: [D, A, H, F],
    hint: 'Decreto legislativo + ata/resumo da sessão que aprovou ou rejeitou as contas do Executivo.',
    route: '/transparencia',
    autoCheck: 'info:apreciacao',
    keywords: ['julgamento das contas do prefeito', 'contas do executivo', 'decreto legislativo'],
  },
  {
    code: '20.9',
    dimension: 'legislativo',
    title: 'Há transmissão de sessões e audiências públicas (rádio, TV, internet)?',
    classification: 'recomendada',
    verification: [D],
    hint: 'Transmissão ao vivo (ex.: YouTube/Facebook) divulgada no portal, com link nas sessões.',
    route: '/sessoes',
  },
  {
    code: '20.10',
    dimension: 'legislativo',
    title: 'Divulga regulamentação e valores das cotas parlamentares/verba indenizatória?',
    classification: 'recomendada',
    verification: [D, A, H, G, F],
    hint: 'Norma + gastos detalhados por vereador. Sem verba indenizatória? Declarar expressamente.',
    route: '/transparencia',
    autoCheck: 'info:verbas',
    keywords: ['verba indenizatória', 'cota parlamentar'],
  },
  {
    code: '20.11',
    dimension: 'legislativo',
    title: 'Divulga dados sobre as atividades legislativas dos parlamentares?',
    classification: 'recomendada',
    verification: [D, A, H, F],
    hint: 'Relatório por parlamentar: projetos propostos, relatorias, participação em comissões etc.',
    route: '/atividades-legislativas',
    autoCheck: 'activities',
  },
]

/** Peso do critério conforme classificação (metodologia PNTP). */
export const CLASSIFICATION_WEIGHT: Record<AtriconClassification, number> = {
  essencial: 2,
  obrigatoria: 1.5,
  recomendada: 1,
}

export const CLASSIFICATION_LABEL: Record<AtriconClassification, string> = {
  essencial: 'Essencial',
  obrigatoria: 'Obrigatória',
  recomendada: 'Recomendada',
}

export const STATUS_LABEL: Record<AtriconStatusValue, string> = {
  atendido: 'Atendido',
  parcial: 'Parcial',
  pendente: 'Pendente',
  externo: 'Sistema externo',
  nao_se_aplica: 'Não se aplica',
}

/** Crédito do status no cálculo do índice (atende = 1, parcial = 0,5). */
export const STATUS_CREDIT: Record<AtriconStatusValue, number | null> = {
  atendido: 1,
  parcial: 0.5,
  pendente: 0,
  externo: 1, // atendido via sistema externo (link no portal)
  nao_se_aplica: null, // excluído do cálculo
}

/**
 * Deep-link do módulo do painel que resolve cada autoCheck.
 * Critérios `info:*` são resolvidos no módulo Acesso à Informação.
 */
export const AUTO_CHECK_ACTION_HREF: Record<string, string> = {
  transparency: '/painel/transparencia',
  councilors: '/painel/vereadores',
  mesaDiretora: '/painel/bienios',
  contactSettings: '/painel/aparencia',
  hoursSettings: '/painel/aparencia',
  socialSettings: '/painel/aparencia',
  radarLink: '/painel/transparencia',
  publications: '/painel/publicacoes',
  faq: '/painel/faq',
  licitacoes: '/painel/licitacoes',
  licitacaoDocs: '/painel/licitacoes',
  contratoDocs: '/painel/licitacoes',
  atas: '/painel/sessoes',
  pautas: '/painel/sessoes',
  committees: '/painel/comissoes',
  activities: '/painel/atividades',
  survey: '/painel/pesquisa-satisfacao',
  votacoes: '/painel/votacoes',
}

/** Resolve o link de ação de um critério: actionHref explícito → mapa por autoCheck → transparência (keywords). */
export function criterionActionHref(c: AtriconCriterion): string | null {
  if (c.actionHref) return c.actionHref
  if (c.autoCheck) {
    if (c.autoCheck.startsWith('info:')) return '/painel/acesso-informacao'
    if (AUTO_CHECK_ACTION_HREF[c.autoCheck]) return AUTO_CHECK_ACTION_HREF[c.autoCheck]
  }
  if (c.keywords?.length) return '/painel/transparencia'
  return null
}

/** Níveis de transparência conforme metodologia PNTP 2026. */
export function transparencyLevel(index: number, allEssentialsMet: boolean): string {
  if (index >= 95 && allEssentialsMet) return 'Diamante'
  if (index >= 85 && allEssentialsMet) return 'Ouro'
  if (index >= 75 && allEssentialsMet) return 'Prata'
  if (index >= 75) return 'Elevado'
  if (index >= 50) return 'Intermediário'
  if (index >= 30) return 'Básico'
  return 'Inicial'
}
