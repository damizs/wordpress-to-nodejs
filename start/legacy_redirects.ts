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
  rgf: '/rgf',
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
  glossario: '/perguntas-frequentes',
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
  'indicacoes': '/atividades-legislativa',
  'listagem-dos-vereadores': '/vereadores',
  'listagem-das-legislaturas': '/vereadores',
  'fale-conosco': '/ouvidoria',
  'mapa-do-site': '/sitemap.xml',
  'convenios-e-transferencias': '/acordos',
  // Páginas de transparência fiscal (conteúdo consolidado em /transparencia)
  'licitantes-sancionados': '/transparencia',
  'adesao-ata': '/transparencia',
  'ocp': '/transparencia',
  'fiscal-contrato': '/transparencia',
  'aditivos': '/transparencia',
  'despesas-mensais': '/transparencia',
  'empenhos-detalhados': '/transparencia',
  'duodecimos': '/transparencia',
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
