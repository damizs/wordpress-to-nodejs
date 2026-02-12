import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy imports
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const DashboardController = () => import('#controllers/admin/dashboard_controller')
const AdminSettingsController = () => import('#controllers/admin/settings_controller')
const AdminNewsController = () => import('#controllers/admin/news_controller')
const AdminHomepageController = () => import('#controllers/admin/homepage_controller')
const AdminCouncilorsController = () => import('#controllers/admin/councilors_controller')
const AdminActivitiesController = () => import('#controllers/admin/legislative_activities_controller')
const AdminQuickLinksController = () => import('#controllers/admin/quick_links_controller')
const AdminTransparencyController = () => import('#controllers/admin/transparency_controller')
const PublicNewsController = () => import('#controllers/public_news_controller')

// ========= HEALTH CHECK =========
router.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// ========= AUTH =========
router.get('/login', [AuthController, 'showLogin']).use(middleware.guest())
router.post('/login', [AuthController, 'login']).use(middleware.guest())
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())

// ========= PUBLIC PAGES (Inertia) =========
router.get('/', [HomeController, 'index'])
router.get('/noticias', [PublicNewsController, 'index'])
router.get('/noticias/:slug', [PublicNewsController, 'show'])

// ========= ADMIN PANEL =========
router.group(() => {
  // Dashboard
  router.get('/', [DashboardController, 'index'])

  // Homepage Editor
  router.get('/homepage', [AdminHomepageController, 'index'])
  router.post('/homepage', [AdminHomepageController, 'update'])

  // Aparência / Settings
  router.get('/aparencia', [AdminSettingsController, 'appearance'])
  router.post('/aparencia', [AdminSettingsController, 'updateAppearance'])

  // Notícias CRUD
  router.get('/noticias', [AdminNewsController, 'index'])
  router.get('/noticias/criar', [AdminNewsController, 'create'])
  router.post('/noticias', [AdminNewsController, 'store'])
  router.get('/noticias/:id/editar', [AdminNewsController, 'edit'])
  router.put('/noticias/:id', [AdminNewsController, 'update'])
  router.delete('/noticias/:id', [AdminNewsController, 'destroy'])

  // Vereadores CRUD
  router.get('/vereadores', [AdminCouncilorsController, 'index'])
  router.get('/vereadores/criar', [AdminCouncilorsController, 'create'])
  router.post('/vereadores', [AdminCouncilorsController, 'store'])
  router.get('/vereadores/:id/editar', [AdminCouncilorsController, 'edit'])
  router.put('/vereadores/:id', [AdminCouncilorsController, 'update'])
  router.delete('/vereadores/:id', [AdminCouncilorsController, 'destroy'])

  // Atividades Legislativas CRUD
  router.get('/atividades', [AdminActivitiesController, 'index'])
  router.get('/atividades/criar', [AdminActivitiesController, 'create'])
  router.post('/atividades', [AdminActivitiesController, 'store'])
  router.get('/atividades/:id/editar', [AdminActivitiesController, 'edit'])
  router.put('/atividades/:id', [AdminActivitiesController, 'update'])
  router.delete('/atividades/:id', [AdminActivitiesController, 'destroy'])

  // Links Rápidos CRUD
  router.get('/links-rapidos', [AdminQuickLinksController, 'index'])
  router.get('/links-rapidos/criar', [AdminQuickLinksController, 'create'])
  router.post('/links-rapidos', [AdminQuickLinksController, 'store'])
  router.get('/links-rapidos/:id/editar', [AdminQuickLinksController, 'edit'])
  router.put('/links-rapidos/:id', [AdminQuickLinksController, 'update'])
  router.delete('/links-rapidos/:id', [AdminQuickLinksController, 'destroy'])
  router.post('/links-rapidos/reorder', [AdminQuickLinksController, 'reorder'])

  // Transparência CRUD
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
})
  .prefix('/painel')
  .use(middleware.auth())
