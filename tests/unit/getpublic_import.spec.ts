import { test } from '@japa/runner'
import {
  extractGetPublicContractFields,
  routeGetPublicMateria,
} from '#helpers/getpublic_import'

test.group('GetPublic import helper', () => {
  test('nao envia edicao diaria do diario para alimentacao local', ({ assert }) => {
    const route = routeGetPublicMateria({
      codigo: '00356',
      titulo: 'Diário Oficial - Edição 00356',
      tipo: 'Diário Oficial',
      tipoSlug: 'diario',
      urlMateria: 'https://getpublic.inf.br/system/visualizar-materia?materia=00356',
    })

    assert.deepEqual(route, { target: 'skip', reason: 'diario' })
  })

  test('roteia extrato de contrato para contratos', ({ assert }) => {
    const route = routeGetPublicMateria({
      codigo: '20260601090000',
      titulo: 'EXTRATO DE CONTRATO Nº 012/2026',
      tipo: 'EXTRATO DE CONTRATO',
      tipoSlug: 'extrato_de_contrato',
      tipoGrupo: 'Diário Oficial',
      numero: '012/2026',
      urlMateria: 'https://getpublic.inf.br/system/visualizar-materia?materia=20260601090000',
      urlDocumento: 'https://getpublic.inf.br/uploads/CMSU/pdf/20260601090000/getpub-view.pdf',
    })

    assert.equal(route.target, 'contract')
    if (route.target === 'contract') {
      assert.equal(route.kind, 'contract')
      assert.include(route.fileUrl, 'getpub-view.pdf')
    }
  })

  test('extrai fiscal e gestor de portaria quando ha vinculo com contrato', ({ assert }) => {
    const fields = extractGetPublicContractFields({
      codigo: '20260602090000',
      titulo: 'PORTARIA Nº 012/2026',
      tipo: 'PORTARIA',
      tipoSlug: 'portaria',
      numero: '012/2026',
      urlMateria: 'https://getpublic.inf.br/system/visualizar-materia?materia=20260602090000',
      texto:
        'Contrato nº 00012/2026. Designar a servidora Maria da Silva, matrícula 123, para atuar como FISCAL DE CONTRATO. Designar o servidor João Souza, matrícula 456, para atuar como GESTOR DE CONTRATO.',
    })

    assert.equal(fields.number, '00012/2026')
    assert.equal(fields.fiscalName, 'Maria da Silva')
    assert.equal(fields.managerName, 'João Souza')
  })
})
