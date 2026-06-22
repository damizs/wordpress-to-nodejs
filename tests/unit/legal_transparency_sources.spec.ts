import { test } from '@japa/runner'
import { readFileSync } from 'node:fs'
import app from '@adonisjs/core/services/app'

function bootstrapLinks() {
  const json = readFileSync(app.makePath('database/transparency_bootstrap.json'), 'utf8')
  return JSON.parse(json).links as Array<{ slug: string; title: string; url: string; open_mode?: string }>
}

function findLink(slug: string) {
  return bootstrapLinks().find((link) => link.slug === slug)
}

test.group('Legal transparency sources', () => {
  test('keeps external e-SIC and Ouvidoria references configured', ({ assert }) => {
    assert.include(findLink('e-sic')?.url, 'doc3.inf.br')
    assert.include(findLink('ouvidoria-externa')?.url, 'atendimento.camaradesume.pb.gov.br')
  })

  test('keeps payroll and remuneration transparency links available', ({ assert }) => {
    assert.include(findLink('folha-de-pagamento-anos-2014-ate-2026')?.url, 'transparencia.elmartecnologia.com.br')
    assert.include(
      findLink('regulamentacao-do-padrao-remuneratorio-servidores')?.url,
      'portaldatransparencia.publicsoft.com.br'
    )
    assert.include(
      findLink('tabela-do-padrao-remuneratorio-vereadores-e-servidores')?.url,
      'portaldatransparencia.publicsoft.com.br'
    )
  })

  test('keeps daily allowance pages as internal access-to-information entries', ({ assert }) => {
    assert.equal(findLink('regulamentacao-das-diarias')?.url, '/diarias')
    assert.equal(findLink('tabela-das-diarias')?.url, '/diarias')
  })

  test('keeps PublicSoft links opening in modal when configured', ({ assert }) => {
    const despesas = findLink('despesas-2023-2024-2025-2026')

    assert.include(despesas?.url, 'portaldatransparencia.publicsoft.com.br')
    assert.equal(despesas?.open_mode, 'modal')
  })
})
