import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import News from '#models/news'
import Councilor from '#models/councilor'
import Biennium from '#models/biennium'
import CouncilorPosition from '#models/councilor_position'
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
import RuntimeCache from '#services/runtime_cache'
import { fixGetpublicUrl } from '#helpers/document_file_url'
import { getElectionModeState } from '#helpers/election_mode'

export default class HomeController {
  async index({ inertia, request }: HttpContext) {
    // Try to fetch seals, return empty array if table doesn't exist
    let seals: Seal[] = []
    try {
      seals = await RuntimeCache.getOrSet('home:seals:v1', 60_000, () =>
        Seal.query().where('is_active', true).orderBy('sort_order', 'asc')
      )
    } catch (e) {
      console.log('Seals table may not exist yet:', e.message)
    }

    const siteSettings = await SiteSetting.allAsObject()
    const electionMode = getElectionModeState(siteSettings)
    const electionActive = electionMode.active

    let instagramLogs: InstagramImportLog[] = []
    let instagramProfileUrl: string | null = null
    let instagramProfilePic: string | null = null
    let instagramFeed: Awaited<ReturnType<typeof InstagramFeedService.getCached>>['items'] = []
    let instagramReels: Awaited<ReturnType<typeof InstagramFeedService.getCachedReels>>['items'] = []
    if (!electionActive) {
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
    }

    const [
      news,
      councilors,
      quickLinks,
      transparencySections,
      latestGazette,
      publications,
      currentLegislature,
      infoCategories,
      activities,
      sessions,
    ] = await Promise.all([
      electionActive
        ? Promise.resolve([] as News[])
        : News.query()
            .select('id', 'title', 'slug', 'excerpt', 'cover_image_url', 'published_at', 'category_id')
            .where('status', 'published')
            .whereNull('deleted_at')
            // Exclui GetPublic (avisos/atos) do feed de notícias da home.
            .whereNotIn('category_id', (sub) =>
              sub.from('news_categories').where('slug', 'getpublic').select('id')
            )
            .orderBy('published_at', 'desc')
            .limit(12)
            .preload('category'),
      Councilor.query()
        .select(
          'id',
          'name',
          'parliamentary_name',
          'party',
          'role',
          'photo_url',
          'slug',
          'is_active',
          'legislature_id'
        )
        .where('is_active', true)
        .orderBy('display_order', 'asc'),
      RuntimeCache.getOrSet('home:quick-links:v1', 60_000, () =>
        QuickLink.query().where('is_active', true).orderBy('display_order', 'asc')
      ),
      RuntimeCache.getOrSet('home:transparency-sections:v1', 60_000, () =>
        TransparencySection.query()
          .where('is_active', true)
          .whereNull('deleted_at')
          .orderBy('display_order', 'asc')
      ),
      OfficialGazetteEntry.query().orderBy('publication_date', 'desc').first(),
      OfficialPublication.query()
        .whereNull('deleted_at')
        .whereRaw("lower(coalesce(type, '')) not like ?", ['%diário%'])
        .whereRaw("lower(coalesce(type, '')) not like ?", ['%diario%'])
        .whereRaw("lower(coalesce(type, '')) not like ?", ['%edição%'])
        .whereRaw("lower(coalesce(type, '')) not like ?", ['%edicao%'])
        .whereRaw("lower(coalesce(title, '')) not like ?", ['%diário oficial%'])
        .whereRaw("lower(coalesce(title, '')) not like ?", ['%diario oficial%'])
        .whereRaw("lower(coalesce(title, '')) not like ?", ['edição%'])
        .whereRaw("lower(coalesce(title, '')) not like ?", ['edicao%'])
        .orderBy('publication_date', 'desc')
        .limit(200),
      Legislature.query().where('is_current', true).first(),
      SystemCategory.byType('information_record'),
      RuntimeCache.getOrSet('home:legislative-activities:v1', 60_000, () =>
        LegislativeActivity.query()
          .select(
            'id',
            'title',
            'type',
            'number',
            'year',
            'status',
            'author',
            'session_date',
            'slug',
            'file_url',
            'created_at',
            'is_active'
          )
          .where('is_active', true)
          .whereNull('deleted_at')
          .orderBy('created_at', 'desc')
          .limit(600)
      ),
      RuntimeCache.getOrSet('home:plenary-sessions:v1', 60_000, () =>
        PlenarySession.query().whereNull('deleted_at').select('id', 'session_date', 'year', 'status')
      ),
    ])

    // Edições recentes do Diário Oficial para o calendário da home (widget)
    const gazetteRecent = await RuntimeCache.getOrSet('home:gazette-recent:v1', 120_000, () =>
      OfficialGazetteEntry.query().orderBy('publication_date', 'desc').limit(400)
    )

    // Mesa Diretora (composição do biênio atual) — seção institucional da home
    const mesaDiretora = await RuntimeCache.getOrSet('home:mesa-diretora:v1', 120_000, async () => {
      const biennium = await Biennium.query().where('is_current', true).first()
      if (!biennium) return { members: [], biennium: null as string | null }
      const positions = await CouncilorPosition.query()
        .where('biennium_id', biennium.id)
        .preload('councilor')
        .orderByRaw(
          "CASE position WHEN 'Presidente' THEN 1 WHEN 'Vice-Presidente' THEN 2 WHEN '1º Secretário' THEN 3 WHEN '2º Secretário' THEN 4 ELSE 5 END"
        )
      // Coluna date chega como Date; extrai o ano robustamente (evita "Wed").
      const yearOf = (v: unknown): string => {
        if (!v) return ''
        const d = new Date(v as string)
        return Number.isNaN(d.getTime()) ? String(v).substring(0, 4) : String(d.getFullYear())
      }
      const yStart = yearOf(biennium.startDate)
      const yEnd = yearOf(biennium.endDate)
      return {
        members: positions.map((p) => ({
          id: p.id,
          name: p.councilor?.parliamentaryName || p.councilor?.name || '',
          slug: p.councilor?.slug || '',
          photo: p.councilor?.photoUrl || null,
          party: p.councilor?.party || '',
          role: p.position,
        })),
        biennium: yStart && yEnd ? `${yStart}-${yEnd}` : yStart || null,
      }
    })

    // Fetch transparency links for each section
    const sectionIds = transparencySections.map((s) => s.id)
    const links = sectionIds.length
      ? await RuntimeCache.getOrSet(`home:transparency-links:${sectionIds.join(',')}:v1`, 60_000, () =>
          TransparencyLink.query()
            .whereIn('sectionId', sectionIds)
            .whereNull('deleted_at')
            .orderBy('display_order')
        )
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
    const safeMappedNews = electionActive ? [] : mappedNews

    // Datas vindas do Postgres podem chegar como Date (coluna date) ou string ISO
    const formatDate = (value: unknown) => {
      if (!value) return ''
      const dt =
        value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value))
      return dt.isValid ? dt.toFormat('dd/MM/yyyy') : ''
    }
    // ISO "YYYY-MM-DD" para o componente do Diário (que faz parseIso); nunca devolve Date
    const toIsoDate = (value: unknown): string => {
      if (!value) return ''
      const dt =
        value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value))
      return dt.isValid ? (dt.toISODate() ?? '') : String(value).slice(0, 10)
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
      publicationDate: toIsoDate(p.publicationDate),
      tipo: p.type,
      arquivo: p.fileUrl,
      url: p.slug ? `/publicacoes-oficiais/${p.slug}` : '/publicacoes-oficiais',
    }))

    // Compatibilidade com builds já publicados: versões antigas da home
    // alimentavam "Últimas Publicações" com a prop gazetteEntries. Mantemos o
    // calendário em gazetteDates e reaproveitamos gazetteEntries para atos/MSI.
    const publicationEntriesForLegacyHome = publicacoes.map((p) => ({
      id: p.id,
      editionNumber: p.tipo || '',
      publicationDate: p.publicationDate,
      description: p.titulo,
      fileUrl: p.arquivo || p.url,
      titulo: p.titulo,
      data: p.data,
      tipo: p.tipo,
      arquivo: p.arquivo,
      url: p.url,
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

    // Pré-visualização de modelo de site sem alterar a configuração salva
    // (ex.: /?preview_template=classico). Clona siteSettings p/ não mutar o cache.
    const previewTemplate = request.input('preview_template')
    const VALID_TEMPLATES = ['institucional', 'classico', 'moderno', 'compacto']
    const siteSettingsView =
      typeof previewTemplate === 'string' && VALID_TEMPLATES.includes(previewTemplate)
        ? { ...siteSettings, site_template: previewTemplate }
        : siteSettings

    return inertia.render('home', {
      news: safeMappedNews,
      vereadores,
      legislativo,
      mesaDiretora,
      publicacoes,
      instagramPosts: electionActive ? [] : instagramPosts,
      instagramReels: electionActive ? [] : instagramReels,
      instagramProfileUrl: electionActive ? null : instagramProfileUrl,
      instagramProfilePic: electionActive ? null : instagramProfilePic,
      legislatura,
      quickLinks: quickLinks.map((q) => q.serialize()),
      transparencySections: sectionsWithLinks,
      latestGazette: latestGazette
        ? {
            id: latestGazette.id,
            editionNumber: latestGazette.editionNumber,
            publicationDate: toIsoDate(latestGazette.publicationDate),
            description: latestGazette.description,
            fileUrl: fixGetpublicUrl(latestGazette.fileUrl),
          }
        : null,
      // Builds antigos ainda usam essa prop em "Últimas Publicações"; por isso
      // ela recebe atos/publicações/MSI, não edições completas do Diário.
      gazetteEntries: publicationEntriesForLegacyHome,
      gazetteDates: gazetteRecent.map((g) => ({
        date: toIsoDate(g.publicationDate),
        editionNumber: g.editionNumber,
        fileUrl: fixGetpublicUrl(g.fileUrl),
      })),
      siteSettings: siteSettingsView,
      infoCategories: infoCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      newsBackgroundImage: electionActive ? null : siteSettingsView.news_background_image || null,
      electionMode: {
        active: electionActive,
        message: electionMode.message,
      },
      seals: electionActive ? [] : seals.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl,
        linkUrl: s.linkUrl,
      })),
    })
  }
}
