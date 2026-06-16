/**
 * Extrai mapeamento título → URL dos cards de transparência do WP ao vivo.
 * Uso: node scripts/extract_wp_transparency_links.mjs
 */
import fs from 'node:fs'
import { decode } from 'html-entities'

const res = await fetch('https://camaradesume.pb.gov.br/transparencia', {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CamaraSumeBootstrap/1.0)' },
})
let html = await res.text()
html = decode(html)

/** Normaliza título para slug (igual ao wp_migrate slugify simplificado). */
function slugify(t) {
  return t
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const pairs = []

// Elementor / portal: href antes ou depois do título em blocos
const linkBlocks = [...html.matchAll(/href=["'](https?:\/\/[^"'#]+[^"']*)["'][^>]*>([\s\S]{0,200}?)<\//gi)]
for (const m of linkBlocks) {
  let url = m[1].replace(/&#038;/g, '&').replace(/&amp;/g, '&')
  const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (
    url.includes('portaldatransparencia') ||
    url.includes('elmartecnologia') ||
    url.includes('doc3.inf.br') ||
    url.includes('atendimento.camaradesume')
  ) {
    if (text.length > 3) pairs.push({ title: text, url })
  }
}

// data-link / onclick patterns
for (const m of html.matchAll(/data-(?:url|link|href)=["']([^"']+)["']/gi)) {
  const url = m[1].replace(/&#038;/g, '&')
  if (url.startsWith('http')) pairs.push({ title: null, url })
}

// Unique by url
const byUrl = new Map()
for (const p of pairs) {
  if (!byUrl.has(p.url)) byUrl.set(p.url, p)
}

const urls = [...byUrl.values()]
console.log('Extracted', urls.length, 'external transparency URLs')

// Load WP titles from migration_extra
const extra = JSON.parse(fs.readFileSync('database/migration_extra.json', 'utf8'))
const titles = extra.transparencia.map((t) => t.title).filter((t) => t !== 'Transparência')

// Manual high-value mappings (stable entry points)
const CORE = {
  'E-SIC': 'https://doc3.inf.br/cmsu2516300/esic',
  'Portal de Dados Abertos': '/dados-abertos',
  Licitações: '/licitacoes',
  Contratos: '/contratos',
  RGF: '/relatorios-fiscais',
  'Organograma Funcional': '/mesa-diretora',
  'Regulamentação - LAI': '/acesso-a-informacao/lai',
  'Regimento Interno': '/publicacoes-oficiais',
}

const PUBLICSOFT_BASE =
  'https://portaldatransparencia.publicsoft.com.br/sistemas/ContabilidadePublica/accessdirect.php?link=NbvH'

const mappings = []

for (const title of titles) {
  let url = CORE[title] || null
  let isExternal = false
  let openMode = 'new_tab'

  const tl = title.toLowerCase()
  if (!url) {
    if (tl.includes('e-sic') || tl === 'esic') {
      url = CORE['E-SIC']
      isExternal = true
    } else if (tl.includes('folha') || tl.includes('contra')) {
      url =
        'https://transparencia.elmartecnologia.com.br/Servidor/Login?Result=&RedirectTo=https://transparencia.elmartecnologia.com.br/Servidor/Index/ContraCheque&ctx=101212&e=101212&menu=off&footer=off'
      isExternal = true
      openMode = 'modal'
    } else if (tl.includes('quadro funcional') || tl.includes('servidor')) {
      url = `${PUBLICSOFT_BASE}#quadro-funcional`
      isExternal = true
    } else if (tl.includes('despesa') && tl.includes('empenho')) {
      url =
        'https://portaldatransparencia.publicsoft.com.br/sistemas/ContabilidadePublica/NbvH/despesas'
      isExternal = true
    } else if (tl.includes('despesa')) {
      url =
        'https://portaldatransparencia.publicsoft.com.br/sistemas/ContabilidadePublica/NbvH/despesas'
      isExternal = true
    } else if (tl.includes('receita') || tl.includes('duodécimo') || tl.includes('duodecimo')) {
      url = '/duodecimos'
      openMode = 'same_tab'
    } else if (tl.includes('diária') || tl.includes('diaria')) {
      if (tl.includes('tabela') || tl.includes('regulament')) {
        url = '/diarias'
        openMode = 'same_tab'
      } else {
        url =
          'https://portaldatransparencia.publicsoft.com.br/sistemas/ContabilidadePublica/NbvH/despesas-com-diarias'
        isExternal = true
      }
    } else if (tl.includes('rreo')) {
      url =
        'https://portaldatransparencia.publicsoft.com.br/sistemas/ContabilidadePublica/views/page.php?url=Demonstrativos/RREO'
      isExternal = true
    } else if (tl.includes('rgf')) {
      url = '/relatorios-fiscais'
      openMode = 'same_tab'
    } else if (tl.includes('licita') && !tl.includes('aviso')) {
      url = '/licitacoes'
      openMode = 'same_tab'
    } else if (tl.includes('contrato')) {
      url = '/contratos'
      openMode = 'same_tab'
    } else if (tl.includes('dados abertos')) {
      url = '/dados-abertos'
    } else if (tl.includes('organograma')) {
      url = '/mesa-diretora'
    } else if (tl.includes('lai') || tl.includes('regulamentação')) {
      url = '/acesso-a-informacao/lai'
    } else {
      // fallback: portal contábil genérico (melhor que link interno quebrado)
      url = PUBLICSOFT_BASE
      isExternal = true
    }
  } else {
    isExternal = url.startsWith('http')
  }

  if (url.startsWith('http')) isExternal = true

  mappings.push({
    title,
    slug: slugify(title),
    url,
    is_external: isExternal,
    open_mode: openMode,
  })
}

// Append standalone externals not in transparencia list
mappings.push(
  {
    title: 'Portal da Transparência (Contabilidade)',
    slug: 'portal-contabilidade-publicsoft',
    url: PUBLICSOFT_BASE,
    is_external: true,
    open_mode: 'new_tab',
    section: 'Despesas e Receitas',
  },
  {
    title: 'e-SIC — Pedido de Informação',
    slug: 'esic',
    url: 'https://doc3.inf.br/cmsu2516300/esic',
    is_external: true,
    open_mode: 'new_tab',
    section: 'Legislação e Normas',
  },
  {
    title: 'Ouvidoria',
    slug: 'ouvidoria-externa',
    url: 'https://atendimento.camaradesume.pb.gov.br/',
    is_external: true,
    open_mode: 'new_tab',
    section: 'Outros',
  }
)

const out = {
  generated_at: new Date().toISOString(),
  source: 'camaradesume.pb.gov.br/transparencia + migration_extra.json',
  links: mappings,
  atricon_externals: {
    esic_url: 'https://doc3.inf.br/cmsu2516300/esic',
    ouvidoria_url: 'https://atendimento.camaradesume.pb.gov.br/',
    portal_contabil: PUBLICSOFT_BASE,
    radar_atricon: 'https://radardatransparencia.atricon.org.br/',
  },
}

fs.writeFileSync('database/transparency_bootstrap.json', JSON.stringify(out, null, 2), 'utf8')
console.log('Wrote database/transparency_bootstrap.json with', mappings.length, 'links')
