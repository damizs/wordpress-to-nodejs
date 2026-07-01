import { BaseSchema } from '@adonisjs/lucid/schema'
import { camara } from '#config/camara'

const YEAR = 2026
const MONTHLY_AMOUNT = 317336.01
const NOTE = 'Dados extraidos do documento DUODECIMO - 2026 SUME.docx.'

const rows = [
  { month: 1, repasseDate: '2026-01-13', recebido: MONTHLY_AMOUNT },
  { month: 2, repasseDate: '2026-02-10', recebido: MONTHLY_AMOUNT },
  { month: 3, repasseDate: '2026-03-10', recebido: MONTHLY_AMOUNT },
  { month: 4, repasseDate: '2026-04-10', recebido: MONTHLY_AMOUNT },
  { month: 5, repasseDate: '2026-05-08', recebido: MONTHLY_AMOUNT },
  { month: 6, repasseDate: '2026-06-10', recebido: MONTHLY_AMOUNT },
  { month: 7, repasseDate: null, recebido: null },
  { month: 8, repasseDate: null, recebido: null },
  { month: 9, repasseDate: null, recebido: null },
  { month: 10, repasseDate: null, recebido: null },
  { month: 11, repasseDate: null, recebido: null },
  { month: 12, repasseDate: null, recebido: null },
]

function isSumeTenant(): boolean {
  return camara.cidade
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim() === 'sume'
}

/**
 * Alimenta o duodecimo de Sume 2026 a partir do documento oficial enviado.
 *
 * Meses futuros entram apenas com valor previsto. Caso alguem ja tenha lancado
 * recebimento/data desses meses manualmente, a migration preserva esses dados.
 */
export default class extends BaseSchema {
  async up() {
    if (!isSumeTenant()) return

    this.defer(async (db) => {
      const now = new Date()

      for (const row of rows) {
        const existing = await db
          .from('duodecimos')
          .where('year', YEAR)
          .where('month', row.month)
          .first()

        if (!existing) {
          await db.table('duodecimos').insert({
            year: YEAR,
            month: row.month,
            previsto: MONTHLY_AMOUNT,
            recebido: row.recebido,
            repasse_date: row.repasseDate,
            notes: NOTE,
            created_at: now,
            updated_at: now,
          })
          continue
        }

        const patch: Record<string, unknown> = {
          previsto: MONTHLY_AMOUNT,
          updated_at: now,
        }

        if (row.recebido !== null) {
          patch.recebido = row.recebido
          patch.repasse_date = row.repasseDate
          patch.notes = existing.notes || NOTE
        } else {
          patch.notes = existing.notes || NOTE
        }

        await db.from('duodecimos').where('id', existing.id).update(patch)
      }
    })
  }

  async down() {
    // Migration de dados: nao remove lancamentos para preservar edicoes manuais.
  }
}
