import router from '@adonisjs/core/services/router'

const HomeController = () => import('#controllers/home_controller')

// ========= PUBLIC PAGES (Inertia) =========
router.get('/', [HomeController, 'index'])

// ========= HEALTH CHECK =========
router.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))
