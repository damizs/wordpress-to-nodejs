import { test } from '@japa/runner'
import {
  mapVoteOption,
  parseNominalVotingXml,
  parsePropositionParts,
} from '#services/nominal_voting_xml_importer'

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<relatorio>
  <sessao>
    <nome>DECIMA PRIMEIRA SESSÃO ORDINÁRIA</nome>
    <data_sessao>2025-05-06</data_sessao>
  </sessao>
  <proposicoes>
    <proposicao>
      <nome>REQUERIMENTO Nº 13/2025</nome>
      <votacao>
        <placar tipo="Abstenção">1</placar>
        <placar tipo="Contra">1</placar>
        <placar tipo="A Favor">2</placar>
        <votos>
          <voto nome="Jane Isa" opcao="A Favor"/>
          <voto nome="Arymateia Silva" opcao="Contra"/>
          <voto nome="Dida Alves" opcao="Abstenção"/>
          <voto nome="Bruno Duarte" opcao="A Favor"/>
        </votos>
      </votacao>
    </proposicao>
    <proposicao>
      <nome>REQUERIMENTO Nº 13/2025</nome>
      <votacao>
        <placar tipo="Abstenção">1</placar>
        <placar tipo="Contra">1</placar>
        <placar tipo="A Favor">2</placar>
        <votos>
          <voto nome="Jane Isa" opcao="A Favor"/>
          <voto nome="Arymateia Silva" opcao="Contra"/>
          <voto nome="Dida Alves" opcao="Abstenção"/>
          <voto nome="Bruno Duarte" opcao="A Favor"/>
        </votos>
      </votacao>
    </proposicao>
  </proposicoes>
</relatorio>`

test.group('Nominal voting XML importer', () => {
  test('parses and deduplicates voting blocks from session XML', ({ assert }) => {
    const votings = parseNominalVotingXml(SAMPLE_XML)

    assert.lengthOf(votings, 1)
    assert.equal(votings[0].sessionName, 'DECIMA PRIMEIRA SESSÃO ORDINÁRIA')
    assert.equal(votings[0].date, '2025-05-06')
    assert.equal(votings[0].title, 'REQUERIMENTO Nº 13/2025')
    assert.equal(votings[0].favor, 2)
    assert.equal(votings[0].contra, 1)
    assert.equal(votings[0].abstencao, 1)
    assert.equal(votings[0].result, 'aprovado')
    assert.isFalse(votings[0].isUnanimous)
    assert.equal(votings[0].votingSystemId.startsWith('xml:'), true)
    assert.deepEqual(
      votings[0].votes.map((vote) => vote.vote),
      ['sim', 'nao', 'abstencao', 'sim']
    )
  })

  test('normalizes vote options and proposition references', ({ assert }) => {
    assert.equal(mapVoteOption('A Favor'), 'sim')
    assert.equal(mapVoteOption('Contra'), 'nao')
    assert.equal(mapVoteOption('Abstenção'), 'abstencao')
    assert.equal(mapVoteOption('Ausente'), 'ausente')

    assert.deepEqual(parsePropositionParts('REQUERIMENTO Nº 013/2025'), {
      type: 'Requerimentos',
      number: '13',
      year: 2025,
    })
  })
})
