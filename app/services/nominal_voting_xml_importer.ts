import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { DateTime } from 'luxon'
import Councilor from '#models/councilor'
import LegislativeActivity from '#models/legislative_activity'
import NominalVoting, { type VotingResult } from '#models/nominal_voting'
import NominalVotingEntry, { type VoteValue } from '#models/nominal_voting_entry'
import PlenarySession from '#models/plenary_session'

type LoggerLike = {
  info(message: string): void
  success?(message: string): void
  warning?(message: string): void
  error?(message: string): void
}

type ParsedVote = {
  name: string
  option: string
  vote: VoteValue
}

export type ParsedXmlVoting = {
  sessionName: string
  date: string
  title: string
  favor: number
  contra: number
  abstencao: number
  result: VotingResult
  isUnanimous: boolean
  votes: ParsedVote[]
  signature: string
  votingSystemId: string
}

type MatchedVote = ParsedVote & {
  councilorId: number | null
  party: string | null
}

type ImportOptions = {
  dryRun?: boolean
  logger?: LoggerLike
}

type ImportStats = {
  files: number
  parsed: number
  skipped: number
  created: number
  updated: number
  entries: number
  dryRun: boolean
  unmatchedVoters: string[]
  unmatchedActivities: string[]
}

type PropositionParts = {
  type: string
  number: string
  year: number
} | null

const VOTE_MAP: Record<string, VoteValue> = {
  'a favor': 'sim',
  favor: 'sim',
  favoravel: 'sim',
  favoravelmente: 'sim',
  sim: 'sim',
  contra: 'nao',
  nao: 'nao',
  'não': 'nao',
  abstencao: 'abstencao',
  'abstenção': 'abstencao',
  ausente: 'ausente',
  ausencia: 'ausente',
  'não votou': 'nao_votou',
  'nao votou': 'nao_votou',
}

const TYPE_MAP: Record<string, string> = {
  requerimento: 'Requerimentos',
  requeirmento: 'Requerimentos',
  requeriemnto: 'Requerimentos',
  indicacao: 'Indicações',
  'projeto de lei': 'Projeto de Lei',
  'projeto de resolucao': 'Projeto de Resolução',
  'projeto de decreto legislativo': 'Projeto de Decreto Legislativo',
  veto: 'Vetos',
  portaria: 'Portarias',
}

const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

export function normalizeVotingText(value: string | null | undefined): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}/\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim()
}

function extractTag(body: string, tag: string): string | null {
  const match = body.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? decodeXml(match[1]) : null
}

function extractBlocks(body: string, tag: string): string[] {
  const blocks: string[] = []
  const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi')
  let match: RegExpExecArray | null
  while ((match = regex.exec(body)) !== null) {
    blocks.push(match[1])
  }
  return blocks
}

function extractAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const attrRegex = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  let match: RegExpExecArray | null
  while ((match = attrRegex.exec(raw)) !== null) {
    attrs[match[1]] = decodeXml(match[2] ?? match[3] ?? '')
  }
  return attrs
}

export function mapVoteOption(option: string): VoteValue {
  return VOTE_MAP[normalizeVotingText(option)] ?? 'nao_votou'
}

function parseInteger(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function getScoreboard(propositionBlock: string) {
  const scoreboard: Record<string, number> = {}
  const regex = /<placar\b([^>]*)>([\s\S]*?)<\/placar>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(propositionBlock)) !== null) {
    const attrs = extractAttributes(match[1])
    const key = normalizeVotingText(attrs.tipo ?? '')
    scoreboard[key] = parseInteger(decodeXml(match[2]))
  }
  return {
    favor: scoreboard['a favor'] ?? scoreboard.favor ?? 0,
    contra: scoreboard.contra ?? 0,
    abstencao: scoreboard.abstencao ?? 0,
  }
}

function parseVotes(propositionBlock: string): ParsedVote[] {
  const votes: ParsedVote[] = []
  const regex = /<voto\b([^>]*)\/?>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(propositionBlock)) !== null) {
    const attrs = extractAttributes(match[1])
    const name = String(attrs.nome ?? attrs.name ?? '').trim()
    if (!name) continue
    const option = String(attrs.opcao ?? attrs.opção ?? attrs.vote ?? '').trim()
    votes.push({ name, option, vote: mapVoteOption(option) })
  }
  return votes
}

function buildVotingSignature(date: string, title: string, votes: ParsedVote[]): string {
  const voteSignature = votes
    .map((vote) => `${normalizeVotingText(vote.name)}:${vote.vote}`)
    .sort()
    .join('|')
  return `${date}|${normalizeVotingText(title)}|${voteSignature}`
}

function buildVotingSystemId(signature: string): string {
  return `xml:${createHash('sha1').update(signature).digest('hex').slice(0, 32)}`
}

export function parseNominalVotingXml(xml: string): ParsedXmlVoting[] {
  const sessionBlock = extractTag(xml, 'sessao') ?? ''
  const sessionName = extractTag(sessionBlock, 'nome') ?? ''
  const date = (extractTag(sessionBlock, 'data_sessao') ?? '').substring(0, 10)
  const seen = new Set<string>()
  const votings: ParsedXmlVoting[] = []

  for (const propositionBlock of extractBlocks(xml, 'proposicao')) {
    if (!/<votacao\b/i.test(propositionBlock)) continue
    const title = extractTag(propositionBlock, 'nome') ?? ''
    const votes = parseVotes(propositionBlock)
    if (!title || !date || votes.length === 0) continue

    const scoreboard = getScoreboard(propositionBlock)
    const favor = scoreboard.favor || votes.filter((vote) => vote.vote === 'sim').length
    const contra = scoreboard.contra || votes.filter((vote) => vote.vote === 'nao').length
    const abstencao =
      scoreboard.abstencao || votes.filter((vote) => vote.vote === 'abstencao').length
    const result: VotingResult =
      favor > contra ? 'aprovado' : contra > favor ? 'rejeitado' : 'outro'
    const signature = buildVotingSignature(date, title, votes)

    if (seen.has(signature)) continue
    seen.add(signature)

    votings.push({
      sessionName,
      date,
      title,
      favor,
      contra,
      abstencao,
      result,
      isUnanimous: favor > 0 && contra === 0 && abstencao === 0,
      votes,
      signature,
      votingSystemId: buildVotingSystemId(signature),
    })
  }

  return votings
}

export function parsePropositionParts(title: string): PropositionParts {
  const normalized = normalizeVotingText(title).replace(
    /^(ordem do dia|materia em segunda discussao|materia em primeira discussao)\s*-\s*/,
    ''
  )
  const match = normalized.match(
    /(requerimento|requeirmento|requeriemnto|indicacao|projeto de lei|projeto de resolucao|projeto de decreto legislativo|veto|portaria)\D*?(\d{1,5})\s*\/\s*(\d{4})/
  )
  if (!match) return null
  const type = TYPE_MAP[match[1]]
  if (!type) return null
  return {
    type,
    number: String(Number.parseInt(match[2], 10)),
    year: Number.parseInt(match[3], 10),
  }
}

function normalizeActivityNumber(value: string): string {
  const match = String(value ?? '').match(/\d+/)
  return match ? String(Number.parseInt(match[0], 10)) : ''
}

function activityTypeStem(value: string): string {
  return normalizeVotingText(value)
    .replace(/\bde\b|\bda\b|\bdo\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/coes\b/g, 'c')
    .replace(/cao\b/g, 'c')
    .replace(/mentos\b/g, 'ment')
    .replace(/mento\b/g, 'ment')
    .replace(/s\b/g, '')
}

function activityTypeMatches(activityType: string, targetType: string): boolean {
  const activity = normalizeVotingText(activityType)
  const target = normalizeVotingText(targetType)
  if (activity === target || activity.includes(target) || target.includes(activity)) return true

  const activityStem = activityTypeStem(activity)
  const targetStem = activityTypeStem(target)
  return (
    activityStem.length >= 5 &&
    targetStem.length >= 5 &&
    (activityStem === targetStem ||
      activityStem.includes(targetStem) ||
      targetStem.includes(activityStem))
  )
}

function findActivity(
  voting: ParsedXmlVoting,
  activities: LegislativeActivity[]
): LegislativeActivity | null {
  const parts = parsePropositionParts(voting.title)
  if (!parts) return null

  const targetType = normalizeVotingText(parts.type)
  const targetNumber = normalizeActivityNumber(parts.number)

  return (
    activities.find((activity) => {
      if (Number(activity.year) !== parts.year) return false
      if (normalizeActivityNumber(activity.number) !== targetNumber) return false
      if (activityTypeMatches(activity.type, parts.type)) return true
      const title = normalizeVotingText(activity.title ?? activity.summary ?? '')
      return title.includes(targetNumber) && title.includes(targetType.split(' ')[0])
    }) ?? null
  )
}

function tokens(value: string): string[] {
  return normalizeVotingText(value)
    .split(' ')
    .filter((token) => token && !STOPWORDS.has(token))
}

function matchCouncilor(name: string, councilors: Councilor[]): Councilor | null {
  const target = normalizeVotingText(name)
  const targetTokens = new Set(tokens(name))
  let best: { councilor: Councilor; score: number } | null = null
  let tied = false

  for (const councilor of councilors) {
    const candidates = [
      councilor.parliamentaryName,
      councilor.name,
      councilor.fullName,
      councilor.slug,
    ].filter(Boolean) as string[]

    for (const candidate of candidates) {
      const normalized = normalizeVotingText(candidate)
      const candidateTokens = new Set(tokens(candidate))
      let score = 0
      if (normalized === target) score += 100
      if (normalized.includes(target) || target.includes(normalized)) score += 10
      for (const token of targetTokens) {
        if (candidateTokens.has(token)) score += 1
      }
      if (score > (best?.score ?? 0)) {
        best = { councilor, score }
        tied = false
      } else if (score > 0 && score === best?.score && best.councilor.id !== councilor.id) {
        tied = true
      }
    }
  }

  if (!best || tied) return null
  const minimum = Math.min(2, targetTokens.size || 1)
  return best.score >= minimum || best.score >= 10 ? best.councilor : null
}

function findSession(
  voting: ParsedXmlVoting,
  sessionsByDate: Map<string, PlenarySession[]>
): PlenarySession | null {
  const sessions = sessionsByDate.get(voting.date) ?? []
  if (sessions.length === 0) return null
  const sessionName = normalizeVotingText(voting.sessionName)
  return (
    sessions.find((session) => {
      const title = normalizeVotingText(session.title)
      return title === sessionName || title.includes(sessionName) || sessionName.includes(title)
    }) ?? sessions[0]
  )
}

function describeVoting(voting: ParsedXmlVoting): string {
  const session = voting.sessionName ? `${voting.sessionName} - ` : ''
  return `${session}${voting.favor} a favor, ${voting.contra} contra, ${voting.abstencao} abstencao`
}

async function listXmlFiles(dir: string): Promise<string[]> {
  const root = resolve(dir)
  const info = await stat(root)
  if (info.isFile()) return extname(root).toLowerCase() === '.xml' ? [root] : []

  const files: string[] = []
  const entries = await readdir(root, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listXmlFiles(fullPath)))
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.xml') {
      files.push(fullPath)
    }
  }
  return files.sort()
}

async function parseXmlDirectory(dir: string): Promise<{ files: string[]; votings: ParsedXmlVoting[] }> {
  const files = await listXmlFiles(dir)
  const votings: ParsedXmlVoting[] = []

  for (const file of files) {
    const xml = await readFile(file, 'utf8')
    votings.push(...parseNominalVotingXml(xml))
  }

  return { files, votings }
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

export async function importNominalVotingsFromXml(
  dir: string,
  options: ImportOptions = {}
): Promise<ImportStats> {
  const dryRun = Boolean(options.dryRun)
  const { files, votings } = await parseXmlDirectory(dir)
  const logger = options.logger

  const stats: ImportStats = {
    files: files.length,
    parsed: votings.length,
    skipped: 0,
    created: 0,
    updated: 0,
    entries: 0,
    dryRun,
    unmatchedVoters: [],
    unmatchedActivities: [],
  }

  if (votings.length === 0) return stats

  const [councilors, sessions, activities] = await Promise.all([
    Councilor.query().orderBy('is_active', 'desc').orderBy('display_order', 'asc'),
    PlenarySession.query().whereNull('deleted_at').orderBy('session_date', 'desc'),
    LegislativeActivity.query().whereNull('deleted_at').orderBy('year', 'desc'),
  ])

  const sessionsByDate = new Map<string, PlenarySession[]>()
  for (const session of sessions) {
    const current = sessionsByDate.get(session.sessionDate) ?? []
    current.push(session)
    sessionsByDate.set(session.sessionDate, current)
  }

  const unmatchedVoters = new Set<string>()
  const unmatchedActivities = new Set<string>()

  for (const voting of votings) {
    const session = findSession(voting, sessionsByDate)
    const activity = findActivity(voting, activities)
    if (!activity && parsePropositionParts(voting.title)) unmatchedActivities.add(voting.title)

    const matchedVotes: MatchedVote[] = voting.votes.map((vote) => {
      const councilor = matchCouncilor(vote.name, councilors)
      if (!councilor) unmatchedVoters.add(vote.name)
      return {
        ...vote,
        councilorId: councilor?.id ?? null,
        party: councilor?.party ?? null,
      }
    })

    if (dryRun) {
      stats.entries += matchedVotes.length
      continue
    }

    const existing = await NominalVoting.query()
      .where('source', 'api')
      .where('voting_system_id', voting.votingSystemId)
      .first()

    const payload = {
      title: voting.title.slice(0, 500),
      description: describeVoting(voting),
      plenarySessionId: session?.id ?? null,
      legislativeActivityId: activity?.id ?? null,
      votingDate: voting.date,
      year: Number(voting.date.substring(0, 4)),
      result: voting.result,
      isUnanimous: voting.isUnanimous,
      isPublished: true,
      source: 'api' as const,
      votingSystemId: voting.votingSystemId,
      votingSystemUrl: null,
      syncedAt: DateTime.now(),
    }

    const record = existing ?? (await NominalVoting.create(payload))
    if (existing) {
      existing.merge(payload)
      await existing.save()
      stats.updated += 1
    } else {
      stats.created += 1
    }

    await NominalVotingEntry.query().where('nominal_voting_id', record.id).delete()
    const entries = matchedVotes.map((vote) => ({
      nominalVotingId: record.id,
      councilorId: vote.councilorId,
      councilorName: vote.name.slice(0, 255),
      party: vote.party?.slice(0, 50) ?? null,
      vote: vote.vote,
    }))
    if (entries.length > 0) {
      await NominalVotingEntry.createMany(entries)
      stats.entries += entries.length
    }
  }

  stats.unmatchedVoters = uniqueStrings(Array.from(unmatchedVoters))
  stats.unmatchedActivities = uniqueStrings(Array.from(unmatchedActivities))

  logger?.info(
    `Votacoes XML: ${stats.files} arquivo(s), ${stats.parsed} votacao(oes), ${stats.entries} voto(s).`
  )
  if (stats.unmatchedVoters.length > 0) {
    logger?.warning?.(`${stats.unmatchedVoters.length} votante(s) sem vereador correspondente.`)
  }
  if (stats.unmatchedActivities.length > 0) {
    logger?.warning?.(`${stats.unmatchedActivities.length} proposicao(oes) sem materia correspondente.`)
  }

  return stats
}
