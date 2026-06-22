import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import {
  evaluateModuleHealth,
  normalizePath,
  type ModuleProbe,
} from '#services/transparency_audit_service'

const probe: ModuleProbe = {
  key: 'atas',
  label: 'Atas',
  adminHref: '/painel/atas',
  table: 'atas',
  dateColumn: 'document_date',
  thresholdDays: 15,
}

test.group('Transparency audit service', () => {
  test('normalizes internal and external paths for matching', ({ assert }) => {
    assert.equal(normalizePath('/transparencia/despesas?x=1'), '/transparencia/despesas')
    assert.equal(
      normalizePath('https://portaldatransparencia.publicsoft.com.br/sistemas/ContabilidadePublica/NbvH/despesas'),
      '/sistemas/ContabilidadePublica/NbvH/despesas'
    )
    assert.isNull(normalizePath('javascript:alert(1)'))
  })

  test('marks empty internal modules as failures', ({ assert }) => {
    const result = evaluateModuleHealth(probe, { total: 0, latest: null, thresholdDays: 15 })

    assert.equal(result.health, 'falha')
  })

  test('marks fresh internal modules as ok', ({ assert }) => {
    const result = evaluateModuleHealth(probe, {
      total: 3,
      latest: DateTime.now().minus({ days: 2 }),
      thresholdDays: 15,
    })

    assert.equal(result.health, 'ok')
  })

  test('marks stale internal modules as partial', ({ assert }) => {
    const result = evaluateModuleHealth(probe, {
      total: 3,
      latest: DateTime.now().minus({ days: 45 }),
      thresholdDays: 15,
    })

    assert.equal(result.health, 'parcial')
  })
})
