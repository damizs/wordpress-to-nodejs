import { test } from '@japa/runner'
import { routeMateria } from '#helpers/materia_router'

test.group('Materia router', () => {
  test('roteia contrato com tipo generico para licitacoes/contratacoes', ({ assert }) => {
    const result = routeMateria({
      tipo: 'Outros Atos Administrativos',
      titulo: 'EXTRATO DE CONTRATO 001/2026',
      codigo: '20260101010101',
      conteudo: 'https://getpublic.inf.br/system/visualizar-materia?materia=20260101010101',
    })

    assert.equal(result.target, 'licitacao')
  })

  test('mantem ata administrativa fora de licitacoes quando nao tem vocabulario de contratacao', ({
    assert,
  }) => {
    const result = routeMateria({
      tipo: 'Ata',
      titulo: 'Ata de reuniao da mesa diretora',
      conteudo: null,
    })

    assert.equal(result.target, 'publicacao')
  })
})
