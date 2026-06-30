import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { readFileSync, existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import GlossaryTerm from '#models/glossary_term'
import { generateSlug } from '#helpers/slug'

interface RawTerm {
  term: string
  definition: string
  letter?: string | null
}

/** Normaliza a letra inicial de um verbete para A–Z (sem acento, maiúscula). */
function normalizeLetter(term: string, fallback?: string | null): string | null {
  const source = (term || '').trim() || (fallback || '').trim()
  if (!source) return null
  const c = source
    .charAt(0)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  return /[A-Z]/.test(c) ? c : (fallback || null)
}

/**
 * Seeder do Glossário legislativo.
 *
 * Idempotente e NÃO destrutivo:
 * - Lê os termos raspados do site antigo em `database/glossary_terms.json`.
 * - Faz upsert por `term`: cria o que estiver ausente, NUNCA sobrescreve
 *   definições/edições feitas no painel.
 * - Roda a cada boot (startup.sh → db:seed) sem efeitos colaterais.
 */
export default class extends BaseSeeder {
  async run() {
    // Tabela pode não existir ainda em ambientes desatualizados — sai em silêncio.
    const hasTable = await db.connection().schema.hasTable('glossary_terms')
    if (!hasTable) return

    const path = app.makePath('database', 'glossary_terms.json')
    if (!existsSync(path)) {
      console.log('Glossário: glossary_terms.json não encontrado — seed ignorado')
      return
    }

    let raw: RawTerm[]
    try {
      raw = JSON.parse(readFileSync(path, 'utf-8')) as RawTerm[]
    } catch (e) {
      console.log('Glossário: falha ao ler glossary_terms.json — seed ignorado')
      return
    }
    if (!Array.isArray(raw) || raw.length === 0) {
      console.log('Glossário: nenhum termo no JSON — seed ignorado')
      return
    }

    let created = 0
    let order = 0
    for (const item of raw) {
      const term = (item.term || '').trim()
      const definition = (item.definition || '').trim()
      if (!term || !definition) continue
      order += 1

      // Upsert por `term` (case preservado). firstOrCreate não toca em
      // registros já existentes — preserva edições manuais do painel.
      const existing = await GlossaryTerm.query().whereRaw('LOWER(term) = ?', [term.toLowerCase()]).first()
      if (existing) continue

      await GlossaryTerm.create({
        term,
        definition,
        letter: normalizeLetter(term, item.letter),
        slug: generateSlug(term) || null,
        displayOrder: order,
        isActive: true,
      })
      created += 1
    }

    console.log(`Glossário: ${created} termo(s) criado(s) (${raw.length} no arquivo)`)
  }
}
