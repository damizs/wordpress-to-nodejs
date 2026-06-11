import type { HttpContext } from '@adonisjs/core/http'
import NominalVoting from '#models/nominal_voting'
import NominalVotingEntry from '#models/nominal_voting_entry'
import PlenarySession from '#models/plenary_session'
import LegislativeActivity from '#models/legislative_activity'
import Councilor from '#models/councilor'
import VoteExtractorService from '#services/vote_extractor_service'

const VALID_VOTES = ['sim', 'nao', 'abstencao', 'ausente', 'nao_votou']
const VALID_RESULTS = ['aprovado', 'rejeitado', 'retirado', 'adiado', 'outro']

/** Coage datas vindas do banco (Date ou string ISO) para YYYY-MM-DD. */
function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().substring(0, 10)
  return String(value ?? '').substring(0, 10)
}

/** Normaliza para casar nomes de vereadores vindos da IA com o cadastro. */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchCouncilor(name: string, councilors: Councilor[]): Councilor | null {
  const target = normalizeName(name)
  for (const c of councilors) {
    const candidates = [c.name, c.parliamentaryName, c.fullName].filter(Boolean) as string[]
    if (candidates.some((cand) => {
      const n = normalizeName(cand)
      return n === target || n.includes(target) || target.includes(n)
    })) {
      return c
    }
  }
  return null
}

async function saveEntries(voting: NominalVoting, entries: any[], councilors: Councilor[]) {
  await NominalVotingEntry.query().where('nominal_voting_id', voting.id).delete()
  const rows = (Array.isArray(entries) ? entries : [])
    .filter((e) => e && (e.councilor_id || e.councilor_name))
    .map((e) => {
      const byId = e.councilor_id
        ? councilors.find((c) => c.id === Number(e.councilor_id))
        : null
      const matched = byId ?? (e.councilor_name ? matchCouncilor(e.councilor_name, councilors) : null)
      return {
        nominalVotingId: voting.id,
        councilorId: matched?.id ?? null,
        councilorName: String(e.councilor_name || matched?.name || '').slice(0, 255),
        party: matched?.party ?? (e.party ? String(e.party).slice(0, 50) : null),
        vote: VALID_VOTES.includes(e.vote) ? e.vote : 'nao_votou',
      }
    })
    .filter((r) => r.councilorName)
  if (rows.length > 0) await NominalVotingEntry.createMany(rows)
}

export default class NominalVotingsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('year', '')

    let query = NominalVoting.query()
      .preload('entries')
      .preload('plenarySession')
      .orderBy('voting_date', 'desc')
    if (year) query = query.where('year', year)

    const votings = await query.paginate(page, 20)
    const yearRows = await NominalVoting.query().distinct('year').orderBy('year', 'desc')

    return inertia.render('admin/votacoes/index', {
      votings: {
        data: votings.all().map((v) => ({
          id: v.id,
          title: v.title,
          voting_date: v.votingDate,
          year: v.year,
          result: v.result,
          is_unanimous: v.isUnanimous,
          is_published: v.isPublished,
          source: v.source,
          session_title: v.plenarySession?.title ?? null,
          votes_count: v.entries.length,
        })),
        meta: { total: votings.total, currentPage: votings.currentPage, lastPage: votings.lastPage },
      },
      years: yearRows.map((r) => r.year).filter(Boolean),
      filters: { year },
    })
  }

  private async formData() {
    const [sessions, activities, councilors] = await Promise.all([
      PlenarySession.query().orderBy('session_date', 'desc').limit(200),
      LegislativeActivity.query().where('is_active', true).orderBy('year', 'desc').limit(300),
      Councilor.query().where('is_active', true).orderBy('display_order', 'asc'),
    ])
    return {
      sessions: sessions.map((s) => ({ id: s.id, title: s.title, date: s.sessionDate })),
      activities: activities.map((a) => ({
        id: a.id,
        label: `${a.type} ${a.number}/${a.year} — ${(a.title || a.summary || '').slice(0, 80)}`,
      })),
      councilors: councilors.map((c) => ({
        id: c.id,
        name: c.parliamentaryName || c.name,
        party: c.party,
      })),
    }
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/votacoes/form', { voting: null, ...(await this.formData()) })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'description',
      'plenary_session_id',
      'legislative_activity_id',
      'voting_date',
      'result',
      'is_unanimous',
      'is_published',
    ])
    const entries = request.input('entries', [])

    if (!data.title || !data.voting_date) {
      session.flash('error', 'Informe a matéria e a data da votação.')
      return response.redirect().back()
    }

    const voting = await NominalVoting.create({
      title: String(data.title).slice(0, 500),
      description: data.description || null,
      plenarySessionId: data.plenary_session_id ? Number(data.plenary_session_id) : null,
      legislativeActivityId: data.legislative_activity_id
        ? Number(data.legislative_activity_id)
        : null,
      votingDate: data.voting_date,
      year: new Date(data.voting_date).getFullYear(),
      result: VALID_RESULTS.includes(data.result) ? data.result : 'aprovado',
      isUnanimous: data.is_unanimous === true || data.is_unanimous === 'true',
      isPublished: data.is_published === true || data.is_published === 'true',
      source: 'manual',
    })

    const councilors = await Councilor.query()
    await saveEntries(voting, entries, councilors)

    session.flash('success', 'Votação cadastrada com sucesso!')
    return response.redirect().toPath('/painel/votacoes')
  }

  async edit({ params, inertia }: HttpContext) {
    const voting = await NominalVoting.query()
      .where('id', params.id)
      .preload('entries')
      .firstOrFail()

    return inertia.render('admin/votacoes/form', {
      voting: {
        id: voting.id,
        title: voting.title,
        description: voting.description,
        plenary_session_id: voting.plenarySessionId,
        legislative_activity_id: voting.legislativeActivityId,
        voting_date: toDateString(voting.votingDate),
        result: voting.result,
        is_unanimous: voting.isUnanimous,
        is_published: voting.isPublished,
        source: voting.source,
        entries: voting.entries.map((e) => ({
          councilor_id: e.councilorId,
          councilor_name: e.councilorName,
          party: e.party,
          vote: e.vote,
        })),
      },
      ...(await this.formData()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const voting = await NominalVoting.findOrFail(params.id)
    const data = request.only([
      'title',
      'description',
      'plenary_session_id',
      'legislative_activity_id',
      'voting_date',
      'result',
      'is_unanimous',
      'is_published',
    ])
    const entries = request.input('entries', [])

    voting.merge({
      title: String(data.title).slice(0, 500),
      description: data.description || null,
      plenarySessionId: data.plenary_session_id ? Number(data.plenary_session_id) : null,
      legislativeActivityId: data.legislative_activity_id
        ? Number(data.legislative_activity_id)
        : null,
      votingDate: data.voting_date,
      year: new Date(data.voting_date).getFullYear(),
      result: VALID_RESULTS.includes(data.result) ? data.result : 'aprovado',
      isUnanimous: data.is_unanimous === true || data.is_unanimous === 'true',
      isPublished: data.is_published === true || data.is_published === 'true',
    })
    await voting.save()

    const councilors = await Councilor.query()
    await saveEntries(voting, entries, councilors)

    session.flash('success', 'Votação atualizada com sucesso!')
    return response.redirect().toPath('/painel/votacoes')
  }

  async destroy({ params, response, session }: HttpContext) {
    const voting = await NominalVoting.findOrFail(params.id)
    await voting.delete()
    session.flash('success', 'Votação excluída com sucesso!')
    return response.redirect().toPath('/painel/votacoes')
  }

  // ===== Importação a partir da ata (IA) =====

  async importPage({ inertia }: HttpContext) {
    const sessions = await PlenarySession.query()
      .where('status', 'realizada')
      .where((q) => q.whereNotNull('minutes').orWhereNotNull('file_url'))
      .orderBy('session_date', 'desc')
      .limit(200)

    const imported = await NominalVoting.query()
      .where('source', 'ata_ia')
      .whereNotNull('plenary_session_id')
      .distinct('plenary_session_id')

    const importedIds = new Set(imported.map((v) => v.plenarySessionId))

    return inertia.render('admin/votacoes/importar', {
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.sessionDate,
        has_minutes: Boolean(s.minutes),
        has_file: Boolean(s.fileUrl),
        already_imported: importedIds.has(s.id),
      })),
      councilors: (await Councilor.query().where('is_active', true).orderBy('display_order'))
        .map((c) => ({ id: c.id, name: c.parliamentaryName || c.name, party: c.party })),
    })
  }

  /** Roda a IA sobre a ata e devolve as votações encontradas para revisão (não salva). */
  async extract({ request, response }: HttpContext) {
    const sessionId = request.input('session_id')
    const plenarySession = await PlenarySession.find(sessionId)
    if (!plenarySession) {
      return response.badRequest({ error: 'Sessão não encontrada.' })
    }

    const councilors = await Councilor.query().where('is_active', true).orderBy('display_order')
    const names = councilors.map((c) => c.parliamentaryName || c.name)

    try {
      const extractor = new VoteExtractorService()
      const votings = await extractor.extractFromSession(plenarySession, names)

      // Pré-casa os nomes da IA com o cadastro para o formulário de revisão
      const enriched = votings.map((v) => ({
        ...v,
        votos: v.votos.map((voto) => {
          const matched = matchCouncilor(voto.vereador, councilors)
          return {
            ...voto,
            councilor_id: matched?.id ?? null,
            councilor_name: matched ? matched.parliamentaryName || matched.name : voto.vereador,
            party: matched?.party ?? null,
          }
        }),
      }))

      return response.json({
        session: { id: plenarySession.id, title: plenarySession.title, date: plenarySession.sessionDate },
        votings: enriched,
      })
    } catch (error: any) {
      return response.badRequest({ error: error.message || 'Falha ao extrair votações da ata.' })
    }
  }

  /** Salva em lote as votações revisadas na importação. */
  async storeBatch({ request, response, session }: HttpContext) {
    const sessionId = request.input('session_id')
    const votings = request.input('votings', [])
    const plenarySession = await PlenarySession.find(sessionId)

    if (!plenarySession || !Array.isArray(votings) || votings.length === 0) {
      session.flash('error', 'Nenhuma votação para salvar.')
      return response.redirect().back()
    }

    const councilors = await Councilor.query()
    const votingDate = toDateString(plenarySession.sessionDate)
    let saved = 0

    for (const v of votings) {
      if (!v?.title) continue
      const voting = await NominalVoting.create({
        title: String(v.title).slice(0, 500),
        description: v.description || null,
        plenarySessionId: plenarySession.id,
        votingDate,
        year: new Date(votingDate).getFullYear(),
        result: VALID_RESULTS.includes(v.result) ? v.result : 'aprovado',
        isUnanimous: Boolean(v.is_unanimous),
        isPublished: Boolean(v.is_published),
        source: 'ata_ia',
      })
      await saveEntries(voting, v.entries ?? [], councilors)
      saved++
    }

    session.flash('success', `${saved} votação(ões) importada(s) da ata com sucesso!`)
    return response.redirect().toPath('/painel/votacoes')
  }
}
