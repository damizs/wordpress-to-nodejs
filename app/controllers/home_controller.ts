import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import News from '#models/news'
import Councilor from '#models/councilor'
import QuickLink from '#models/quick_link'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import OfficialGazetteEntry from '#models/official_gazette_entry'
import OfficialPublication from '#models/official_publication'
import Legislature from '#models/legislature'
import InstagramImportLog from '#models/instagram_import_log'
import InstagramSetting from '#models/instagram_setting'
import InstagramFeedService from '#services/instagram_feed_service'
import SiteSetting from '#models/site_setting'
import Seal from '#models/seal'
import SystemCategory from '#models/system_category'
import LegislativeActivity from '#models/legislative_activity'
import PlenarySession from '#models/plenary_session'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    // Try to fetch seals, return empty array if table doesn't exist
    let seals: Seal[] = []
    try {
      seals = await Seal.query().where('is_active', true).orderBy('sort_order', 'asc')
    } catch (e) {
      console.log('Seals table may not exist yet:', e.message)
    }

    let instagramLogs: InstagramImportLog[] = []
    let instagramProfileUrl: string | null = null
    let instagramProfilePic: string | null = null
    let instagramFeed: Awaited<ReturnType<typeof InstagramFeedService.getCached>>['items'] = []
    let instagramReels: Awaited<ReturnType<typeof InstagramFeedService.getCachedReels>>['items'] = []
    try {
      instagramLogs = await InstagramImportLog.query()
        .where('status', 'published')
        .whereNotNull('news_id')
        .preload('news')
        .orderBy('instagram_post_date', 'desc')
        .limit(8)
      instagramProfileUrl = await InstagramSetting.get('instagram_profile_url')
      instagramProfilePic = await InstagramFeedService.getCachedProfilePic()

      // Feed ao vivo (cache). Atualiza em segundo plano se estiver velho/vazio,
      // sem bloquear a renderização da página.
      const cached = await InstagramFeedService.getCached()
      instagramFeed = cached.items
      if (instagramProfileUrl && (await InstagramFeedService.isStale())) {
        InstagramFeedService.refresh().catch((err) =>
          console.log('Instagram feed refresh falhou:', err?.message)
        )
      } else if (instagramProfileUrl && (await InstagramFeedService.isProfilePicStale())) {
        InstagramFeedService.refreshProfilePic().catch((err) =>
          console.log('Instagram profile pic refresh falhou:', err?.message)
        )
      }

      const cachedReels = await InstagramFeedService.getCachedReels()
      instagramReels = cachedReels.items
      if (instagramProfileUrl && (await InstagramFeedService.isReelsStale())) {
        InstagramFeedService.refreshReels().catch((err) =>
          console.log('Instagram reels refresh falhou:', err?.message)
        )
      }
    } catch (e) {
      console.log('Instagram unavailable:', e.message)
    }

    const [
      news,
      councilors,
      quickLinks,
      transparencySections,
      latestGazette,
      publications,
      currentLegislature,
      siteSettings,
      infoCategories,
      activities,
      sessions,
    ] = await Promise.all([
      News.query()
        .where('status', 'published')
        .orderBy('published_at', 'desc')
        .limit(12)
        .preload('category'),
      Councilor.query().where('is_active', true).orderBy('display_order', 'asc'),
      QuickLink.query().where('is_active', true).orderBy('display_order', 'asc'),
      TransparencySection.query().where('is_active', true).orderBy('display_order', 'asc'),
      OfficialGazetteEntry.query().orderBy('publication_date', 'desc').first(),
      OfficialPublication.query().orderBy('publication_date', 'desc').limit(6),
      Legislature.query().where('is_current', true).first(),
      SiteSetting.allAsObject(),
      SystemCategory.byType('information_record'),
      LegislativeActivity.query()
        .where('is_active', true)
        .orderBy('created_at', 'desc')
        .limit(600),
      PlenarySession.query().select('id', 'session_date', 'year', 'status'),
    ])

    // Edições recentes do Diário Oficial para o calendário da home (widget)
    const gazetteRecent = await OfficialGazetteEntry.query()
      .orderBy('publication_date', 'desc')
      .limit(400)

    // Fetch transparency links for each section
    const sectionIds = transparencySections.map((s) => s.id)
    const links = sectionIds.length
      ? await TransparencyLink.query().whereIn('sectionId', sectionIds).orderBy('display_order')
      : []

    const sectionsWithLinks = transparencySections.map((section) => ({
      ...section.serialize(),
      links: links.filter((l) => l.sectionId === section.id).map((l) => l.serialize()),
    }))

    // Map news to expected format for NewsSection component
    const mappedNews = news.map((n, index) => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt || '',
      date: n.publishedAt?.toFormat('dd/MM/yyyy') || '',
      image: n.coverImageUrl,
      slug: n.slug,
      featured: index === 0, // First news is featured
    }))

    // Datas vindas do Postgres podem chegar como Date (coluna date) ou string ISO
    const formatDate = (value: unknown) => {
      if (!value) return ''
      const dt =
        value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value))
      return dt.isValid ? dt.toFormat('dd/MM/yyyy') : ''
    }

    // Homepage mostra só os vereadores da legislatura atual (evita mesas duplicadas)
    const currentCouncilors = currentLegislature
      ? councilors.filter((c) => c.legislatureId === currentLegislature.id)
      : []
    const councilorsToShow = currentCouncilors.length > 0 ? currentCouncilors : councilors

    const vereadores = councilorsToShow.map((c) => ({
      id: c.id,
      nome: c.name,
      apelido: c.parliamentaryName || c.party || '',
      cargo: c.role || 'Vereador(a)',
      foto: c.photoUrl,
      slug: c.slug,
      ativo: c.isActive,
    }))

    const publicacoes = publications.map((p) => ({
      id: p.id,
      titulo: p.title,
      data: formatDate(p.publicationDate),
      tipo: p.type,
      arquivo: p.fileUrl,
    }))

    // Preferir o feed ao vivo (scraper). Se vazio, cai para posts que viraram notícia.
    const instagramPosts =
      instagramFeed.length > 0
        ? instagramFeed.map((item, index) => ({
            id: index,
            title: item.title,
            excerpt: item.caption,
            image: item.image,
            slug: null as string | null,
            instagramUrl: item.instagramUrl,
            date: item.date,
          }))
        : instagramLogs.map((log) => ({
            id: log.id,
            title: log.news?.title || log.generatedTitle || '',
            excerpt: log.news?.excerpt || '',
            image: log.news?.coverImageUrl || log.instagramImageUrl,
            slug: log.news?.slug || null,
            instagramUrl: log.instagramUrl,
            date: log.instagramPostDate?.toFormat('dd/MM/yyyy') || '',
          }))

    // ===== Seção "Legislativo em números" =====
    const toDateTime = (value: unknown): DateTime | null => {
      if (!value) return null
      if (DateTime.isDateTime(value)) return value
      const dt =
        value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value))
      return dt.isValid ? dt : null
    }
    const activityDate = (a: LegislativeActivity): DateTime | null =>
      toDateTime(a.sessionDate) ?? a.createdAt ?? null

    // Gráfico: matérias por semana nas últimas 24 semanas
    const WEEKS = 24
    const currentWeekStart = DateTime.now().startOf('week')
    const weekly = Array.from({ length: WEEKS }, (_, i) => {
      const start = currentWeekStart.minus({ weeks: WEEKS - 1 - i })
      return { label: start.setLocale('pt-BR').toFormat('dd/MMM'), count: 0 }
    })
    for (const a of activities) {
      const d = activityDate(a)
      if (!d) continue
      const diff = Math.floor(currentWeekStart.diff(d.startOf('week'), 'weeks').weeks)
      if (diff >= 0 && diff < WEEKS) weekly[WEEKS - 1 - diff].count++
    }

    // Últimas matérias (timeline)
    const ultimasMaterias = activities
      .map((a) => ({ a, d: activityDate(a) }))
      .sort((x, y) => (y.d?.toMillis() ?? 0) - (x.d?.toMillis() ?? 0))
      .slice(0, 10)
      .map(({ a, d }) => ({
        id: a.id,
        titulo: a.title || `${a.type}: ${a.number}/${a.year}`,
        tipo: a.type || null,
        status: a.status || null,
        data: d ? d.toFormat('dd/MM/yyyy') : '',
        url: a.fileUrl || (a.slug ? `/atividades-legislativas/${a.slug}` : '/atividades-legislativas'),
      }))

    // Produção por vereador (autor da matéria casado com o nome do vereador)
    const normalizeName = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    const legislativoVereadores = councilorsToShow.map((c) => {
      const keys = [c.name, c.parliamentaryName]
        .filter((k): k is string => Boolean(k))
        .map(normalizeName)
        .filter((k) => k.length > 3)
      const materias = activities.filter((a) => {
        if (!a.author) return false
        const author = normalizeName(a.author)
        return keys.some((k) => author.includes(k) || k.includes(author))
      }).length
      return {
        id: c.id,
        nome: c.parliamentaryName || c.name,
        cargo: c.role || 'Vereador(a)',
        foto: c.photoUrl,
        slug: c.slug,
        materias,
      }
    })

    const currentYear = DateTime.now().year
    const totalMateriasAno = activities.filter((a) => activityDate(a)?.year === currentYear).length
    const totalSessoesAno = sessions.filter((s) => {
      if (s.year) return s.year === currentYear
      return toDateTime(s.sessionDate)?.year === currentYear
    }).length

    const legislativo = {
      weekly,
      materias: ultimasMaterias,
      vereadores: legislativoVereadores,
      totalMateriasAno,
      totalSessoesAno,
      ano: currentYear,
    }

    // Extrai o ano de Date ou string ISO (String(Date) daria "Wed Jan ...")
    const yearOf = (value: unknown) => {
      if (value instanceof Date) return String(value.getFullYear())
      const match = String(value ?? '').match(/\d{4}/)
      return match ? match[0] : ''
    }
    const startYear = yearOf(currentLegislature?.startDate)
    const endYear = yearOf(currentLegislature?.endDate)
    const legislatura = startYear && endYear ? `${startYear}-${endYear}` : undefined

    return inertia.render('home', {
      news: mappedNews,
      vereadores,
      legislativo,
      publicacoes,
      instagramPosts,
      instagramReels,
      instagramProfileUrl,
      instagramProfilePic,
      legislatura,
      quickLinks: quickLinks.map((q) => q.serialize()),
      transparencySections: sectionsWithLinks,
      latestGazette: latestGazette
        ? {
            id: latestGazette.id,
            editionNumber: latestGazette.editionNumber,
            publicationDate: latestGazette.publicationDate,
            description: latestGazette.description,
            fileUrl: latestGazette.fileUrl,
          }
        : null,
      // Lista para o módulo "Últimas Publicações" da home (preview com busca/
      // filtro/paginação client-side). Limita o payload; o restante fica em /diario-oficial.
      gazetteEntries: gazetteRecent.slice(0, 60).map((g) => ({
        id: g.id,
        editionNumber: g.editionNumber,
        publicationDate: g.publicationDate,
        description: g.description,
        fileUrl: g.fileUrl,
      })),
      gazetteDates: gazetteRecent.map((g) => {
        const raw: unknown = g.publicationDate
        const dt =
          raw instanceof Date ? DateTime.fromJSDate(raw) : DateTime.fromISO(String(raw))
        return {
          date: dt.isValid ? dt.toISODate() : String(raw).slice(0, 10),
          editionNumber: g.editionNumber,
          fileUrl: g.fileUrl,
        }
      }),
      siteSettings,
      infoCategories: infoCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      newsBackgroundImage: siteSettings.news_background_image || null,
      seals: seals.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl,
        linkUrl: s.linkUrl,
      })),
    })
  }
}
