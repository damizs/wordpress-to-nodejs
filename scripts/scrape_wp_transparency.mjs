/**
 * Extrai URLs dos links da transparência do site WordPress ao vivo.
 * Uso: node scripts/scrape_wp_transparency.mjs
 */
import fs from 'node:fs'

const res = await fetch('https://camaradesume.pb.gov.br/transparencia', {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CamaraSumeBootstrap/1.0)' },
})
const html = await res.text()

const urls = [...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((m) => m[0])
const unique = [...new Set(urls)].filter(
  (u) =>
    !u.includes('wp-content') &&
    !u.includes('google') &&
    !u.includes('gstatic') &&
    !u.includes('facebook') &&
    !u.includes('elementor')
)

console.log('Unique external-ish URLs:', unique.length)
unique.slice(0, 40).forEach((u) => console.log(u))

// Elementor popup / portal plugin patterns
const iframeSrc = [...html.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1])
const interesting = iframeSrc.filter(
  (s) =>
    s.startsWith('http') &&
    (s.includes('transparencia') || s.includes('esic') || s.includes('atendimento') || s.includes('sume'))
)
console.log('\nIframe/src interesting:', interesting)

fs.writeFileSync(
  'database/wp_transparency_scrape.txt',
  unique.join('\n'),
  'utf8'
)
