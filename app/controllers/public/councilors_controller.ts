import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Councilor from '#models/councilor'
import Legislature from '#models/legislature'
import CouncilorPosition from '#models/councilor_position'
import CommitteeMember from '#models/committee_member'
import LegislativeActivity from '#models/legislative_activity'
import SiteSetting from '#models/site_setting'

export default class CouncilorsController {
  async index({ inertia }: HttpContext) {
    const currentLegislature = await Legislature.query().where('is_current', true).first()
    const councilors = await Councilor.query()
      .select(
        'id',
        'name',
        'parliamentary_name',
        'slug',
        'party',
        'photo_url',
        'role',
        'email',
        'phone',
        'is_active',
        'legislature_id',
        'display_order'
      )
      .where('is_active', true)
      .if(currentLegislature, (q) => q.where('legislature_id', currentLegislature!.id))
      .orderBy('display_order', 'asc')

    // Load positions for mesa diretora
    const councilorIds = councilors.map((c) => c.id)
    const positions = councilorIds.length
      ? await CouncilorPosition.query().whereIn('councilor_id', councilorIds).preload('biennium')
      : []

    const siteSettings = await SiteSetting.allAsObject()
    const yearOf = (value: unknown) => {
      if (value instanceof Date) return value.getFullYear()
      const raw = String(value ?? '')
      const match = raw.match(/\d{4}/)
      return match ? Number(match[0]) : ''
    }

    return inertia.render('public/councilors/index', {
      vereadores: councilors.map((c) => ({
        id: c.id,
        name: c.parliamentaryName || c.name,
        slug: c.slug,
        party: c.party,
        photo: c.photoUrl,
        role: positions.find((p) => p.councilorId === c.id)?.position || c.role || null,
        email: c.email,
        phone: c.phone,
      })),
      legislature: currentLegislature
        ? {
            name: currentLegislature.name,
            year_start: yearOf(currentLegislature.startDate),
            year_end: yearOf(currentLegislature.endDate),
          }
        : null,
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const councilor = await Councilor.query()
      .where('slug', params.slug)
      .preload('legislature')
      .first()
    if (!councilor) return response.redirect().status(301).toPath('/vereadores')

    const [positions, committeeMemberships, activities, totalGeral] = await Promise.all([
      CouncilorPosition.query().where('councilor_id', councilor.id).preload('biennium'),
      CommitteeMember.query()
        .where('councilor_id', councilor.id)
        .preload('committee', (q) => q.preload('legislature')),
      // Matérias do vereador: vínculo direto (pivot) OU autor por nome (dados legados do WP)
      LegislativeActivity.query()
        .where('is_active', true)
        .whereNull('deleted_at')
        .where((q) => {
          q.whereHas('authors', (sub) => sub.where('councilors.id', councilor.id))
          q.orWhere((sub) => {
            sub.whereILike('author', `%${councilor.name}%`)
            if (councilor.parliamentaryName) {
              sub.orWhereILike('author', `%${councilor.parliamentaryName}%`)
            }
          })
        })
        .orderBy('year', 'desc')
        .orderBy('created_at', 'desc'),
      LegislativeActivity.query().where('is_active', true).whereNull('deleted_at').count('* as total'),
    ])

    const totalMateriasPortal = Number(totalGeral[0]?.$extras.total ?? 0)

    // Datas: session_date pode vir como Date ou string ISO
    const activityDate = (a: LegislativeActivity): DateTime | null => {
      const raw = a.sessionDate as unknown
      if (raw) {
        const dt = raw instanceof Date ? DateTime.fromJSDate(raw) : DateTime.fromISO(String(raw))
        if (dt.isValid) return dt
      }
      return a.createdAt ?? null
    }

    // Estatísticas
    const currentYear = DateTime.now().year
    const yearOf = (value: unknown) => {
      if (value instanceof Date) return value.getFullYear()
      const match = String(value ?? '').match(/\d{4}/)
      return match ? Number(match[0]) : null
    }
    const legStart = yearOf(councilor.legislature?.startDate)
    const legEnd = yearOf(councilor.legislature?.endDate)

    const materiasExercicio = activities.filter(
      (a) => (a.year ?? activityDate(a)?.year) === currentYear
    ).length
    const materiasLegislatura =
      legStart && legEnd
        ? activities.filter((a) => {
            const y = a.year ?? activityDate(a)?.year
            return y !== null && y !== undefined && y >= legStart && y <= legEnd
          }).length
        : activities.length

    // Distribuição por tipo (gráficos)
    const byTypeMap = new Map<string, number>()
    for (const a of activities) {
      const key = a.type || 'Outros'
      byTypeMap.set(key, (byTypeMap.get(key) ?? 0) + 1)
    }
    const byType = [...byTypeMap.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((x, y) => y.count - x.count)

    // Série completa (leve) para o gráfico interativo por situação/ano no frontend.
    const timeline = activities.map((a) => ({
      year: a.year ?? activityDate(a)?.year ?? null,
      status: a.status || 'Em tramitação',
      type: a.type || 'Outros',
    }))

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/councilors/show', {
      vereador: {
        id: councilor.id,
        name: councilor.parliamentaryName || councilor.name,
        fullName: councilor.fullName || councilor.name,
        slug: councilor.slug,
        party: councilor.party,
        gender: councilor.gender,
        maritalStatus: councilor.maritalStatus,
        educationLevel: councilor.educationLevel,
        photo: councilor.photoUrl,
        role: positions.find((p) => p.biennium?.isCurrent)?.position || councilor.role || null,
        email: councilor.email,
        phone: councilor.phone,
        bio: councilor.bio || null,
        history: councilor.history || null,
        // Mantém compat: abas usam `biography`
        biography: councilor.bio || councilor.history || null,
        isActive: councilor.isActive,
        legislature: councilor.legislature
          ? {
              name: councilor.legislature.name,
              number: councilor.legislature.number,
              period:
                legStart && legEnd
                  ? `${legStart}/${legEnd}`
                  : councilor.legislature.startDate && councilor.legislature.endDate
                    ? `${String(councilor.legislature.startDate).substring(0, 4)}/${String(
                        councilor.legislature.endDate
                      ).substring(0, 4)}`
                    : null,
            }
          : null,
      },
      activities: activities.slice(0, 10).map((a) => {
        const d = activityDate(a)
        return {
          id: a.id,
          slug: a.slug,
          title: a.title || `${a.type} nº ${a.number}/${a.year}`,
          summary: a.summary,
          date: d ? d.toFormat('dd/MM/yyyy') : null,
          type: a.type,
          status: a.status,
          fileUrl: a.fileUrl,
        }
      }),
      stats: {
        totalMaterias: activities.length,
        totalMateriasPortal,
        materiasExercicio,
        materiasLegislatura,
        exercicioAtual: currentYear,
        legislatura: legStart && legEnd ? `${legStart}/${legEnd}` : null,
        byType,
      },
      timeline,
      mandatos: positions.map((p) => ({
        id: p.id,
        position: p.position,
        biennium: p.biennium
          ? { name: p.biennium.name ?? null, isCurrent: p.biennium.isCurrent ?? false }
          : null,
      })),
      comissoes: committeeMemberships.map((m) => ({
        id: m.id,
        role: m.role,
        committee: m.committee
          ? {
              name: m.committee.name,
              slug: m.committee.slug,
              type: m.committee.type,
              isActive: m.committee.isActive,
              legislature: m.committee.legislature?.name ?? null,
            }
          : null,
      })),
      siteSettings,
    })
  }
}
