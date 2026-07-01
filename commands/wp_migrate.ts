import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import News from '#models/news'
import NewsCategory from '#models/news_category'
import Councilor from '#models/councilor'
import Legislature from '#models/legislature'
import Biennium from '#models/biennium'
import CouncilorPosition from '#models/councilor_position'
import Committee from '#models/committee'
import CommitteeMember from '#models/committee_member'
import FaqItem from '#models/faq_item'
import User from '#models/user'
import LegislativeActivity from '#models/legislative_activity'
import OfficialPublication from '#models/official_publication'
import { routeMateria } from '#helpers/materia_router'
import PlenarySession from '#models/plenary_session'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import QuickLink from '#models/quick_link'
import InformationRecord from '#models/information_record'
import Licitacao from '#models/licitacao'
import SurveyQuestion from '#models/survey_question'
import { importActivitiesWithAuthors } from '#services/wp_activities_importer'
import { seedAtasPautasFromSessions } from '#services/seed_atas_pautas_service'
import { camara } from '#config/camara'

// Autor padrão das notícias importadas: o usuário admin semeado.
// Parametrizável por env; fallback vem da identidade do tenant.
const IMPORT_ADMIN_EMAIL = process.env.WP_IMPORT_ADMIN_EMAIL || camara.email

type TransparencyTarget = {
  url: string
  isExternal: boolean
  openMode: 'modal' | 'nova_aba'
  hideChrome: boolean
}

export default class WpMigrate extends BaseCommand {
  static commandName = 'wp:migrate'
  static description = 'Import ALL WordPress data into AdonisJS'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Skip image download' })
  declare skipImages: boolean

  @flags.boolean({ description: 'Only download images' })
  declare onlyImages: boolean

  @flags.boolean({ description: 'Force re-import (clear + reimport)' })
  declare force: boolean

  private wpDir = ''

  async run() {
    this.logger.info('╔══════════════════════════════════════╗')
    this.logger.info('║  WordPress → AdonisJS Full Migration ║')
    this.logger.info('╚══════════════════════════════════════╝')

    if (!this.skipImages) await this.downloadAssets()
    if (this.onlyImages) return

    const dataPath = join(app.appRoot.pathname, 'database', 'migration_data.json')
    const extraPath = join(app.appRoot.pathname, 'database', 'migration_extra.json')
    const quickLinksPath = join(app.appRoot.pathname, 'database', 'wp_quick_links.json')

    if (!existsSync(dataPath) || !existsSync(extraPath)) {
      this.logger.error('migration_data.json or migration_extra.json not found!')
      return
    }

    const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
    const extra = JSON.parse(readFileSync(extraPath, 'utf-8'))
    const quickLinks = existsSync(quickLinksPath)
      ? JSON.parse(readFileSync(quickLinksPath, 'utf-8')).records
      : extra.lr_links
    this.wpDir = '/uploads/wp-migration'

    // ── Core data ──
    let legislature: Legislature | null = null
    let biennium: Biennium | null = null
    try {
      legislature = await this.ensureLegislature()
      biennium = await this.ensureBiennium(legislature)
    } catch (error) {
      this.logger.error(`  Legislature/Biennium FAILED: ${this.errMsg(error)}`)
    }

    await this.runSection('News', () => this.importNews(data.news))
    if (legislature) {
      const leg = legislature
      await this.runSection('Vereadores', () => this.importVereadores(data.vereadores, leg))
      await this.runSection('Comissões', () => this.importComissoes(data.comissoes, leg))
    } else {
      this.logger.warning('  Skipping Vereadores/Comissões (no legislature)')
    }
    if (biennium) {
      const bien = biennium
      await this.runSection('Mesa Diretora', () => this.importMesaDiretora(data.mesa_diretora, bien))
    } else {
      this.logger.warning('  Skipping Mesa Diretora (no biennium)')
    }
    await this.runSection('FAQs', () => this.importFaqs(data.faqs))
    await this.runSection('Survey Questions', () => this.importSurveyQuestions(data.survey_questions))

    // ── Extra data ──
    await this.runSection('Quick Links', () => this.importQuickLinks(quickLinks))
    await this.runSection('Matérias', () => this.importMaterias(extra.materias))
    // Atividades legislativas + AUTORIA dos vereadores (backup novo do WP).
    // Roda DEPOIS de Matérias: é a fonte autoritativa de `legislative_activities`.
    await this.runSection('Atividades + Autoria', () => this.importActivitiesWithAuthors())
    await this.runSection('Publicações', () =>
      this.importPublicacoes(extra.publicacoes, extra.pub_attachments)
    )
    await this.runSection('Atas/Sessões', () => this.importAtas(extra.atas, extra.ata_attachments))
    await this.runSection('Atas/Pautas (tabelas)', async () => {
      const { atas, pautas } = await seedAtasPautasFromSessions()
      if (atas || pautas) {
        this.logger.success(`  Atas: ${atas}, Pautas: ${pautas}`)
      }
    })
    await this.runSection('Transparência', () =>
      this.importTransparencia(extra.transparencia, quickLinks)
    )
    // Registros PNTP (Acesso à Informação): a fonte autoritativa agora é o
    // comando `wp:pntp` (lê database/wp_pntp.json — 98 registros, dados atuais,
    // categoria por SLUG e download dos PDFs). O import antigo gravava a
    // categoria pelo NOME ("Estagiários") em vez do slug, então as páginas
    // dinâmicas (filtram por slug) ficavam vazias. Mantido o método abaixo
    // apenas para referência/uso manual, mas não roda na migração padrão.

    this.logger.success('\n══════════════════════════════════')
    this.logger.success('  ✓ Migration complete!')
    this.logger.success('══════════════════════════════════')
  }

  /** Runs an import section, logging failures without aborting the whole command. */
  private async runSection(name: string, fn: () => Promise<void>) {
    try {
      await fn()
    } catch (error) {
      this.logger.error(`  Section "${name}" FAILED: ${this.errMsg(error)}`)
    }
  }

  private errMsg(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }

  // ═══════════════════════════════════════
  // ASSETS
  // ═══════════════════════════════════════
  async downloadAssets() {
    const uploadsDir = join(app.publicPath(), 'uploads')
    const wpDir = join(uploadsDir, 'wp-migration')
    if (existsSync(join(wpDir, 'news')) && !this.force) {
      this.logger.info('Assets already exist. Use --force to re-download.')
      return
    }
    mkdirSync(uploadsDir, { recursive: true })
    const tarPath = join(uploadsDir, 'wp-migration-images.tar.gz')
    const url =
      'https://github.com/damizs/wordpress-to-nodejs/releases/download/v1.0.0/wp-migration-images.tar.gz'
    this.logger.info('Downloading assets (~127MB)...')
    try {
      execSync(`curl -sL "${url}" -o "${tarPath}"`, { stdio: 'inherit', timeout: 600000 })
      mkdirSync(wpDir, { recursive: true })
      execSync(`tar xzf "${tarPath}" -C "${wpDir}"`, { stdio: 'inherit' })
      execSync(`rm -f "${tarPath}"`)
      this.logger.success('Assets extracted!')
    } catch {
      this.logger.warning('Download failed. Run later: node ace wp:migrate --only-images')
    }
  }

  // ═══════════════════════════════════════
  // LEGISLATURE + BIENNIUM
  // ═══════════════════════════════════════
  async ensureLegislature(): Promise<Legislature> {
    this.logger.info('\n━━━ Legislature & Biennium ━━━')
    const leg = await Legislature.updateOrCreate(
      { name: '11ª LEGISLATURA - 2025/2028' },
      {
        name: '11ª LEGISLATURA - 2025/2028',
        number: 11,
        startDate: '2025-01-01',
        endDate: '2028-12-31',
        isCurrent: true,
      }
    )
    // Deactivate others
    await Legislature.query().whereNot('id', leg.id).update({ isCurrent: false })
    this.logger.success(`  Legislature: ${leg.name} (ID ${leg.id})`)
    return leg
  }

  async ensureBiennium(legislature: Legislature): Promise<Biennium> {
    const bien = await Biennium.updateOrCreate(
      { name: 'BIÊNIO 2025/2026' },
      {
        name: 'BIÊNIO 2025/2026',
        legislatureId: legislature.id,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
        isCurrent: true,
      }
    )
    await Biennium.query().whereNot('id', bien.id).update({ isCurrent: false })
    this.logger.success(`  Biennium: ${bien.name} (ID ${bien.id})`)
    return bien
  }

  // ═══════════════════════════════════════
  // 1. NEWS (107)
  // ═══════════════════════════════════════
  async importNews(newsData: any[]) {
    this.logger.info(`\n━━━ News: ${newsData.length} items ━━━`)
    const category = await NewsCategory.updateOrCreate(
      { slug: 'noticias' },
      { name: 'Notícias', slug: 'noticias' }
    )
    const admin = await User.findBy('email', IMPORT_ADMIN_EMAIL)
    if (this.force) {
      await News.query().delete()
      this.logger.info('  Cleared')
    }

    let ok = 0
    let skip = 0
    for (const n of newsData) {
      if (!this.force && (await News.findBy('slug', n.slug))) {
        skip++
        continue
      }
      try {
        await News.create({
          title: n.title,
          slug: n.slug,
          excerpt: n.excerpt || null,
          content: this.cleanContent(n.content),
          coverImageUrl: n.new_cover ? `${this.wpDir}/${n.new_cover}` : null,
          status: 'published',
          publishedAt: DateTime.fromSQL(n.date),
          categoryId: category.id,
          authorId: admin?.id || null,
          viewsCount: 0,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: ${n.title.substring(0, 50)}`)
      }
    }
    this.logger.success(`  News: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 2. VEREADORES (11) - Full data
  // ═══════════════════════════════════════
  async importVereadores(vereadoresData: any[], legislature: Legislature) {
    this.logger.info(`\n━━━ Vereadores: ${vereadoresData.length} items ━━━`)
    if (this.force) {
      await CouncilorPosition.query().delete()
      await CommitteeMember.query().delete()
      await Councilor.query().delete()
      this.logger.info('  Cleared')
    }

    let ok = 0
    let upd = 0
    for (const [i, v] of vereadoresData.entries()) {
      const photoUrl = v.new_photo ? `${this.wpDir}/${v.new_photo}` : null
      const existing = await Councilor.findBy('slug', v.slug)
      const fields = {
        name: v.name,
        fullName: v.name,
        parliamentaryName: v.parliamentary_name?.trim() || null,
        slug: v.slug,
        email: v.email || null,
        gender: v.gender || null,
        maritalStatus: v.marital_status || null,
        educationLevel: v.education || null,
        photoUrl,
        isActive: true,
        legislatureId: legislature.id,
        displayOrder: i + 1,
        role: 'Vereador(a)',
        ...(v.bio ? { bio: this.cleanContent(v.bio) } : {}),
      }

      if (existing) {
        existing.merge(fields)
        await existing.save()
        upd++
      } else {
        try {
          await Councilor.create(fields)
          ok++
        } catch {
          this.logger.warning(`  FAIL: ${v.name}`)
        }
      }
    }
    this.logger.success(`  Vereadores: ${ok} imported, ${upd} updated`)
  }

  // ═══════════════════════════════════════
  // 3. MESA DIRETORA (4 cargos)
  // ═══════════════════════════════════════
  async importMesaDiretora(mesaData: any[], biennium: Biennium) {
    this.logger.info(`\n━━━ Mesa Diretora: ${mesaData.length} cargos ━━━`)

    let ok = 0
    for (const m of mesaData) {
      const councilor = await Councilor.findBy('name', m.name)
      if (!councilor) {
        this.logger.warning(`  Councilor not found: ${m.name}`)
        continue
      }

      // Update councilor role
      councilor.role = m.role
      await councilor.save()

      // Create position record
      const existing = await CouncilorPosition.query()
        .where('councilorId', councilor.id)
        .where('bienniumId', biennium.id)
        .first()

      if (!existing) {
        await CouncilorPosition.create({
          councilorId: councilor.id,
          bienniumId: biennium.id,
          position: m.role,
        })
        ok++
      }
    }
    this.logger.success(`  Mesa Diretora: ${ok} positions created`)
  }

  // ═══════════════════════════════════════
  // 4. COMISSÕES (4 comissões + 12 membros)
  // ═══════════════════════════════════════
  async importComissoes(comissoesData: any[], legislature: Legislature) {
    this.logger.info(`\n━━━ Comissões: ${comissoesData.length} ━━━`)
    if (this.force) {
      await CommitteeMember.query().delete()
      await Committee.query().delete()
      this.logger.info('  Cleared')
    }

    let comOk = 0
    let memOk = 0
    for (const c of comissoesData) {
      const slug = this.slugify(c.name)
      let committee = await Committee.findBy('slug', slug)

      if (!committee) {
        committee = await Committee.create({
          name: c.name,
          slug,
          description: c.description || null,
          type: 'permanente',
          legislatureId: legislature.id,
          isActive: true,
        })
        comOk++
      }

      // Add members
      for (const mem of c.members) {
        const councilor = await Councilor.findBy('name', mem.name)
        if (!councilor) {
          this.logger.warning(`  Member not found: ${mem.name}`)
          continue
        }

        const existing = await CommitteeMember.query()
          .where('committeeId', committee.id)
          .where('councilorId', councilor.id)
          .first()

        if (!existing) {
          await CommitteeMember.create({
            committeeId: committee.id,
            councilorId: councilor.id,
            role: mem.role,
          })
          memOk++
        }
      }
    }
    this.logger.success(`  Comissões: ${comOk} created, ${memOk} members added`)
  }

  // ═══════════════════════════════════════
  // 5. FAQs (21)
  // ═══════════════════════════════════════
  async importFaqs(faqsData: any[]) {
    this.logger.info(`\n━━━ FAQs: ${faqsData.length} items ━━━`)
    if (this.force) {
      await FaqItem.query().delete()
    }

    let ok = 0
    let skip = 0
    for (const [i, faq] of faqsData.entries()) {
      if (!this.force && (await FaqItem.findBy('question', faq.question))) {
        skip++
        continue
      }
      const answer = faq.answer
        .replace(/<\/?p>/g, '')
        .replace(/<br\s*\/?>/g, '\n')
        .trim()
      try {
        await FaqItem.create({
          question: faq.question,
          answer,
          category: this.categorizeFaq(faq.question),
          displayOrder: i + 1,
          isActive: true,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: ${faq.question.substring(0, 40)}`)
      }
    }
    this.logger.success(`  FAQs: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 6. PESQUISA DE SATISFAÇÃO (5 perguntas)
  // ═══════════════════════════════════════
  async importSurveyQuestions(questions: any[]) {
    this.logger.info(`\n━━━ Survey Questions: ${questions.length} ━━━`)
    if (this.force) {
      await SurveyQuestion.query().delete()
    }

    let ok = 0
    let skip = 0
    for (const q of questions) {
      const existing = await SurveyQuestion.findBy('displayOrder', q.number)
      if (existing) {
        skip++
        continue
      }

      try {
        await SurveyQuestion.create({
          question: q.text,
          isActive: true,
          displayOrder: q.number,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: Q${q.number}`)
      }
    }
    this.logger.success(`  Survey Questions: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 7. QUICK LINKS (28)
  // ═══════════════════════════════════════
  async importQuickLinks(links: any[]) {
    // No WP, secao_id 1 = Acesso Rápido (legislativo); secao_id 2 = Acesso à Informação
    // (categorias PNTP — já importadas em information_records / system_categories).
    const legislative = links.filter((l) => String(l.secao_id) === '1')
    this.logger.info(
      `\n━━━ Quick Links: ${legislative.length} legislativos (${links.length - legislative.length} AI ignorados) ━━━`
    )
    if (this.force) {
      await QuickLink.query().delete()
    }

    const iconMap: Record<string, string> = {
      'fas fa-video': 'Video',
      'fas fa-users': 'Users',
      'fas fa-building': 'Building2',
      'fas fa-landmark': 'Landmark',
      'fas fa-user-tie': 'UserCheck',
      'fas fa-award': 'Award',
      'fas fa-file-alt': 'FileText',
      'fas fa-table': 'Table',
      'fas fa-hard-hat': 'HardHat',
      'fas fa-dollar-sign': 'DollarSign',
      'fas fa-coins': 'Coins',
      'fas fa-user-graduate': 'GraduationCap',
      'fas fa-id-badge': 'BadgeCheck',
      'fas fa-clipboard-list': 'ClipboardList',
      'fas fa-handshake': 'Handshake',
      'fas fa-file-signature': 'FileSignature',
      'fas fa-sitemap': 'Network',
      'fas fa-chart-pie': 'PieChart',
      'fas fa-envelope-open-text': 'MailOpen',
      'fas fa-clipboard-check': 'ClipboardCheck',
      'fas fa-chart-line': 'TrendingUp',
      'fas fa-book-open': 'BookOpen',
      'fas fa-exclamation-circle': 'AlertCircle',
      'fas fa-gavel': 'Gavel',
      'fas fa-search': 'Search',
      'fas fa-calendar': 'Calendar',
      'fas fa-file-contract': 'FileText',
    }

    let ok = 0
    let skip = 0
    for (const [i, l] of legislative.entries()) {
      if (!l.active) continue
      // Domínio do site WP de origem parametrizado via config/camara (default = Sumé).
      let url = l.url
        .replace(`https://${camara.wpSourceDomain}/`, '/')
        .replace(`http://${camara.wpSourceDomain}/`, '/')
      // Dedupe by natural key (title + url) — table has no unique constraint
      const existing = await QuickLink.query().where('title', l.title).where('url', url).first()
      if (existing) {
        skip++
        continue
      }
      try {
        await QuickLink.create({
          title: l.title,
          url,
          icon: iconMap[l.icon] || 'Link',
          color: l.color,
          displayOrder: i + 1,
          isActive: true,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: ${l.title?.substring(0, 50)}`)
      }
    }
    this.logger.success(`  Quick Links: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 8. MATÉRIAS JETENGINE (504 → 3 tabelas)
  // ═══════════════════════════════════════
  async importMaterias(materias: any[]) {
    this.logger.info(`\n━━━ Matérias: ${materias.length} items ━━━`)

    if (this.force) {
      await LegislativeActivity.query().delete()
      await Licitacao.query().delete()
      await OfficialPublication.query()
        .whereIn('type', [
          'Portaria',
          'Ata Administrativa',
          'Edital',
          'Decreto',
          'Ato Administrativo',
          'Outros',
          'Resolução',
        ])
        .delete()
    }

    let legSkip = 0
    let licOk = 0
    let pubOk = 0
    let skip = 0

    for (const m of materias) {
      const content = this.cleanContent(m.conteudo)
      const year = m.dt_publicacao ? Number.parseInt(m.dt_publicacao.substring(0, 4)) : 2025
      const slug = this.slugify(`${m.tipo}-${m.codigo}`)
      const route = routeMateria({
        tipo: m.tipo,
        titulo: m.titulo,
        conteudo: content,
        codigo: m.codigo,
      })

      if (route.target === 'skip') {
        legSkip++
        continue
      }

      if (route.target === 'licitacao') {
        if (await Licitacao.findBy('slug', slug)) {
          skip++
          continue
        }
        try {
          await Licitacao.create({
            title: m.titulo,
            slug,
            number: m.codigo,
            modality: route.modality,
            status: 'concluida',
            object: m.titulo,
            content,
            year,
            fileUrl: route.fileUrl,
            isActive: true,
          })
          licOk++
        } catch {
          /* skip */
        }
        continue
      }

      if (await OfficialPublication.findBy('slug', slug)) {
        skip++
        continue
      }
      try {
        const description = content || null
        await OfficialPublication.create({
          title: m.titulo,
          slug,
          type: route.type,
          number: m.codigo,
          publicationDate: m.dt_publicacao || `${year}-01-01`,
          description,
          fileUrl: route.fileUrl,
        })
        pubOk++
      } catch {
        /* skip */
      }
    }

    this.logger.success(
      `  Legislative skipped: ${legSkip}, Licitações: ${licOk}, Publications: ${pubOk}, dup skip: ${skip}`
    )
  }

  // ═══════════════════════════════════════
  // 8b. ATIVIDADES LEGISLATIVAS + AUTORIA (backup novo do WP)
  // ═══════════════════════════════════════
  async importActivitiesWithAuthors() {
    // Lógica em serviço compartilhado (também usado pelo comando `wp:activities`,
    // disparado automaticamente no startup.sh). Fonte única e idempotente.
    await importActivitiesWithAuthors({ wpDir: this.wpDir, logger: this.logger })
  }

  // ═══════════════════════════════════════
  // 9. PUBLICAÇÕES OFICIAIS (24 + PDFs)
  // ═══════════════════════════════════════
  async importPublicacoes(pubs: any[], attachments: Record<string, any>) {
    this.logger.info(`\n━━━ Publicações Oficiais: ${pubs.length} items ━━━`)

    let ok = 0
    let skip = 0
    for (const p of pubs) {
      const slug = p.slug !== 'closed' ? p.slug : this.slugify(p.title)
      if (await OfficialPublication.findBy('slug', slug)) {
        skip++
        continue
      }
      const att = attachments[p.wp_id]
      const fileName = att?.path?.split('/').pop() || null
      const fileUrl = fileName ? `${this.wpDir}/pdfs/publicacoes/${fileName}` : null
      const lower = p.title.toLowerCase()
      let type = 'Outros'
      if (lower.includes('portaria')) type = 'Portaria'
      else if (lower.includes('decreto')) type = 'Decreto'
      else if (lower.includes('resolução')) type = 'Resolução'
      const numMatch = p.title.match(/[Nn]º?\s*(\d+[\/.]\d+|\d+)/)?.[1] || null

      try {
        await OfficialPublication.create({
          title: p.title,
          slug,
          type,
          number: numMatch,
          publicationDate: p.date,
          fileUrl,
          description: p.content || null,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: ${p.title.substring(0, 50)}`)
      }
    }
    this.logger.success(`  Publicações: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 10. ATAS / SESSÕES PLENÁRIAS (8 + PDFs)
  // ═══════════════════════════════════════
  async importAtas(atas: any[], attachments: Record<string, string>) {
    this.logger.info(`\n━━━ Atas/Sessões: ${atas.length} items ━━━`)
    if (this.force) {
      await PlenarySession.query().delete()
    }

    let ok = 0
    let skip = 0
    for (const a of atas) {
      if (a.title === 'Atas') continue
      const slug = this.slugify(a.title)
      if (await PlenarySession.findBy('slug', slug)) {
        skip++
        continue
      }
      const attPath = attachments[a.wp_id]
      const fileName = attPath?.split('/').pop() || null
      const fileUrl = fileName ? `${this.wpDir}/pdfs/atas/${fileName}` : null
      const lower = a.title.toLowerCase()
      let type: 'ordinaria' | 'extraordinaria' | 'solene' | 'especial' = 'ordinaria'
      if (lower.includes('extraordinári') || lower.includes('extraordinari'))
        type = 'extraordinaria'

      try {
        await PlenarySession.create({
          title: a.title,
          slug,
          type,
          sessionDate: a.date,
          year: Number.parseInt(a.date.substring(0, 4)),
          status: 'realizada',
          fileUrl,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: ${a.title.substring(0, 50)}`)
      }
    }
    this.logger.success(`  Sessions: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 11. TRANSPARÊNCIA (47 → sections + links)
  // ═══════════════════════════════════════
  private transparencyMatchKey(value: string): string {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractFirstUrl(value: string | null | undefined): string | null {
    const text = String(value || '')
      .replace(/\\\//g, '/')
      .replace(/&amp;/g, '&')
    return text.match(/href=["']([^"']+)["']/i)?.[1] || text.match(/https?:\/\/[^\s"'<>]+/i)?.[0] || null
  }

  private transparencyFallbackUrl(title: string): string {
    const key = this.transparencyMatchKey(title)

    if (/\be\s*sic\b|\besic\b|\bsic\b/.test(key)) return '/esic'
    if (key.includes('ouvidoria')) return '/ouvidoria'
    if (key.includes('diario oficial')) return '/diario-oficial'
    if (key.includes('votacao')) return '/votacoes'
    if (key.includes('diaria') || key.includes('passagem')) return '/diarias'
    if (key.includes('duodec')) return '/duodecimo'
    if (key.includes('empenho')) return '/empenhos-detalhados'
    if (key.includes('receita') || key.includes('transferencia recebida'))
      return '/transferencias-recebidas'
    if (key.includes('transferencia realizada')) return '/transferencias-realizadas'
    if (key.includes('rreo')) return '/relatorios-fiscais?tipo=RREO'
    if (key.includes('rgf')) return '/relatorios-fiscais?tipo=RGF'
    if (
      key.includes('verba') ||
      key.includes('folha') ||
      key.includes('servidor') ||
      key.includes('remuner') ||
      key.includes('pessoal') ||
      key.includes('comissiona') ||
      key.includes('cedido') ||
      key.includes('lotacao')
    )
      return '/verbas'
    if (key.includes('despesa') || key.includes('pagamento') || key.includes('extra orcament'))
      return '/despesas-mensais'
    if (key.includes('estagi')) return '/estagiarios'
    if (key.includes('terceir')) return '/terceirizados'
    if (key.includes('licitante sancionado')) return '/licitantes-sancionados'
    if (key.includes('licit') || key.includes('pregao')) return '/licitacoes'
    if (key.includes('aditivo')) return '/aditivos'
    if (key.includes('fiscal') && key.includes('contrato')) return '/fiscal-contrato'
    if (key.includes('contrato')) return '/contratos'
    if (key.includes('convenio') || key.includes('acordo') || key.includes('transferencia voluntaria'))
      return '/acordos'
    if (key.includes('obra')) return '/obras'
    if (key.includes('concurso') || key.includes('selecao publica')) return '/concursos'
    if (key.includes('estrutura')) return '/estrutura-organizacional'
    if (key.includes('carta')) return '/carta-servicos'
    if (key.includes('pca') || key.includes('plano de contratacao')) return '/pca'
    if (key.includes('plano estrategico')) return '/plano-estrategico'
    if (key.includes('prestacao')) return '/prestacao-contas'
    if (key.includes('parecer')) return '/parecer-contas'
    if (key.includes('apreciacao')) return '/apreciacao'
    if (key.includes('cronologica') || key === 'ocp') return '/ocp'
    if (key.includes('adesao') && key.includes('ata')) return '/adesao-ata-srp'
    if (key.includes('lai') || key.includes('acesso a informacao')) return '/acesso-a-informacao/lai'
    if (key.includes('lei') || key.includes('regimento') || key.includes('ldo') || key.includes('loa') || key.includes('ppa'))
      return '/publicacoes-oficiais'

    return '/acesso-a-informacao'
  }

  private canonicalizeTransparencyPath(path: string, title: string): string {
    const cleanPath = `/${String(path || '').replace(/^\/+/, '')}`
    const [pathname, suffix = ''] = cleanPath.split(/(?=[?#])/)
    const slug = this.slugify(pathname.split('/').filter(Boolean)[0] || '')

    if (!slug || slug === 'transparencia') return this.transparencyFallbackUrl(title)

    const aliases: Record<string, string> = {
      relatoriogestao: '/relatorio-gestao',
      'relatorio-gestao': '/relatorio-gestao',
      'prestacao-de-contas': '/prestacao-contas',
      'prestacao-contas': '/prestacao-contas',
      transfrealizada: '/transferencias-realizadas',
      transfvoluntaria: '/transferencias-recebidas',
      'transferencia-voluntaria': '/transferencias-recebidas',
      convenio: '/acordos',
      convenios: '/acordos',
      'transferencias-recebidas': '/transferencias-recebidas',
      'transferencias-realizadas': '/transferencias-realizadas',
      estrutura: '/estrutura-organizacional',
      'estrutura-organiza': '/estrutura-organizacional',
      'estrutura-organizacional': '/estrutura-organizacional',
      'carta-de-servicos': '/carta-servicos',
      'carta-servicos': '/carta-servicos',
      'plano-contratacao': '/pca',
      'plano-contratacoes': '/pca',
      'plano-estrategico': '/plano-estrategico',
      'verbas-indenizatorias': '/verbas',
      'verbas-idenizatorias': '/verbas',
      'verbas-indenizatoria': '/verbas',
      duodecimos: '/duodecimo',
      duodecimo: '/duodecimo',
      'despesas-mensais': '/despesas-mensais',
      'empenhos-detalhados': '/empenhos-detalhados',
      'adesao-ata': '/adesao-ata-srp',
      'adesao-de-atas': '/adesao-ata-srp',
      'adesao-ata-srp': '/adesao-ata-srp',
      'votacoes-nominais': '/votacoes',
      votacoes: '/votacoes',
      'licitantes-sancionados': '/licitantes-sancionados',
      'fiscal-contrato': '/fiscal-contrato',
      'parecer-contas': '/parecer-contas',
      'apreciacao-contas': '/apreciacao',
      apreciacao: '/apreciacao',
      concursos: '/concursos',
      diarias: '/diarias',
      rgf: '/relatorios-fiscais?tipo=RGF',
      rreo: '/relatorios-fiscais?tipo=RREO',
      ocp: '/ocp',
      pca: '/pca',
      acordos: '/acordos',
      contratos: '/contratos',
      licitacoes: '/licitacoes',
      licitacao: '/licitacoes',
      esic: '/esic',
      'e-sic': '/esic',
      ouvidoria: '/ouvidoria',
    }

    const canonical = aliases[slug] || `/${slug}`
    return canonical.includes('?') ? canonical : `${canonical}${suffix}`
  }

  private normalizeTransparencyTarget(title: string, rawUrl: string | null): TransparencyTarget {
    const fallback = this.transparencyFallbackUrl(title)
    let url = String(rawUrl || fallback)
      .trim()
      .replace(/\\\//g, '/')
      .replace(/&amp;/g, '&')

    if (!url || url === '#') url = fallback

    if (url.startsWith('/')) {
      const internal = this.canonicalizeTransparencyPath(url, title)
      return { url: internal, isExternal: false, openMode: 'modal', hideChrome: true }
    }

    try {
      const parsed = new URL(url)
      const sourceHost = camara.wpSourceDomain.replace(/^www\./, '')
      const urlHost = parsed.hostname.replace(/^www\./, '')
      if (urlHost === sourceHost) {
        const internal = this.canonicalizeTransparencyPath(
          `${parsed.pathname}${parsed.search}${parsed.hash}`,
          title
        )
        return { url: internal, isExternal: false, openMode: 'modal', hideChrome: true }
      }
      return { url, isExternal: true, openMode: 'nova_aba', hideChrome: true }
    } catch {
      const internal = this.canonicalizeTransparencyPath(url, title)
      return { url: internal, isExternal: false, openMode: 'modal', hideChrome: true }
    }
  }

  private findTransparencyQuickLink(title: string, links: any[]): any | null {
    const titleKey = this.transparencyMatchKey(title)
    const candidates = links.filter(
      (link) => String(link.secao_id) === '2' && link.active !== false && link.title && link.url
    )
    return (
      candidates.find((link) => {
        const linkKey = this.transparencyMatchKey(link.title)
        if (!linkKey) return false
        if (titleKey === linkKey || titleKey.includes(linkKey)) return true
        const titleWords = titleKey.split(' ').filter(Boolean).length
        const linkWords = linkKey.split(' ').filter(Boolean).length
        if (titleWords > 1 && linkWords <= 2 && linkKey.includes(titleKey)) return true
        if (titleKey.includes('diaria') && linkKey.includes('diaria')) return true
        if (titleKey.includes('duodec') && linkKey.includes('duodec')) return true
        if (titleKey.includes('empenho') && linkKey.includes('empenho')) return true
        if (titleKey.includes('despesa') && linkKey.includes('despesa')) return true
        if (titleKey.includes('receita') && linkKey.includes('receita')) return true
        if (titleKey.includes('verba') && linkKey.includes('verba')) return true
        if (titleKey.includes('votacao') && linkKey.includes('votacao')) return true
        return false
      }) || null
    )
  }

  private transparencyTargetFor(item: any, quickLinks: any[]): TransparencyTarget {
    const title = item.title || ''
    const titleUrl = this.transparencyFallbackUrl(title)
    if (titleUrl === '/esic' || titleUrl === '/ouvidoria') {
      return this.normalizeTransparencyTarget(title, titleUrl)
    }

    const quickLink = this.findTransparencyQuickLink(title, quickLinks)
    const rawUrl =
      quickLink?.url ||
      item.url ||
      this.extractFirstUrl(item.content) ||
      this.extractFirstUrl(item.description) ||
      titleUrl

    return this.normalizeTransparencyTarget(title, rawUrl)
  }

  private async uniqueTransparencySlug(base: string, ignoreId?: number): Promise<string> {
    const root = this.slugify(base) || 'link'
    let slug = root
    let suffix = 2
    while (true) {
      const query = TransparencyLink.query().where('slug', slug)
      if (ignoreId) query.whereNot('id', ignoreId)
      const existing = await query.first()
      if (!existing) return slug
      slug = `${root}-${suffix++}`
    }
  }

  async importTransparencia(items: any[], quickLinks: any[] = []) {
    const sourceItems =
      items.length > 0
        ? items
        : quickLinks
            .filter((link) => String(link.secao_id) === '2' && link.active !== false && link.title)
            .map((link) => ({
              title: link.title,
              slug: this.slugify(link.title),
              url: link.url,
            }))

    this.logger.info(`\n━━━ Transparência: ${sourceItems.length} items ━━━`)
    if (this.force) {
      await TransparencyLink.query().delete()
      await TransparencySection.query().delete()
    }

    const sections: Record<string, any[]> = {
      'Despesas e Receitas': [],
      'Pessoal e Servidores': [],
      'Licitações e Contratos': [],
      'Gestão e Planejamento': [],
      'Legislação e Normas': [],
      'Outros': [],
    }
    const sectionMap = (title: string): string => {
      const l = title.toLowerCase()
      if (
        l.includes('despesa') ||
        l.includes('receita') ||
        l.includes('orçament') ||
        l.includes('diária') ||
        l.includes('covid') ||
        l.includes('pagamento') ||
        l.includes('extra')
      )
        return 'Despesas e Receitas'
      if (
        l.includes('servidor') ||
        l.includes('folha') ||
        l.includes('cedido') ||
        l.includes('comissiona') ||
        l.includes('efetivo') ||
        l.includes('lotação') ||
        l.includes('remuneração')
      )
        return 'Pessoal e Servidores'
      if (
        l.includes('contrato') ||
        l.includes('licitaç') ||
        l.includes('convenio') ||
        l.includes('convênio')
      )
        return 'Licitações e Contratos'
      if (
        l.includes('rgf') ||
        l.includes('gestão') ||
        l.includes('planej') ||
        l.includes('prestação') ||
        l.includes('pca') ||
        l.includes('parecer') ||
        l.includes('carta')
      )
        return 'Gestão e Planejamento'
      if (l.includes('lei') || l.includes('regulament') || l.includes('lai'))
        return 'Legislação e Normas'
      return 'Outros'
    }
    for (const t of sourceItems) {
      if (t.title === 'Transparência') continue
      sections[sectionMap(t.title)].push(t)
    }
    const icons: Record<string, string> = {
      'Despesas e Receitas': 'DollarSign',
      'Pessoal e Servidores': 'Users',
      'Licitações e Contratos': 'FileText',
      'Gestão e Planejamento': 'BarChart3',
      'Legislação e Normas': 'Scale',
      'Outros': 'FolderOpen',
    }

    let secOk = 0
    let secSkip = 0
    let linkOk = 0
    let linkUpdated = 0
    let linkSkip = 0
    let order = 1
    for (const [secName, sectionItems] of Object.entries(sections)) {
      if (sectionItems.length === 0) continue
      const secSlug = this.slugify(secName)
      let section = await TransparencySection.findBy('slug', secSlug)
      if (section) {
        secSkip++
      } else {
        section = await TransparencySection.create({
          title: secName,
          slug: secSlug,
          icon: icons[secName] || 'Link',
          displayOrder: order,
          isActive: true,
        })
        secOk++
      }
      order++
      for (const [i, item] of sectionItems.entries()) {
        const title = item.title
        const target = this.transparencyTargetFor(item, quickLinks)
        const existingLink = await TransparencyLink.query()
          .where('sectionId', section.id)
          .where('title', title)
          .first()
        if (existingLink) {
          const needsRepair =
            !existingLink.slug ||
            existingLink.url.startsWith('/transparencia/') ||
            existingLink.url !== target.url ||
            existingLink.openMode !== target.openMode ||
            existingLink.isExternal !== target.isExternal

          if (!needsRepair) {
            linkSkip++
            continue
          }

          existingLink.merge({
            slug: existingLink.slug || (await this.uniqueTransparencySlug(item.slug || title, existingLink.id)),
            url: target.url,
            displayOrder: i + 1,
            isExternal: target.isExternal,
            openMode: target.openMode,
            hideChrome: target.hideChrome,
          })
          await existingLink.save()
          linkUpdated++
          continue
        }
        try {
          await TransparencyLink.create({
            sectionId: section.id,
            title: title,
            slug: await this.uniqueTransparencySlug(item.slug || title),
            url: target.url,
            displayOrder: i + 1,
            isExternal: target.isExternal,
            openMode: target.openMode,
            hideChrome: target.hideChrome,
          })
          linkOk++
        } catch {
          this.logger.warning(`  FAIL link: ${title.substring(0, 50)}`)
        }
      }
    }
    this.logger.success(
      `  Sections: ${secOk} created, ${secSkip} skipped | Links: ${linkOk} created, ${linkUpdated} updated, ${linkSkip} skipped`
    )
  }

  // ═══════════════════════════════════════
  // 12. INFORMATION RECORDS (23 PNTP)
  // ═══════════════════════════════════════
  async importInformationRecords(registros: any[], anexos: any[]) {
    this.logger.info(`\n━━━ Information Records: ${registros.length} items ━━━`)
    if (this.force) {
      await InformationRecord.query().delete()
    }

    const catMap: Record<string, string> = {
      'estagiarios': 'Estagiários',
      'terceirizados': 'Terceirizados',
      'concursos': 'Concursos',
      'estrutura': 'Estrutura Organizacional',
      'diarias': 'Diárias',
      'convenios': 'Convênios e Transferências',
      'acordos-firmados': 'Acordos Firmados',
      'plano-contratacoes': 'Plano de Contratações',
      'obras': 'Obras',
      'prestacao-contas': 'Prestação de Contas',
      'relatorio-gestao': 'Relatório de Gestão',
      'apreciacao-contas': 'Apreciação de Contas',
      'rgf': 'RGF',
      'plano-estrategico': 'Plano Estratégico',
      'parecer-contas': 'Parecer de Contas',
      'carta-servicos': 'Carta de Serviços',
      'verbas-indenizatorias': 'Verbas Indenizatórias',
    }

    let ok = 0
    let skip = 0
    for (const r of registros) {
      const category = catMap[r.secao] || r.secao
      const year = r.ano || 2026
      // No slug column — dedupe by natural key (title + category + year)
      const existing = await InformationRecord.query()
        .where('title', r.titulo)
        .where('category', category)
        .where('year', year)
        .first()
      if (existing) {
        skip++
        continue
      }
      const regAnexos = anexos.filter((a: any) => a.registro_id === r.id)
      const fileName = regAnexos[0]?.path?.split('/').pop() || null
      const fileUrl = fileName ? `${this.wpDir}/pdfs/pntp/${fileName}` : null
      try {
        await InformationRecord.create({
          title: r.titulo,
          category,
          year,
          content: r.conteudo || null,
          fileUrl,
          isActive: r.ativo,
          displayOrder: r.ordem,
        })
        ok++
      } catch {
        this.logger.warning(`  FAIL: ${r.titulo.substring(0, 50)}`)
      }
    }
    this.logger.success(`  Information Records: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════
  private cleanContent(c: string): string {
    let text = c
      .replace(/\\\\r\\\\n/g, '\n')
      .replace(/\\r\\n/g, '\n')
      .replace(/\\\\\"/g, '"')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\'/g, "'")
      .replace(/\[\/?(vc_|et_|fusion_|elementor)[^\]]*\]/g, '')
      .replace(/\r\n/g, '\n')
      .trim()

    // If content doesn't have HTML block tags, wrap paragraphs
    if (!/<(p|div|h[1-6]|ul|ol|table|blockquote)\b/i.test(text)) {
      text = text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => {
          const ytMatch = p.match(
            /https?:\/\/(www\.)?(youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([\w-]+)/
          )
          if (ytMatch) {
            return `<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/${ytMatch[3]}" frameborder="0" allowfullscreen class="w-full h-full rounded-xl"></iframe></div>`
          }
          return `<p>${p.replace(/\n/g, '<br>')}</p>`
        })
        .join('\n')
    }
    return text
  }
  private slugify(t: string): string {
    return t
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80)
  }
  private categorizeFaq(q: string): string {
    const l = q.toLowerCase()
    if (
      l.includes('informação') ||
      l.includes('informaç') ||
      l.includes('prazo') ||
      l.includes('cobrar') ||
      l.includes('recusa') ||
      l.includes('acesso') ||
      l.includes('obrigado') ||
      l.includes('anônimo')
    )
      return 'LAI'
    if (
      l.includes('transparência') ||
      l.includes('gasto') ||
      l.includes('salário') ||
      l.includes('licitaç') ||
      l.includes('contrato')
    )
      return 'Transparência'
    if (
      l.includes('sessão') ||
      l.includes('sessões') ||
      l.includes('plenár') ||
      l.includes('acompanhar')
    )
      return 'Sessões'
    if (
      l.includes('participar') ||
      l.includes('sugest') ||
      l.includes('reclam') ||
      l.includes('pedido')
    )
      return 'Participação'
    return 'Sobre a Câmara'
  }
}
