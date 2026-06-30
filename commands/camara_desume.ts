import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SiteSetting from '#models/site_setting'
import InformationRecord from '#models/information_record'
import { camara } from '#config/camara'

type SettingPayload = {
  key: string
  value: string
  group: string
  type?: 'text' | 'json' | 'image' | 'color' | 'boolean' | 'number'
  label?: string
}

type LoggerLike = Pick<BaseCommand['logger'], 'info' | 'success'>

const UF_SUBTITLE: Record<string, string> = {
  AC: 'Estado do Acre',
  AL: 'Estado de Alagoas',
  AP: 'Estado do Amapá',
  AM: 'Estado do Amazonas',
  BA: 'Estado da Bahia',
  CE: 'Estado do Ceará',
  DF: 'Distrito Federal',
  ES: 'Estado do Espírito Santo',
  GO: 'Estado de Goiás',
  MA: 'Estado do Maranhão',
  MT: 'Estado de Mato Grosso',
  MS: 'Estado de Mato Grosso do Sul',
  MG: 'Estado de Minas Gerais',
  PA: 'Estado do Pará',
  PB: 'Estado da Paraíba',
  PR: 'Estado do Paraná',
  PE: 'Estado de Pernambuco',
  PI: 'Estado do Piauí',
  RJ: 'Estado do Rio de Janeiro',
  RN: 'Estado do Rio Grande do Norte',
  RS: 'Estado do Rio Grande do Sul',
  RO: 'Estado de Rondônia',
  RR: 'Estado de Roraima',
  SC: 'Estado de Santa Catarina',
  SP: 'Estado de São Paulo',
  SE: 'Estado de Sergipe',
  TO: 'Estado do Tocantins',
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function isSumeTenant(): boolean {
  return normalize(camara.cidade) === 'sume'
}

async function upsertSetting(payload: SettingPayload): Promise<boolean> {
  const type = payload.type ?? 'text'
  const existing = await SiteSetting.findBy('key', payload.key)
  const changed =
    !existing ||
    existing.value !== payload.value ||
    existing.group !== payload.group ||
    existing.type !== type ||
    (payload.label !== undefined && existing.label !== payload.label)

  await SiteSetting.updateOrCreate(
    { key: payload.key },
    {
      key: payload.key,
      value: payload.value,
      group: payload.group,
      type,
      label: payload.label ?? existing?.label ?? null,
    }
  )

  return changed
}

function tenantSettings(): SettingPayload[] {
  const subtitle = UF_SUBTITLE[camara.uf.toUpperCase()] || `Estado - ${camara.uf}`
  const city = camara.cidade
  const name = camara.nome
  const email = camara.email

  const derived: SettingPayload[] = [
    {
      key: 'header_title',
      value: name.toUpperCase(),
      group: 'appearance',
      label: 'Título do Header',
    },
    {
      key: 'header_subtitle',
      value: subtitle,
      group: 'appearance',
      label: 'Subtítulo do Header',
    },
    {
      key: 'login_subtitle',
      value: name,
      group: 'appearance',
      label: 'Subtitulo da tela de login',
    },
    {
      key: 'homepage_hero_title',
      value: name,
      group: 'homepage_hero',
      label: 'Título do Hero',
    },
    {
      key: 'homepage_hero_subtitle',
      value: `Legislatura 2025-2028 | Transparência e compromisso com o povo de ${city}`,
      group: 'homepage_hero',
      label: 'Subtítulo do Hero',
    },
    {
      key: 'homepage_conheca_title',
      value: `Conheça ${city}`,
      group: 'homepage_conheca',
      label: 'Título Conheça a Cidade',
    },
    {
      key: 'homepage_seals_subtitle',
      value: `A ${name} é reconhecida por seu compromisso com a transparência e a boa gestão pública.`,
      group: 'homepage_seals',
      label: 'Subtítulo Selos',
    },
    {
      key: 'section_conheca_visible',
      value: 'false',
      group: 'homepage_sections',
      type: 'boolean',
      label: 'Mostrar Conheça a Cidade',
    },
    {
      key: 'sic_unit',
      value: `Serviço de Informação ao Cidadão (SIC) da ${name}`,
      group: 'esic',
      label: 'Unidade responsável pelo SIC',
    },
    {
      key: 'sic_monitoring_authority',
      value: `Presidência da ${name}`,
      group: 'esic',
      label: 'Autoridade de monitoramento',
    },
    { key: 'footer_email', value: email, group: 'footer', label: 'Email' },
    { key: 'esic_email', value: email, group: 'esic', label: 'Email E-SIC' },
    {
      key: 'homepage_esic_email',
      value: email,
      group: 'homepage_esic',
      label: 'Email E-SIC',
    },
  ]

  const cleared: SettingPayload[] = [
    { key: 'footer_address', group: 'footer', label: 'Endereço' },
    { key: 'footer_phone', group: 'footer', label: 'Telefone' },
    { key: 'social_facebook', group: 'social', label: 'Facebook' },
    { key: 'social_instagram', group: 'social', label: 'Instagram' },
    { key: 'social_youtube', group: 'social', label: 'YouTube' },
    { key: 'esic_phone', group: 'esic', label: 'Telefone E-SIC' },
    { key: 'homepage_esic_phone', group: 'homepage_esic', label: 'Telefone E-SIC' },
    { key: 'homepage_esic_address', group: 'homepage_esic', label: 'Endereço E-SIC' },
    { key: 'homepage_esic_hours', group: 'homepage_esic', label: 'Horário E-SIC' },
    { key: 'esic_new_url', group: 'esic', label: 'Link Nova Demanda' },
    { key: 'esic_consult_url', group: 'esic', label: 'Link Consultar' },
    { key: 'ouvidoria_url', group: 'general', label: 'Link Ouvidoria' },
  ].map((setting) => ({ ...setting, value: '' }))

  return [...derived, ...cleared]
}

function cartaServicosContent(): string {
  return `<h2>Carta de Serviços ao Usuário</h2>
<p>A Carta de Serviços reúne os principais canais de atendimento da ${camara.nome} e orienta o cidadão sobre como acessar informações, acompanhar atividades legislativas e solicitar serviços públicos.</p>

<h3>Serviço de Informação ao Cidadão (e-SIC)</h3>
<p>Canal para registrar pedidos de acesso à informação com base na Lei nº 12.527/2011. O cidadão pode abrir uma solicitação, acompanhar o protocolo e receber resposta dentro dos prazos legais.</p>
<ul>
  <li><strong>Como acessar:</strong> pelo menu E-SIC ou pela página de Acesso à Informação.</li>
  <li><strong>Prazo:</strong> até 20 dias, prorrogável por mais 10 dias mediante justificativa.</li>
  <li><strong>Custo:</strong> gratuito, salvo custos de reprodução física quando houver.</li>
</ul>

<h3>Ouvidoria</h3>
<p>Canal para manifestações, reclamações, sugestões, elogios e denúncias relacionadas aos serviços legislativos.</p>

<h3>Transparência pública</h3>
<p>O portal mantém publicações oficiais, dados abertos, atos legislativos, licitações, contratos, relatórios fiscais e demais informações exigidas pela legislação.</p>`
}

function containsSumeResidue(value: string | null | undefined): boolean {
  if (!value) return false
  return /camaradesume|câmara municipal de sumé|camara municipal de sume|sumé|sume/i.test(value)
}

async function sanitizeFaqResidues(): Promise<number> {
  const now = DateTime.now()
  const rows = await db
    .from('faq_items')
    .whereNull('deleted_at')
    .where((query) => {
      query
        .whereILike('question', '%camaradesume%')
        .orWhereILike('answer', '%camaradesume%')
        .orWhereILike('question', '%Câmara Municipal de Sumé%')
        .orWhereILike('answer', '%Câmara Municipal de Sumé%')
        .orWhereILike('question', '%Camara Municipal de Sume%')
        .orWhereILike('answer', '%Camara Municipal de Sume%')
        .orWhereILike('answer', '%Centro de Sumé%')
        .orWhereILike('answer', '%Centro de Sume%')
    })
    .update({
      is_active: false,
      deleted_at: now.toSQL(),
      updated_at: now.toSQL(),
    })

  return Number(rows)
}

async function sanitizeInformationRecords(): Promise<number> {
  const year = new Date().getFullYear()
  let changed = 0

  const carta = await InformationRecord.query()
    .where('category', 'carta-servicos')
    .where('title', 'Carta de Serviços ao Usuário')
    .where('year', year)
    .first()

  if (carta && containsSumeResidue(carta.content)) {
    carta.merge({
      content: cartaServicosContent(),
      fileUrl: null,
      isActive: true,
      deletedAt: null,
    })
    await carta.save()
    changed++
  } else if (!carta) {
    await InformationRecord.create({
      title: 'Carta de Serviços ao Usuário',
      category: 'carta-servicos',
      year,
      content: cartaServicosContent(),
      fileUrl: null,
      isActive: true,
      displayOrder: 0,
      openMode: 'nova_aba',
      hideChrome: true,
    })
    changed++
  }

  const now = DateTime.now().toSQL()
  const disabled = await db
    .from('information_records')
    .whereNull('deleted_at')
    .where((query) => {
      query
        .whereILike('file_url', '%camaradesume%')
        .orWhereILike('content', '%camaradesume%')
        .orWhereILike('content', '%Câmara Municipal de Sumé%')
        .orWhereILike('content', '%Camara Municipal de Sume%')
    })
    .whereNot('category', 'carta-servicos')
    .update({
      is_active: false,
      deleted_at: now,
      updated_at: now,
    })

  return changed + Number(disabled)
}

async function sanitizeDuodecimoResidues(): Promise<number> {
  const rows = await db
    .from('duodecimos')
    .where((query) => {
      query
        .whereILike('notes', '%SUME%')
        .orWhereILike('notes', '%Sumé%')
        .orWhereILike('notes', '%Sume%')
    })
    .update({
      notes: null,
      updated_at: DateTime.now().toSQL(),
    })

  return Number(rows)
}

export async function runCamaraDesume(logger?: LoggerLike): Promise<number> {
  if (isSumeTenant()) {
    logger?.info('camara:desume ignorado: tenant Sumé usa os defaults originais.')
    return 0
  }

  let changed = 0
  for (const setting of tenantSettings()) {
    if (await upsertSetting(setting)) changed++
  }
  const faqChanged = await sanitizeFaqResidues()
  const infoChanged = await sanitizeInformationRecords()
  const duodecimosChanged = await sanitizeDuodecimoResidues()
  changed += faqChanged + infoChanged + duodecimosChanged

  SiteSetting.clearCache()
  logger?.success(
    `camara:desume ajustou ${changed} item(ns) para "${camara.nome}" ` +
      `(settings/conteúdo: FAQ ${faqChanged}, PNTP ${infoChanged}, duodécimos ${duodecimosChanged}).`
  )
  return changed
}

export default class CamaraDesume extends BaseCommand {
  static commandName = 'camara:desume'
  static description =
    'Remove defaults de Sumé de site_settings em câmaras novas, derivando identidade de config/camara'
  static options: CommandOptions = { startApp: true }

  async run() {
    await runCamaraDesume(this.logger)
  }
}
