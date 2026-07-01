/*
|--------------------------------------------------------------------------
| Redirects 301 — URLs do WordPress antigo
|--------------------------------------------------------------------------
|
| Os links do site WordPress foram submetidos na avaliação ATRICON/PNTP,
| então NENHUMA URL antiga pode quebrar (CLAUDE.md §11.4). Cada post type
| do WP é redirecionado para a rota equivalente do sistema novo.
|
| Não remover entradas sem garantir que a URL continua respondendo.
*/

import router from '@adonisjs/core/services/router'

/**
 * CPTs do WordPress cujos posts individuais agora vivem em listagens:
 * /rgf/rgf-1-quadrimestre-2023/ → /rgf, /verbas/verbas-2023/ → /verbas etc.
 */
const cptToListing: Record<string, string> = {
  // PNTP / acesso à informação (mesmo slug de categoria)
  rgf: '/relatorios-fiscais?tipo=RGF',
  rreo: '/relatorios-fiscais?tipo=RREO',
  estagiarios: '/estagiarios',
  terceirizados: '/terceirizados',
  verbas: '/verbas',
  obras: '/obras',
  acordos: '/acordos',
  apreciacao: '/apreciacao',
  concursos: '/concursos',
  pca: '/pca',
  'parecer-contas': '/parecer-contas',
  'plano-estrategico': '/plano-estrategico',
  // PNTP com slug de categoria diferente do CPT antigo
  relatoriogestao: '/relatorio-gestao',
  'prestacao-de-contas': '/prestacao-contas',
  transfrealizada: '/transferencias-realizadas',
  transfvoluntaria: '/transferencias-recebidas',
  'estrutura-organiza': '/estrutura-organizacional',
  'carta-de-servicos': '/carta-servicos',
  // Conteúdo que virou página única/seção
  historia: '/historia-da-camara',
  satisfacao: '/pesquisa-de-satisfacao',
  legislatura: '/vereadores',
  // /glossario/<letra>/ do WP antigo → módulo nativo de Glossário (rota real /glossario).
  // GET /glossario (sem slug) é rota real; aqui só o /glossario/:slug das letras antigas.
  glossario: '/glossario',
  perguntas: '/perguntas-frequentes',
  // 'transparencia' removido: GET /transparencia/:slug agora é rota real
  // (deep-link do modal); o controller redireciona slugs desconhecidos.
  // Internos do WP sem equivalente (manda para destino útil)
  'acesso-rapido': '/',
  'jet-popup': '/',
  author: '/noticias',
  '_tipo-transparencia': '/transparencia',
  '_ano_quadrimestre': '/transparencia',
  '_link-target': '/',
  'tipo-pagina': '/',
}

/** Páginas soltas do WP sem rota equivalente direta */
const pageRedirects: Record<string, string> = {
  'sample-page': '/',
  rgf: '/relatorios-fiscais?tipo=RGF',
  rreo: '/relatorios-fiscais?tipo=RREO',
  'indicacoes': '/atividades-legislativa',
  'listagem-dos-vereadores': '/vereadores',
  'listagem-das-legislaturas': '/vereadores',
  'fale-conosco': '/ouvidoria',
  // 'mapa-do-site' removido: agora é página real (/mapa-do-site)
  'convenios-e-transferencias': '/acordos',
  convenio: '/acordos',
  convenios: '/acordos',
  relatoriogestao: '/relatorio-gestao',
  'prestacao-de-contas': '/prestacao-contas',
  transfrealizada: '/transferencias-realizadas',
  transfvoluntaria: '/transferencias-recebidas',
  'transferencia-voluntaria': '/transferencias-recebidas',
  estrutura: '/estrutura-organizacional',
  'estrutura-organiza': '/estrutura-organizacional',
  'carta-de-servicos': '/carta-servicos',
  'plano-contratacao': '/pca',
  'plano-contratacoes': '/pca',
  'verbas-indenizatorias': '/verbas',
  'verbas-idenizatorias': '/verbas',
  'adesao-ata': '/adesao-ata-srp',
  'adesao-de-atas': '/adesao-ata-srp',
  'votacoes-nominais': '/votacoes',
  // Páginas PNTP com conteúdo próprio agora caem no catch-all dinâmico `/:slug`
  // (information_records). Não redirecionar para /transparencia, pois isso
  // quebra os cards/modal da transparência importados do WordPress.
  // 'ocp' removido: agora e pagina dinamica real de Acesso a Informacao (/ocp).
  // 'licitantes-sancionados' removido: pagina dinamica real.
  // 'fiscal-contrato' removido: pagina dinamica real.
  // 'aditivos' removido: pagina dinamica real.
  // 'despesas-mensais' removido: pagina dinamica real.
  // 'empenhos-detalhados' removido: pagina dinamica real.
  // 'duodecimos' removido: GET /duodecimos agora é rota real (módulo nativo).
  // Mantê-lo aqui causaria "Duplicate route" / sobreporia a página nova.
  // Páginas utilitárias do WP (plugins de ticket/login) sem equivalente
  'log-in': '/login',
  'register': '/',
  'account-2': '/',
  'edit-profile': '/',
  'user': '/',
  'dashboard': '/',
  'restricao': '/',
  'envia-sms': '/',
  'meus-tickets': '/',
  'enviar-ticket': '/',
  'atendimento': '/ouvidoria',
  'segue_atendimento': '/ouvidoria',
  'thank-you': '/',
}

export function registerLegacyRedirects() {
  // /vereador/:slug → /vereadores/:slug (slugs preservados na migração)
  router.get('/vereador/:slug', ({ params, response }) =>
    response.redirect().status(301).toPath(`/vereadores/${params.slug}`)
  )

  for (const [prefix, target] of Object.entries(cptToListing)) {
    router.get(`/${prefix}/:slug`, ({ response }) =>
      response.redirect().status(301).toPath(target)
    )
  }

  for (const [slug, target] of Object.entries(pageRedirects)) {
    router.get(`/${slug}`, ({ response }) => response.redirect().status(301).toPath(target))
  }
}
