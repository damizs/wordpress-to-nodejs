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
import PlenarySession from '#models/plenary_session'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import QuickLink from '#models/quick_link'
import InformationRecord from '#models/information_record'
import Licitacao from '#models/licitacao'
import SurveyQuestion from '#models/survey_question'

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

    if (!existsSync(dataPath) || !existsSync(extraPath)) {
      this.logger.error('migration_data.json or migration_extra.json not found!')
      return
    }

    const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
    const extra = JSON.parse(readFileSync(extraPath, 'utf-8'))
    this.wpDir = '/uploads/wp-migration'

    // ── Core data ──
    const legislature = await this.ensureLegislature()
    const biennium = await this.ensureBiennium(legislature)
    await this.importNews(data.news)
    await this.importVereadores(data.vereadores, legislature)
    await this.importMesaDiretora(data.mesa_diretora, biennium)
    await this.importComissoes(data.comissoes, legislature)
    await this.importFaqs(data.faqs)
    await this.importSurveyQuestions(data.survey_questions)

    // ── Extra data ──
    await this.importQuickLinks(extra.lr_links)
    await this.importMaterias(extra.materias)
    await this.importPublicacoes(extra.publicacoes, extra.pub_attachments)
    await this.importAtas(extra.atas, extra.ata_attachments)
    await this.importTransparencia(extra.transparencia)
    await this.importInformationRecords(extra.registros_pntp, extra.anexos_pntp)

    this.logger.success('\n══════════════════════════════════')
    this.logger.success('  ✓ Migration complete!')
    this.logger.success('══════════════════════════════════')
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
    const url = 'https://github.com/damizs/wordpress-to-nodejs/releases/download/v1.0.0/wp-migration-images.tar.gz'
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
      { name: '11ª LEGISLATURA - 2025/2028', number: 11, startDate: '2025-01-01', endDate: '2028-12-31', isCurrent: true }
    )
    // Deactivate others
    await Legislature.query().whereNot('id', leg.id).update({ isCurrent: false })
    this.logger.success(`  Legislature: ${leg.name} (ID ${leg.id})`)
    return leg
  }

  async ensureBiennium(legislature: Legislature): Promise<Biennium> {
    const bien = await Biennium.updateOrCreate(
      { name: 'BIÊNIO 2025/2026' },
      { name: 'BIÊNIO 2025/2026', legislatureId: legislature.id, startDate: '2025-01-01', endDate: '2026-12-31', isCurrent: true }
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
      { slug: 'noticias' }, { name: 'Notícias', slug: 'noticias' }
    )
    const admin = await User.findBy('email', 'admin@camaradesume.pb.gov.br')
    if (this.force) { await News.query().delete(); this.logger.info('  Cleared') }

    let ok = 0, skip = 0
    for (const n of newsData) {
      if (!this.force && await News.findBy('slug', n.slug)) { skip++; continue }
      try {
        await News.create({
          title: n.title, slug: n.slug,
          excerpt: n.excerpt || null,
          content: this.cleanContent(n.content),
          coverImageUrl: n.new_cover ? `${this.wpDir}/${n.new_cover}` : null,
          status: 'published', publishedAt: DateTime.fromSQL(n.date),
          categoryId: category.id, authorId: admin?.id || null, viewsCount: 0,
        })
        ok++
      } catch { this.logger.warning(`  FAIL: ${n.title.substring(0, 50)}`) }
    }
    this.logger.success(`  News: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 2. VEREADORES (11) - Full data
  // ═══════════════════════════════════════
  async importVereadores(vereadoresData: any[], legislature: Legislature) {
    this.logger.info(`\n━━━ Vereadores: ${vereadoresData.length} items ━━━`)
    if (this.force) { await CouncilorPosition.query().delete(); await CommitteeMember.query().delete(); await Councilor.query().delete(); this.logger.info('  Cleared') }

    let ok = 0, upd = 0
    for (let i = 0; i < vereadoresData.length; i++) {
      const v = vereadoresData[i]
      const photoUrl = v.new_photo ? `${this.wpDir}/${v.new_photo}` : null
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
      }

      const existing = await Councilor.findBy('slug', v.slug)
      if (existing) {
        existing.merge(fields)
        await existing.save()
        upd++
      } else {
        try { await Councilor.create(fields); ok++ }
        catch { this.logger.warning(`  FAIL: ${v.name}`) }
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
    if (this.force) { await CommitteeMember.query().delete(); await Committee.query().delete(); this.logger.info('  Cleared') }

    let comOk = 0, memOk = 0
    for (const c of comissoesData) {
      const slug = this.slugify(c.name)
      let committee = await Committee.findBy('slug', slug)

      if (!committee) {
        committee = await Committee.create({
          name: c.name, slug,
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
    if (this.force) { await FaqItem.query().delete() }

    let ok = 0, skip = 0
    for (let i = 0; i < faqsData.length; i++) {
      const faq = faqsData[i]
      if (!this.force && await FaqItem.findBy('question', faq.question)) { skip++; continue }
      const answer = faq.answer.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, '\n').trim()
      try {
        await FaqItem.create({ question: faq.question, answer, category: this.categorizeFaq(faq.question), displayOrder: i + 1, isActive: true })
        ok++
      } catch { this.logger.warning(`  FAIL: ${faq.question.substring(0, 40)}`) }
    }
    this.logger.success(`  FAQs: ${ok} imported, ${skip} skipped`)
  }

  // ═══════════════════════════════════════
  // 6. PESQUISA DE SATISFAÇÃO (5 perguntas)
  // ═══════════════════════════════════════
  async importSurveyQuestions(questions: any[]) {
    this.logger.info(`\n━━━ Survey Questions: ${questions.length} ━━━`)
    if (this.force) { await SurveyQuestion.query().delete() }

    let ok = 0
    for (const q of questions) {
      const existing = await SurveyQuestion.findBy('displayOrder', q.number)
      if (existing && !this.force) continue

      try {
        await SurveyQuestion.create({
          question: q.text,
          isActive: true,
          displayOrder: q.number,
        })
        ok++
      } catch { this.logger.warning(`  FAIL: Q${q.number}`) }
    }
    this.logger.success(`  Survey Questions: ${ok} imported`)
  }

  // ═══════════════════════════════════════
  // 7. QUICK LINKS (28)
  // ═══════════════════════════════════════
  async importQuickLinks(links: any[]) {
    this.logger.info(`\n━━━ Quick Links: ${links.length} items ━━━`)
    if (this.force) { await QuickLink.query().delete() }

    const iconMap: Record<string, string> = {
      'fas fa-video': 'Video', 'fas fa-users': 'Users', 'fas fa-building': 'Building2',
      'fas fa-landmark': 'Landmark', 'fas fa-user-tie': 'UserCheck', 'fas fa-award': 'Award',
      'fas fa-file-alt': 'FileText', 'fas fa-table': 'Table', 'fas fa-hard-hat': 'HardHat',
      'fas fa-dollar-sign': 'DollarSign', 'fas fa-coins': 'Coins', 'fas fa-user-graduate': 'GraduationCap',
      'fas fa-id-badge': 'BadgeCheck', 'fas fa-clipboard-list': 'ClipboardList', 'fas fa-handshake': 'Handshake',
      'fas fa-file-signature': 'FileSignature', 'fas fa-sitemap': 'Network', 'fas fa-chart-pie': 'PieChart',
      'fas fa-envelope-open-text': 'MailOpen', 'fas fa-clipboard-check': 'ClipboardCheck',
      'fas fa-chart-line': 'TrendingUp', 'fas fa-book-open': 'BookOpen',
      'fas fa-exclamation-circle': 'AlertCircle', 'fas fa-gavel': 'Gavel',
      'fas fa-search': 'Search', 'fas fa-calendar': 'Calendar', 'fas fa-file-contract': 'FileText',
    }

    let ok = 0
    for (let i = 0; i < links.length; i++) {
      const l = links[i]
      if (!l.active) continue
      let url = l.url.replace('https://camaradesume.pb.gov.br/', '/').replace('http://camaradesume.pb.gov.br/', '/')
      try {
        await QuickLink.create({ title: l.title, url, icon: iconMap[l.icon] || 'Link', color: l.color, displayOrder: i + 1, isActive: true })
        ok++
      } catch { /* skip */ }
    }
    this.logger.success(`  Quick Links: ${ok} imported`)
  }

  // ═══════════════════════════════════════
  // 8. MATÉRIAS JETENGINE (504 → 3 tabelas)
  // ═══════════════════════════════════════
  async importMaterias(materias: any[]) {
    this.logger.info(`\n━━━ Matérias: ${materias.length} items ━━━`)

    const legislativeTypes = new Set([
      'REQUERIMENTO', 'RESOLUÇÃO LEGISLATIVA', 'PROJETO DE LEI LEGISLATIVO',
      'INDICACAO', 'EMENDA', 'DECRETO LEGISLATIVO', 'PROJETO DE RESOLUÇÃO',
    ])
    const licitacaoTypes = new Set([
      'Aviso de Licitação', 'Extrato de Contrato', 'Termo de Adjudicação',
      'Extrato de Dispensa de Licitação', 'Demais Atos de Licitação',
      'Extrato de inexigibilidade', 'Extrato de Aditivo', 'Aviso de Habilitação',
      'Extrato de Ratificação', 'Edital de Licitação', 'Termo de Homologação',
      'Aditivo', 'RESULTADO',
    ])

    if (this.force) {
      await LegislativeActivity.query().delete()
      await Licitacao.query().delete()
      // Only delete matéria-sourced publications
      await OfficialPublication.query().whereIn('type', ['Portaria', 'Ata Administrativa', 'Edital', 'Decreto', 'Ato Administrativo', 'Outros']).delete()
    }

    let legOk = 0, licOk = 0, pubOk = 0
    for (const m of materias) {
      const content = this.cleanContent(m.conteudo)
      const year = m.dt_publicacao ? parseInt(m.dt_publicacao.substring(0, 4)) : 2025
      const slug = this.slugify(`${m.tipo}-${m.codigo}`)

      if (legislativeTypes.has(m.tipo)) {
        try {
          await LegislativeActivity.create({
            title: m.titulo, slug, type: m.tipo, number: m.codigo,
            year, summary: m.titulo, content, status: 'aprovado', isActive: true,
          })
          legOk++
        } catch { /* skip */ }
      } else if (licitacaoTypes.has(m.tipo)) {
        try {
          await Licitacao.create({
            title: m.titulo, slug, number: m.codigo, modality: m.tipo,
            status: 'concluida', object: m.titulo, content, year, isActive: true,
          })
          licOk++
        } catch { /* skip */ }
      } else {
        const typeMap: Record<string, string> = {
          'Portaria': 'Portaria', 'Ata': 'Ata Administrativa',
          'EDITAL': 'Edital', 'Decreto': 'Decreto',
          'Atos Administrativos': 'Ato Administrativo',
          'Outros Atos Administrativos': 'Ato Administrativo',
        }
        try {
          await OfficialPublication.create({
            title: m.titulo, slug, type: typeMap[m.tipo] || 'Outros',
            number: m.codigo, publicationDate: m.dt_publicacao || `${year}-01-01`,
            description: content.substring(0, 500) || null,
          })
          pubOk++
        } catch { /* skip */ }
      }
    }
    this.logger.success(`  Legislative: ${legOk}, Licitações: ${licOk}, Publications: ${pubOk}`)
  }

  // ═══════════════════════════════════════
  // 9. PUBLICAÇÕES OFICIAIS (24 + PDFs)
  // ═══════════════════════════════════════
  async importPublicacoes(pubs: any[], attachments: Record<string, any>) {
    this.logger.info(`\n━━━ Publicações Oficiais: ${pubs.length} items ━━━`)

    let ok = 0
    for (const p of pubs) {
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
          title: p.title, slug: p.slug !== 'closed' ? p.slug : this.slugify(p.title),
          type, number: numMatch, publicationDate: p.date, fileUrl, description: p.content || null,
        })
        ok++
      } catch { this.logger.warning(`  FAIL: ${p.title.substring(0, 50)}`) }
    }
    this.logger.success(`  Publicações: ${ok} imported`)
  }

  // ═══════════════════════════════════════
  // 10. ATAS / SESSÕES PLENÁRIAS (8 + PDFs)
  // ═══════════════════════════════════════
  async importAtas(atas: any[], attachments: Record<string, string>) {
    this.logger.info(`\n━━━ Atas/Sessões: ${atas.length} items ━━━`)
    if (this.force) { await PlenarySession.query().delete() }

    let ok = 0
    for (const a of atas) {
      if (a.title === 'Atas') continue
      const attPath = attachments[a.wp_id]
      const fileName = attPath?.split('/').pop() || null
      const fileUrl = fileName ? `${this.wpDir}/pdfs/atas/${fileName}` : null
      const lower = a.title.toLowerCase()
      let type: 'ordinaria' | 'extraordinaria' | 'solene' | 'especial' = 'ordinaria'
      if (lower.includes('extraordinári') || lower.includes('extraordinari')) type = 'extraordinaria'

      try {
        await PlenarySession.create({
          title: a.title, slug: this.slugify(a.title), type,
          sessionDate: a.date, year: parseInt(a.date.substring(0, 4)),
          status: 'realizada', fileUrl,
        })
        ok++
      } catch { this.logger.warning(`  FAIL: ${a.title.substring(0, 50)}`) }
    }
    this.logger.success(`  Sessions: ${ok} imported`)
  }

  // ═══════════════════════════════════════
  // 11. TRANSPARÊNCIA (47 → sections + links)
  // ═══════════════════════════════════════
  async importTransparencia(items: any[]) {
    this.logger.info(`\n━━━ Transparência: ${items.length} items ━━━`)
    if (this.force) { await TransparencyLink.query().delete(); await TransparencySection.query().delete() }

    const sections: Record<string, string[]> = {
      'Despesas e Receitas': [], 'Pessoal e Servidores': [],
      'Licitações e Contratos': [], 'Gestão e Planejamento': [],
      'Legislação e Normas': [], 'Outros': [],
    }
    const sectionMap = (title: string): string => {
      const l = title.toLowerCase()
      if (l.includes('despesa') || l.includes('receita') || l.includes('orçament') || l.includes('diária') || l.includes('covid') || l.includes('pagamento') || l.includes('extra')) return 'Despesas e Receitas'
      if (l.includes('servidor') || l.includes('folha') || l.includes('cedido') || l.includes('comissiona') || l.includes('efetivo') || l.includes('lotação') || l.includes('remuneração')) return 'Pessoal e Servidores'
      if (l.includes('contrato') || l.includes('licitaç') || l.includes('convenio') || l.includes('convênio')) return 'Licitações e Contratos'
      if (l.includes('rgf') || l.includes('gestão') || l.includes('planej') || l.includes('prestação') || l.includes('pca') || l.includes('parecer') || l.includes('carta')) return 'Gestão e Planejamento'
      if (l.includes('lei') || l.includes('regulament') || l.includes('lai')) return 'Legislação e Normas'
      return 'Outros'
    }
    for (const t of items) {
      if (t.title === 'Transparência') continue
      sections[sectionMap(t.title)].push(t.title)
    }
    const icons: Record<string, string> = {
      'Despesas e Receitas': 'DollarSign', 'Pessoal e Servidores': 'Users',
      'Licitações e Contratos': 'FileText', 'Gestão e Planejamento': 'BarChart3',
      'Legislação e Normas': 'Scale', 'Outros': 'FolderOpen',
    }

    let secOk = 0, linkOk = 0, order = 1
    for (const [secName, titles] of Object.entries(sections)) {
      if (titles.length === 0) continue
      const section = await TransparencySection.create({
        title: secName, slug: this.slugify(secName), icon: icons[secName] || 'Link',
        displayOrder: order++, isActive: true,
      })
      secOk++
      for (let i = 0; i < titles.length; i++) {
        try {
          await TransparencyLink.create({
            sectionId: section.id, title: titles[i],
            url: `/transparencia/${this.slugify(titles[i])}`,
            displayOrder: i + 1, isExternal: false,
          })
          linkOk++
        } catch { /* skip */ }
      }
    }
    this.logger.success(`  Sections: ${secOk}, Links: ${linkOk}`)
  }

  // ═══════════════════════════════════════
  // 12. INFORMATION RECORDS (23 PNTP)
  // ═══════════════════════════════════════
  async importInformationRecords(registros: any[], anexos: any[]) {
    this.logger.info(`\n━━━ Information Records: ${registros.length} items ━━━`)
    if (this.force) { await InformationRecord.query().delete() }

    const catMap: Record<string, string> = {
      'estagiarios': 'Estagiários', 'terceirizados': 'Terceirizados',
      'concursos': 'Concursos', 'estrutura': 'Estrutura Organizacional',
      'diarias': 'Diárias', 'convenios': 'Convênios e Transferências',
      'acordos-firmados': 'Acordos Firmados', 'plano-contratacoes': 'Plano de Contratações',
      'obras': 'Obras', 'prestacao-contas': 'Prestação de Contas',
      'relatorio-gestao': 'Relatório de Gestão', 'apreciacao-contas': 'Apreciação de Contas',
      'rgf': 'RGF', 'plano-estrategico': 'Plano Estratégico',
      'parecer-contas': 'Parecer de Contas', 'carta-servicos': 'Carta de Serviços',
      'verbas-indenizatorias': 'Verbas Indenizatórias',
    }

    let ok = 0
    for (const r of registros) {
      const regAnexos = anexos.filter((a: any) => a.registro_id === r.id)
      const fileName = regAnexos[0]?.path?.split('/').pop() || null
      const fileUrl = fileName ? `${this.wpDir}/pdfs/pntp/${fileName}` : null
      try {
        await InformationRecord.create({
          title: r.titulo, category: catMap[r.secao] || r.secao,
          year: r.ano || 2026, content: r.conteudo || null,
          fileUrl, isActive: r.ativo, displayOrder: r.ordem,
        })
        ok++
      } catch { this.logger.warning(`  FAIL: ${r.titulo.substring(0, 50)}`) }
    }
    this.logger.success(`  Information Records: ${ok} imported`)
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
          const ytMatch = p.match(/https?:\/\/(www\.)?(youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([\w-]+)/)
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
    return t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
  }
  private categorizeFaq(q: string): string {
    const l = q.toLowerCase()
    if (l.includes('informação') || l.includes('informaç') || l.includes('prazo') || l.includes('cobrar') || l.includes('recusa') || l.includes('acesso') || l.includes('obrigado') || l.includes('anônimo')) return 'LAI'
    if (l.includes('transparência') || l.includes('gasto') || l.includes('salário') || l.includes('licitaç') || l.includes('contrato')) return 'Transparência'
    if (l.includes('sessão') || l.includes('sessões') || l.includes('plenár') || l.includes('acompanhar')) return 'Sessões'
    if (l.includes('participar') || l.includes('sugest') || l.includes('reclam') || l.includes('pedido')) return 'Participação'
    return 'Sobre a Câmara'
  }
}
