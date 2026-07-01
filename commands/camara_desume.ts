import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SiteSetting from '#models/site_setting'
import InformationRecord from '#models/information_record'
import InstitutionalContent from '#models/institutional_content'
import Page from '#models/page'
import { camara } from '#config/camara'
import { buildInstitutionalEntries } from '#helpers/institutional_defaults'
import { sanitizeRichHtml, sanitizePlainText } from '#helpers/sanitize_html'

type SettingPayload = {
  key: string
  value: string
  group: string
  type?: 'text' | 'json' | 'image' | 'color' | 'boolean' | 'number'
  label?: string
}

type LoggerLike = Pick<BaseCommand['logger'], 'info' | 'success'>

type CityProfile = {
  region?: string
  area?: string
  population?: string
  founded?: string
  images?: string[]
}

const CITY_PROFILES: Record<string, CityProfile> = {
  assuncao: {
    population: '4.152 habitantes (IBGE, Censo 2022)',
    area: '126,4 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/04/instagram-69d3bec7610ce-1775484615.jpg'],
  },
  cabaceiras: {
    population: '5.335 habitantes (IBGE, Censo 2022)',
    area: '452,9 km² (IBGE)',
    images: [
      '/uploads/wp-migration/2025/09/Festa-Bode-Rei-Cabaceiras-@meudestinoelogoali-1024x576-1.jpg',
      '/uploads/wp-migration/2022/07/cabaceiras1-1.jpeg',
      '/uploads/wp-migration/2022/07/cabaceiras2.jpeg',
      '/uploads/wp-migration/2022/07/cabaceiras3.jpeg',
    ],
  },
  caraubas: {
    population: '3.944 habitantes (IBGE, Censo 2022)',
    area: '497,2 km² (IBGE)',
    images: ['/uploads/wp-migration/2025/02/caraubas.jpg'],
  },
  congo: {
    population: '4.933 habitantes (IBGE, Censo 2022)',
    area: '333,5 km² (IBGE)',
    images: ['/uploads/wp-migration/2025/09/Congo3.jpg', '/uploads/wp-migration/2025/02/congo.jpg'],
  },
  cuite: {
    population: '19.719 habitantes (IBGE, Censo 2022)',
    area: '741,8 km² (IBGE)',
    images: [
      '/uploads/wp-migration/2025/09/Mirante-de-Cuite-Registro-ART-Silvia-Guimaraes-.jpeg.webp',
    ],
  },
  'frei-martinho': {
    population: '2.846 habitantes (IBGE, Censo 2022)',
    area: '244,3 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/05/instagram-69fd0baa05141-1778191274.jpg'],
  },
  juazeirinho: {
    population: '17.007 habitantes (IBGE, Censo 2022)',
    area: '467,5 km² (IBGE)',
    images: [
      '/uploads/wp-migration/2025/09/igreja_matriz_de_sao_jose_-_cidade_de_juazeirinho_-_paraiba_-_brasil.jpg',
    ],
  },
  'junco-do-serido': {
    population: '6.793 habitantes (IBGE, Censo 2022)',
    area: '170,4 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/04/instagram-69d791ccc5624-1775735244.jpg'],
  },
  massaranduba: {
    population: '14.139 habitantes (IBGE, Censo 2022)',
    area: '206,0 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/03/instagram-69bdab886cefc-1774037896.jpg'],
  },
  'nova-floresta': {
    population: '9.724 habitantes (IBGE, Censo 2022)',
    area: '47,4 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/04/instagram-69e15e1443980-1776377364.jpg'],
  },
  parari: {
    population: '1.720 habitantes (IBGE, Censo 2022)',
    area: '128,5 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/04/673114784_17974202862032724_3443312247841478957_n.webp'],
  },
  salgadinho: {
    population: '3.355 habitantes (IBGE, Censo 2022)',
    area: '184,2 km² (IBGE)',
    images: ['/uploads/wp-migration/2025/02/Salgadinho-1.jpg'],
  },
  'santa-luzia': {
    population: '14.959 habitantes (IBGE, Censo 2022)',
    area: '455,7 km² (IBGE)',
    images: ['/uploads/wp-migration/2025/09/Santaluzia0510.jpg'],
  },
  'santo-andre': {
    population: '2.622 habitantes (IBGE, Censo 2022)',
    area: '225,2 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/06/santo-andre.jpg', '/uploads/wp-migration/2025/02/santoandre.jpeg'],
  },
  'sao-joao-do-cariri': {
    population: '4.226 habitantes (IBGE, Censo 2022)',
    area: '653,6 km² (IBGE)',
    images: ['/uploads/wp-migration/2025/09/Sao_Joao_do_Cariri.jpg'],
  },
  'serra-branca': {
    population: '13.614 habitantes (IBGE, Censo 2022)',
    area: '686,9 km² (IBGE)',
    images: ['/uploads/wp-migration/2026/03/instagram-69c6fe2f0edb4-1774648879.jpg'],
  },
  soledade: {
    population: '13.968 habitantes (IBGE, Censo 2022)',
    area: '560,0 km² (IBGE)',
    images: ['/uploads/wp-migration/2025/12/instagram-69447e0c60d97-1766096396.jpg'],
  },
  sume: {
    population: '17.166 habitantes (IBGE, Censo 2022)',
    area: '838,1 km² (IBGE)',
  },
  tenorio: {
    population: '2.966 habitantes (IBGE, Censo 2022)',
    area: '105,3 km² (IBGE)',
    founded: '29 de abril de 1994',
    images: ['/uploads/wp-migration/2025/09/cidade.jpg'],
  },
}

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

function slugKey(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  const cityProfile = CITY_PROFILES[slugKey(city)]

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
      key: 'homepage_conheca_subtitle',
      value: `Conheça um pouco mais sobre ${city} - ${camara.uf}: sua história, sua cultura e o que torna o município especial.`,
      group: 'homepage_conheca',
      label: 'Subtítulo Conheça',
    },
    {
      key: 'homepage_seals_subtitle',
      value: `A ${name} é reconhecida por seu compromisso com a transparência e a boa gestão pública.`,
      group: 'homepage_seals',
      label: 'Subtítulo Selos',
    },
    {
      key: 'section_conheca_visible',
      value: 'true',
      group: 'homepage_sections',
      type: 'boolean',
      label: 'Mostrar Conheça a Cidade',
    },
    ...(cityProfile?.region
      ? [{ key: 'city_region', value: cityProfile.region, group: 'appearance', label: 'Região da cidade' }]
      : []),
    ...(cityProfile?.area
      ? [{ key: 'city_area', value: cityProfile.area, group: 'appearance', label: 'Área territorial' }]
      : []),
    ...(cityProfile?.population
      ? [{ key: 'city_population', value: cityProfile.population, group: 'appearance', label: 'População' }]
      : []),
    ...(cityProfile?.founded
      ? [{ key: 'city_founded', value: cityProfile.founded, group: 'appearance', label: 'Emancipação' }]
      : []),
    ...(cityProfile?.images?.length
      ? [
          {
            key: 'city_images',
            value: JSON.stringify(cityProfile.images),
            group: 'appearance',
            type: 'json' as const,
            label: 'Fotos da Cidade (Carrossel)',
          },
        ]
      : []),
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
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return (
    /camaradesume/.test(normalized) ||
    /camara\s+(municipal\s+)?de\s+sume/.test(normalized) ||
    /municipio\s+de\s+sume/.test(normalized) ||
    /cidade\s+de\s+sume/.test(normalized) ||
    /sume\s*[-/]\s*pb/.test(normalized) ||
    /\bsumeense\b/.test(normalized) ||
    /\bsume\b/.test(normalized)
  )
}

function replaceSumeResidues(value: string | null | undefined): string {
  const text = String(value ?? '')
  const orgName = camara.nome
  const city = camara.cidade
  const cityUf = `${camara.cidade} - ${camara.uf}`
  const publicHost = camara.siteUrl || camara.baseUrl

  return text
    .replace(/A\s+Câmara\s+Municipal\s+de\s+Sumé/gi, `A ${orgName}`)
    .replace(/A\s+Camara\s+Municipal\s+de\s+Sume/gi, `A ${orgName}`)
    .replace(/A\s+Câmara\s+de\s+Sumé/gi, `A ${orgName}`)
    .replace(/A\s+Camara\s+de\s+Sume/gi, `A ${orgName}`)
    .replace(/Câmara\s+Municipal\s+de\s+Sumé/gi, orgName)
    .replace(/Camara\s+Municipal\s+de\s+Sume/gi, orgName)
    .replace(/Câmara\s+de\s+Sumé/gi, orgName)
    .replace(/Camara\s+de\s+Sume/gi, orgName)
    .replace(/Município\s+de\s+Sumé/gi, `Município de ${city}`)
    .replace(/Municipio\s+de\s+Sume/gi, `Município de ${city}`)
    .replace(/cidade\s+de\s+Sumé/gi, `cidade de ${city}`)
    .replace(/cidade\s+de\s+Sume/gi, `cidade de ${city}`)
    .replace(/Centro\s+de\s+Sumé/gi, `Centro de ${city}`)
    .replace(/Centro\s+de\s+Sume/gi, `Centro de ${city}`)
    .replace(/Sumé\s*-\s*PB/gi, cityUf)
    .replace(/Sume\s*-\s*PB/gi, cityUf)
    .replace(/camaradesume\.pb\.gov\.br/gi, publicHost.replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
    .replace(/camaradesume/gi, slugKey(camara.nome))
    .replace(/\bSumé\b/g, city)
    .replace(/\bSume\b/g, city)
}

function plainText(value: string | null | undefined): string {
  return sanitizePlainText(String(value ?? '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function pageRichContent(page: Page | null): string {
  if (!page) return ''
  const fromContent = page.content || ''
  if (plainText(fromContent).length >= 80) return sanitizeRichHtml(fromContent)
  const fromBlocks = Array.isArray(page.blocks)
    ? page.blocks
        .map((block) => {
          if ('text' in block && typeof block.text === 'string') return block.text
          if (block.type === 'accordion') {
            return block.items.map((item) => `<h3>${item.title}</h3>${item.body}`).join('\n')
          }
          return ''
        })
        .filter(Boolean)
        .join('\n')
    : ''
  return plainText(fromBlocks).length >= 80 ? sanitizeRichHtml(fromBlocks) : ''
}

async function findLegacyPage(slugs: string[]): Promise<Page | null> {
  return Page.query()
    .whereNull('deleted_at')
    .whereIn('slug', slugs)
    .orderBy('is_published', 'desc')
    .orderBy('updated_at', 'desc')
    .first()
}

function isDefaultInstitutionalContent(key: string, content: string, defaults = buildInstitutionalEntries()) {
  const defaultEntry = defaults.find((item) => item.key === key)
  if (!defaultEntry) return false
  return normalize(plainText(content)) === normalize(plainText(defaultEntry.content))
}

async function sanitizeFaqResidues(): Promise<number> {
  const now = DateTime.now().toSQL()
  const rows = await db
    .from('faq_items')
    .select('id', 'question', 'answer')
    .where('is_active', true)
    .whereNull('deleted_at')
    .where((query) => {
      query
        .whereILike('question', '%camaradesume%')
        .orWhereILike('answer', '%camaradesume%')
        .orWhereILike('question', '%Câmara de Sumé%')
        .orWhereILike('answer', '%Câmara de Sumé%')
        .orWhereILike('question', '%Camara de Sume%')
        .orWhereILike('answer', '%Camara de Sume%')
        .orWhereILike('question', '%Câmara Municipal de Sumé%')
        .orWhereILike('answer', '%Câmara Municipal de Sumé%')
        .orWhereILike('question', '%Camara Municipal de Sume%')
        .orWhereILike('answer', '%Camara Municipal de Sume%')
        .orWhereILike('question', '%Sumé%')
        .orWhereILike('answer', '%Sumé%')
        .orWhereILike('question', '%Sume%')
        .orWhereILike('answer', '%Sume%')
        .orWhereILike('answer', '%Centro de Sumé%')
        .orWhereILike('answer', '%Centro de Sume%')
    })

  let changed = 0
  for (const row of rows) {
    const question = replaceSumeResidues(row.question)
    const answer = replaceSumeResidues(row.answer)
    const payload = containsSumeResidue(`${question}\n${answer}`)
      ? {
          is_active: false,
          deleted_at: now,
          updated_at: now,
        }
      : {
          question,
          answer,
          updated_at: now,
        }

    await db.from('faq_items').where('id', row.id).update(payload)
    changed++
  }

  return changed
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
        .whereILike('notes', '%Câmara Municipal de Sumé%')
        .orWhereILike('notes', '%Camara Municipal de Sume%')
        .orWhereILike('notes', '%Município de Sumé%')
        .orWhereILike('notes', '%Municipio de Sume%')
        .orWhereILike('notes', '%Sumé - PB%')
        .orWhereILike('notes', '%Sume - PB%')
    })
    .update({
      notes: null,
      updated_at: DateTime.now().toSQL(),
    })

  return Number(rows)
}

async function promoteLegacyInstitutionalContent(): Promise<number> {
  let changed = 0
  const defaults = buildInstitutionalEntries()

  const candidates: Array<{
    slugs: string[]
    key: string
    title: string
  }> = [
    {
      slugs: ['legado-historia-da-camara', 'historia-da-camara', 'legado-historia', 'historia'],
      key: 'historia_intro',
      title: 'História da Câmara',
    },
    {
      slugs: ['legado-sobre', 'sobre', 'legado-a-camara', 'a-camara'],
      key: 'sobre_intro',
      title: 'O Poder Legislativo Municipal',
    },
  ]

  for (const candidate of candidates) {
    const page = await findLegacyPage(candidate.slugs)
    const content = pageRichContent(page)
    if (!content || containsSumeResidue(content)) continue

    const row = await InstitutionalContent.findBy('key', candidate.key)
    const shouldPromote =
      !row ||
      containsSumeResidue(row.title) ||
      containsSumeResidue(row.content) ||
      isDefaultInstitutionalContent(candidate.key, row.content, defaults)

    if (!shouldPromote) continue

    await InstitutionalContent.updateOrCreate(
      { key: candidate.key },
      {
        key: candidate.key,
        title: candidate.title,
        content,
      }
    )
    changed++
  }

  const privacyPage = await findLegacyPage([
    'legado-politica-de-privacidade',
    'politica-de-privacidade',
    'legado-politica-privacidade',
  ])
  const privacyContent = pageRichContent(privacyPage)
  if (privacyContent && !containsSumeResidue(privacyContent)) {
    if (
      await upsertSetting({
        key: 'privacy_policy_content',
        value: privacyContent,
        group: 'privacy',
        type: 'text',
        label: 'Conteúdo da Política de Privacidade',
      })
    ) {
      changed++
    }
  }

  return changed
}

async function sanitizePageResidues(): Promise<number> {
  const now = DateTime.now().toSQL()
  const rows = await db
    .from('pages')
    .whereNull('deleted_at')
    .where((query) => {
      query
        .whereILike('slug', '%camaradesume%')
        .orWhereILike('title', '%camaradesume%')
        .orWhereILike('content', '%camaradesume%')
        .orWhereILike('content', '%Câmara Municipal de Sumé%')
        .orWhereILike('content', '%Camara Municipal de Sume%')
        .orWhereILike('content', '%Município de Sumé%')
        .orWhereILike('content', '%Municipio de Sume%')
        .orWhereILike('content', '%Sumé - PB%')
        .orWhereILike('content', '%Sume - PB%')
        .orWhereILike('meta_description', '%Câmara Municipal de Sumé%')
        .orWhereILike('meta_description', '%Camara Municipal de Sume%')
        .orWhereILike('hero_subtitle', '%Câmara Municipal de Sumé%')
        .orWhereILike('hero_subtitle', '%Camara Municipal de Sume%')
    })
    .update({
      is_published: false,
      deleted_at: now,
      published_at: null,
      updated_at: now,
    })

  return Number(rows)
}

async function sanitizeInstitutionalContent(): Promise<number> {
  let changed = 0
  const defaults = buildInstitutionalEntries()

  for (const item of defaults) {
    const row = await InstitutionalContent.findBy('key', item.key)
    if (!row) {
      await InstitutionalContent.create({
        key: item.key,
        title: item.title,
        content: item.content,
      })
      changed++
      continue
    }

    if (containsSumeResidue(row.content) || containsSumeResidue(row.title)) {
      row.merge({
        title: item.title,
        content: item.content,
      })
      await row.save()
      changed++
    }
  }

  changed += await promoteLegacyInstitutionalContent()

  return changed
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
  const pagesChanged = await sanitizePageResidues()
  const institutionalChanged = await sanitizeInstitutionalContent()
  changed += faqChanged + infoChanged + duodecimosChanged + pagesChanged + institutionalChanged

  SiteSetting.clearCache()
  logger?.success(
    `camara:desume ajustou ${changed} item(ns) para "${camara.nome}" ` +
      `(settings/conteúdo: FAQ ${faqChanged}, PNTP ${infoChanged}, páginas ${pagesChanged}, institucional/LGPD ${institutionalChanged}, duodécimos ${duodecimosChanged}).`
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
