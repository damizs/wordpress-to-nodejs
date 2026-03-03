import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy imports - Public
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const PublicNewsController = () => import('#controllers/public_news_controller')
const PublicCouncilorsController = () => import('#controllers/public/councilors_controller')
const PublicTransparencyController = () => import('#controllers/public/transparency_controller')
const PublicAtasController = () => import('#controllers/public/atas_controller')
const PublicPautasController = () => import('#controllers/public/pautas_controller')
const PublicPublicationsController = () => import('#controllers/public/publications_controller')
const PublicFaqController = () => import('#controllers/public/faq_controller')
const PublicDynamicInfoController = () => import('#controllers/public/dynamic_info_controller')
const PublicActivitiesController = () => import('#controllers/public/activities_controller')
const PublicCommitteesController = () => import('#controllers/public/committees_controller')
const PublicLicitacoesController = () => import('#controllers/public/licitacoes_controller')
const PublicMesaDiretoraController = () => import('#controllers/public/mesa_diretora_controller')
const PublicSatisfactionSurveyController = () => import('#controllers/public/satisfaction_survey_controller')
const PublicPrivacyPolicyController = () => import('#controllers/public/privacy_policy_controller')
const StaticPagesController = () => import('#controllers/public/static_pages_controller')
const SeoController = () => import('#controllers/seo_controller')

// Lazy imports - Admin
const DashboardController = () => import('#controllers/admin/dashboard_controller')
const AdminSettingsController = () => import('#controllers/admin/settings_controller')
const AdminNewsController = () => import('#controllers/admin/news_controller')
const AdminHomepageController = () => import('#controllers/admin/homepage_controller')
const AdminCouncilorsController = () => import('#controllers/admin/councilors_controller')
const AdminActivitiesController = () => import('#controllers/admin/legislative_activities_controller')
const AdminQuickLinksController = () => import('#controllers/admin/quick_links_controller')
const AdminTransparencyController = () => import('#controllers/admin/transparency_controller')
const AdminLegislaturesController = () => import('#controllers/admin/legislatures_controller')
const AdminBienniaController = () => import('#controllers/admin/biennia_controller')
const AdminCommitteesController = () => import('#controllers/admin/committees_controller')
const AdminPlenarySessionsController = () => import('#controllers/admin/plenary_sessions_controller')
const AdminPublicationsController = () => import('#controllers/admin/official_publications_controller')
const AdminFaqController = () => import('#controllers/admin/faq_controller')
const AdminInformationRecordsController = () => import('#controllers/admin/information_records_controller')
const AdminCategoriesController = () => import('#controllers/admin/system_categories_controller')
const AdminLicitacoesController = () => import('#controllers/admin/licitacoes_controller')
const AdminSatisfactionSurveyController = () => import('#controllers/admin/satisfaction_survey_controller')
const AdminInstagramController = () => import('#controllers/admin/instagram_controller')
const InstagramProxyController = () => import('#controllers/admin/instagram_proxy_controller')

// ========= HEALTH CHECK =========
router.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// ========= SEO =========
router.get('/sitemap.xml', [SeoController, 'sitemap'])
router.get('/robots.txt', [SeoController, 'robots'])

// ========= AUTH =========
router.get('/login', [AuthController, 'showLogin']).use(middleware.guest())
router.post('/login', [AuthController, 'login']).use(middleware.guest())
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())

// ========= PUBLIC PAGES =========
router.get('/', [HomeController, 'index'])
router.get('/noticias', [PublicNewsController, 'index'])
router.get('/noticias/:slug', [PublicNewsController, 'show'])
router.get('/vereadores', [PublicCouncilorsController, 'index'])
router.get('/vereadores/:slug', [PublicCouncilorsController, 'show'])
router.get('/transparencia', [PublicTransparencyController, 'index'])
router.get('/mesa-diretora', [PublicMesaDiretoraController, 'index'])
router.get('/comissoes', [PublicCommitteesController, 'index'])
router.get('/atas', [PublicAtasController, 'index'])
router.get('/atas/:slug', [PublicAtasController, 'show'])
router.get('/pautas', [PublicPautasController, 'index'])
router.get('/pautas/:slug', [PublicPautasController, 'show'])
router.get('/atividades-legislativa', [PublicActivitiesController, 'index'])
router.get('/atividades-legislativa/:slug', [PublicActivitiesController, 'show'])
router.get('/atividades-legislativas', [PublicActivitiesController, 'index'])
router.get('/atividades-legislativas/:slug', [PublicActivitiesController, 'show'])
router.get('/publicacoes-oficiais', [PublicPublicationsController, 'index'])
router.get('/publicacoes-oficiais/:slug', [PublicPublicationsController, 'show'])
router.get('/licitacoes', [PublicLicitacoesController, 'index'])
router.get('/licitacoes/:slug', [PublicLicitacoesController, 'show'])
router.get('/perguntas-frequentes', [PublicFaqController, 'index'])
router.get('/pesquisa-de-satisfacao', [PublicSatisfactionSurveyController, 'index'])
router.post('/pesquisa-de-satisfacao', [PublicSatisfactionSurveyController, 'store'])
router.get('/pesquisa-de-satisfacao/relatorio', [PublicSatisfactionSurveyController, 'report'])
router.get('/politica-de-privacidade', [PublicPrivacyPolicyController, 'index'])
router.get('/historia-da-camara', [StaticPagesController, 'historia'])
router.get('/sobre', [StaticPagesController, 'sobre'])
router.get('/ouvidoria', [StaticPagesController, 'ouvidoria'])
// Dynamic info pages: /estagiarios, /terceirizados, /verbas, etc.
router.get('/:slug', [PublicDynamicInfoController, 'show']).where('slug', /^(?!login|painel|api|health|noticias|vereadores|transparencia|mesa-diretora|comissoes|atas|pautas|atividades-legislativa|atividades-legislativas|publicacoes-oficiais|licitacoes|perguntas-frequentes|pesquisa-de-satisfacao|politica-de-privacidade|historia-da-camara|sobre|ouvidoria).*$/)

// ========= API =========
router.get('/api/categorias/:type', [AdminCategoriesController, 'byType'])

// Rota temporária para reset de links rápidos (protegida)
router.get('/api/reset-quick-links', async ({ response, auth }) => {
  try {
    await auth.authenticate()
  } catch {
    return response.unauthorized({ error: 'Não autorizado' })
  }
  
  const QuickLink = (await import('#models/quick_link')).default
  await QuickLink.query().delete()
  
  const links = [
    { title: 'Sessões Plenárias', url: 'https://www.youtube.com/@camaramunicipaldeSume', icon: 'Youtube', color: 'red', displayOrder: 1, isActive: true },
    { title: 'Leis Municipais', url: '/leis', icon: 'Scale', color: 'navy', displayOrder: 2, isActive: true },
    { title: 'Portal da Transparência', url: '/transparencia', icon: 'Shield', color: 'sky', displayOrder: 3, isActive: true },
    { title: 'Diário Oficial', url: '/diario-oficial', icon: 'FileText', color: 'gold', displayOrder: 4, isActive: true },
    { title: 'Vereadores', url: '/vereadores', icon: 'Users', color: 'emerald', displayOrder: 5, isActive: true },
    { title: 'Ouvidoria', url: '/ouvidoria', icon: 'MessageSquare', color: 'purple', displayOrder: 6, isActive: true },
  ]
  
  await QuickLink.createMany(links)
  return response.json({ success: true, message: `${links.length} links rápidos criados` })
})

// ========= INSTAGRAM IMAGE PROXY (no auth required) =========
router.get('/painel/noticias/instagram/proxy-image', [InstagramProxyController, 'image'])

// ========= ADMIN PANEL =========
router.group(() => {
  router.get('/', [DashboardController, 'index'])
  router.get('/homepage', [AdminHomepageController, 'index'])
  router.post('/homepage', [AdminHomepageController, 'update'])
  router.get('/aparencia', [AdminSettingsController, 'appearance'])
  router.post('/aparencia', [AdminSettingsController, 'updateAppearance'])

  // Notícias
  router.get('/noticias', [AdminNewsController, 'index'])
  router.get('/noticias/criar', [AdminNewsController, 'create'])
  router.post('/noticias', [AdminNewsController, 'store'])
  router.get('/noticias/:id/editar', [AdminNewsController, 'edit'])
  router.put('/noticias/:id', [AdminNewsController, 'update'])
  router.delete('/noticias/:id', [AdminNewsController, 'destroy'])

  // Instagram Auto Import (submenu de Notícias)
  // Instagram Automation
  router.get('/noticias/instagram', [AdminInstagramController, 'index'])
  router.get('/noticias/instagram/configuracoes', [AdminInstagramController, 'settings'])
  router.post('/noticias/instagram/configuracoes', [AdminInstagramController, 'saveSettings'])
  router.get('/noticias/instagram/historico', [AdminInstagramController, 'history'])
  router.delete('/noticias/instagram/:id', [AdminInstagramController, 'deleteImport'])
  // Instagram AJAX
  router.post('/noticias/instagram/fetch-posts', [AdminInstagramController, 'fetchPosts'])
  router.post('/noticias/instagram/process-caption', [AdminInstagramController, 'processCaption'])
  router.post('/noticias/instagram/test-ai', [AdminInstagramController, 'testAiConnection'])
  router.post('/noticias/instagram/publish', [AdminInstagramController, 'publishPost'])
  router.post('/noticias/instagram/auto-import', [AdminInstagramController, 'runAutoImport'])

  // Legislaturas
  router.get('/legislaturas', [AdminLegislaturesController, 'index'])
  router.get('/legislaturas/criar', [AdminLegislaturesController, 'create'])
  router.post('/legislaturas', [AdminLegislaturesController, 'store'])
  router.get('/legislaturas/:id/editar', [AdminLegislaturesController, 'edit'])
  router.put('/legislaturas/:id', [AdminLegislaturesController, 'update'])
  router.delete('/legislaturas/:id', [AdminLegislaturesController, 'destroy'])

  // Biênios
  router.get('/bienios', [AdminBienniaController, 'index'])
  router.get('/bienios/criar', [AdminBienniaController, 'create'])
  router.post('/bienios', [AdminBienniaController, 'store'])
  router.get('/bienios/:id/editar', [AdminBienniaController, 'edit'])
  router.put('/bienios/:id', [AdminBienniaController, 'update'])
  router.delete('/bienios/:id', [AdminBienniaController, 'destroy'])

  // Vereadores
  router.get('/vereadores', [AdminCouncilorsController, 'index'])
  router.get('/vereadores/criar', [AdminCouncilorsController, 'create'])
  router.post('/vereadores', [AdminCouncilorsController, 'store'])
  router.get('/vereadores/:id/editar', [AdminCouncilorsController, 'edit'])
  router.put('/vereadores/:id', [AdminCouncilorsController, 'update'])
  router.delete('/vereadores/:id', [AdminCouncilorsController, 'destroy'])

  // Comissões
  router.get('/comissoes', [AdminCommitteesController, 'index'])
  router.get('/comissoes/criar', [AdminCommitteesController, 'create'])
  router.post('/comissoes', [AdminCommitteesController, 'store'])
  router.get('/comissoes/:id/editar', [AdminCommitteesController, 'edit'])
  router.put('/comissoes/:id', [AdminCommitteesController, 'update'])
  router.delete('/comissoes/:id', [AdminCommitteesController, 'destroy'])

  // Atividades Legislativas
  router.get('/atividades', [AdminActivitiesController, 'index'])
  router.get('/atividades/criar', [AdminActivitiesController, 'create'])
  router.post('/atividades', [AdminActivitiesController, 'store'])
  router.get('/atividades/:id/editar', [AdminActivitiesController, 'edit'])
  router.put('/atividades/:id', [AdminActivitiesController, 'update'])
  router.delete('/atividades/:id', [AdminActivitiesController, 'destroy'])

  // Sessões Plenárias
  router.get('/sessoes', [AdminPlenarySessionsController, 'index'])
  router.get('/sessoes/criar', [AdminPlenarySessionsController, 'create'])
  router.post('/sessoes', [AdminPlenarySessionsController, 'store'])
  router.get('/sessoes/:id/editar', [AdminPlenarySessionsController, 'edit'])
  router.put('/sessoes/:id', [AdminPlenarySessionsController, 'update'])
  router.delete('/sessoes/:id', [AdminPlenarySessionsController, 'destroy'])

  // Publicações Oficiais
  router.get('/publicacoes', [AdminPublicationsController, 'index'])
  router.get('/publicacoes/criar', [AdminPublicationsController, 'create'])
  router.post('/publicacoes', [AdminPublicationsController, 'store'])
  router.get('/publicacoes/:id/editar', [AdminPublicationsController, 'edit'])
  router.put('/publicacoes/:id', [AdminPublicationsController, 'update'])
  router.delete('/publicacoes/:id', [AdminPublicationsController, 'destroy'])

  // FAQ
  router.get('/faq', [AdminFaqController, 'index'])
  router.get('/faq/criar', [AdminFaqController, 'create'])
  router.post('/faq', [AdminFaqController, 'store'])
  router.get('/faq/:id/editar', [AdminFaqController, 'edit'])
  router.put('/faq/:id', [AdminFaqController, 'update'])
  router.delete('/faq/:id', [AdminFaqController, 'destroy'])

  // Acesso à Informação
  router.get('/acesso-informacao', [AdminInformationRecordsController, 'index'])
  router.get('/acesso-informacao/criar', [AdminInformationRecordsController, 'create'])
  router.post('/acesso-informacao', [AdminInformationRecordsController, 'store'])
  router.get('/acesso-informacao/:id/editar', [AdminInformationRecordsController, 'edit'])
  router.put('/acesso-informacao/:id', [AdminInformationRecordsController, 'update'])
  router.delete('/acesso-informacao/:id', [AdminInformationRecordsController, 'destroy'])

  // Categorias do Sistema
  router.get('/categorias', [AdminCategoriesController, 'index'])
  router.get('/categorias/criar', [AdminCategoriesController, 'create'])
  router.post('/categorias', [AdminCategoriesController, 'store'])
  router.get('/categorias/:id/editar', [AdminCategoriesController, 'edit'])
  router.put('/categorias/:id', [AdminCategoriesController, 'update'])
  router.delete('/categorias/:id', [AdminCategoriesController, 'destroy'])

  // Links Rápidos
  router.get('/links-rapidos', [AdminQuickLinksController, 'index'])
  router.get('/links-rapidos/criar', [AdminQuickLinksController, 'create'])
  router.post('/links-rapidos', [AdminQuickLinksController, 'store'])
  router.get('/links-rapidos/:id/editar', [AdminQuickLinksController, 'edit'])
  router.put('/links-rapidos/:id', [AdminQuickLinksController, 'update'])
  router.delete('/links-rapidos/:id', [AdminQuickLinksController, 'destroy'])
  router.post('/links-rapidos/reorder', [AdminQuickLinksController, 'reorder'])

  // Transparência
  router.get('/transparencia', [AdminTransparencyController, 'index'])
  router.get('/transparencia/secoes/criar', [AdminTransparencyController, 'createSection'])
  router.post('/transparencia/secoes', [AdminTransparencyController, 'storeSection'])
  router.get('/transparencia/secoes/:id/editar', [AdminTransparencyController, 'editSection'])
  router.put('/transparencia/secoes/:id', [AdminTransparencyController, 'updateSection'])
  router.delete('/transparencia/secoes/:id', [AdminTransparencyController, 'destroySection'])
  router.get('/transparencia/secoes/:sectionId/links/criar', [AdminTransparencyController, 'createLink'])
  router.post('/transparencia/secoes/:sectionId/links', [AdminTransparencyController, 'storeLink'])
  router.get('/transparencia/links/:id/editar', [AdminTransparencyController, 'editLink'])
  router.put('/transparencia/links/:id', [AdminTransparencyController, 'updateLink'])
  router.delete('/transparencia/links/:id', [AdminTransparencyController, 'destroyLink'])

  // Licitações
  router.get('/licitacoes', [AdminLicitacoesController, 'index'])
  router.get('/licitacoes/criar', [AdminLicitacoesController, 'create'])
  router.post('/licitacoes', [AdminLicitacoesController, 'store'])
  router.get('/licitacoes/:id/editar', [AdminLicitacoesController, 'edit'])
  router.put('/licitacoes/:id', [AdminLicitacoesController, 'update'])
  router.delete('/licitacoes/:id', [AdminLicitacoesController, 'destroy'])

  // Pesquisa de Satisfação
  router.get('/pesquisa-satisfacao', [AdminSatisfactionSurveyController, 'index'])
  router.get('/pesquisa-satisfacao/:id', [AdminSatisfactionSurveyController, 'show'])
  router.delete('/pesquisa-satisfacao/:id', [AdminSatisfactionSurveyController, 'destroy'])
})
  .prefix('/painel')
  .use(middleware.auth())
