import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy imports
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const DashboardController = () => import('#controllers/admin/dashboard_controller')
const AdminSettingsController = () => import('#controllers/admin/settings_controller')
const AdminNewsController = () => import('#controllers/admin/news_controller')
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
})
  .prefix('/painel')
  .use(middleware.auth())
