# Especificação da API — VotaLegis → Portal da Câmara (Sessões, Matérias, Votação Nominal)

> **Para quem vai construir a API no VotaLegis.** Descreve, do ponto de vista do
> **consumidor** (Portal da Câmara de Sumé), os endpoints/campos que o VotaLegis precisa
> expor para o portal sincronizar **sessões, matérias e votação nominal** automaticamente,
> substituindo a importação frágil por HTML que existe hoje.
>
> Use como **prompt/brief** para implementar a API.

## 1. Contexto e objetivo

O VotaLegis é o sistema de votação da Câmara. O portal **já foi desenhado** para consumi-lo:
as tabelas `plenary_sessions`, `legislative_activities` e `nominal_votings` têm os campos
**`voting_system_id`** (o ID compartilhado), **`voting_system_url`** e **`synced_at`**, e
`legislative_activities` tem **`tramitation_steps`** (linha do tempo de tramitação).

**Objetivo:** `votalegis:sync` (agendado) popula sozinho a **votação nominal por matéria**,
a **tramitação** e os dados de **sessão**, casando tudo pelo `voting_system_id`. Habilita a
linha do tempo de tramitação e o gancho para transmissão ao vivo.

## 2. O ID compartilhado (crítico)

Cada **sessão**, **matéria** e **votação** do VotaLegis deve ter um **`id` estável e único**.
O portal grava esse `id` em `voting_system_id` e usa como chave de upsert. **Nunca mude o `id`
de um registro existente.**

## 3. Autenticação
- `Authorization: Bearer <TOKEN>` (somente leitura, escopo da Câmara de Sumé).

## 4. Endpoints

### 4.1 Sessões
```
GET /api/v1/sessoes?desde=&ate=&atualizado_desde=&page=&per_page=
```
```json
{
  "data": [{
    "id": "SESS-2026-0007",            // -> plenary_sessions.voting_system_id
    "titulo": "7ª Sessão Ordinária",
    "tipo": "ordinaria",                // ordinaria | extraordinaria | solene | ...
    "data": "2026-03-18",
    "hora_inicio": "09:00",
    "status": "encerrada",              // agendada | em_andamento | encerrada
    "pauta": "texto/itens da pauta",    // -> plenary_sessions.agenda
    "video_url": "https://youtube.com/watch?v=...",  // opcional (transmissão)
    "url": "https://votalegis.../sessao/7",          // -> voting_system_url
    "atualizado_em": "2026-03-18T12:00:00-03:00"
  }],
  "meta": { "page": 1, "per_page": 50, "total": 120, "total_pages": 3 }
}
```

### 4.2 Matérias (de uma sessão ou todas, com tramitação)
```
GET /api/v1/materias?sessao_id=&atualizado_desde=&page=
GET /api/v1/materias/{id}
```
```json
{
  "id": "MAT-2026-0123",               // -> legislative_activities.voting_system_id
  "numero": "PL 015/2026",
  "tipo": "projeto_de_lei",            // projeto_de_lei | requerimento | indicacao | mocao | veto | ...
  "titulo": "Projeto de Lei nº 015/2026",
  "ementa": "Dispõe sobre ...",        // -> summary
  "autor": "Vereador Fulano de Tal",   // -> author
  "origem": "legislativo",             // legislativo | executivo  (-> origin)
  "sessao_id": "SESS-2026-0007",
  "status": "aprovada",                // -> status
  "data": "2026-03-18",
  "tramitacao": [                      // -> legislative_activities.tramitation_steps (JSON)
    { "etapa": "Apresentação", "data": "2026-03-01", "descricao": "Protocolada" },
    { "etapa": "1ª votação",   "data": "2026-03-18", "descricao": "Aprovada em plenário" }
  ],
  "url": "https://votalegis.../materia/123",
  "atualizado_em": "2026-03-18T11:30:00-03:00"
}
```

### 4.3 Votação nominal (por matéria)
```
GET /api/v1/materias/{id}/votacoes
GET /api/v1/votacoes/{id}
```
```json
{
  "id": "VOT-2026-0088",               // -> nominal_votings.voting_system_id
  "materia_id": "MAT-2026-0123",
  "sessao_id": "SESS-2026-0007",
  "titulo": "Votação do PL 015/2026 (1º turno)",
  "data": "2026-03-18",                // -> voting_date
  "resultado": "aprovada",             // aprovada | rejeitada | retirada | ... (-> result)
  "unanime": false,                    // -> is_unanimous
  "totais": { "sim": 7, "nao": 2, "abstencao": 0, "ausente": 1 },
  "votos": [                           // -> nominal_voting_entries (1 por vereador)
    { "vereador_nome": "Fulano de Tal", "partido": "ABC", "voto": "sim" },
    { "vereador_nome": "Beltrano Silva", "partido": "XYZ", "voto": "nao" }
  ],
  "atualizado_em": "2026-03-18T11:35:00-03:00"
}
```

## 5. Casamento dos vereadores
O portal casa `votos[].vereador_nome`/`partido` com seus vereadores (`councilors`) por
**nome parlamentar** (e partido como desempate). **Ideal:** se o VotaLegis tiver um id de
parlamentar estável, mande também `vereador_id` — o casamento fica perfeito.

## 6. Convenções obrigatórias
- **`id` estável** em sessão/matéria/votação (chave de upsert; vira `voting_system_id`).
- **Datas ISO 8601**; `voto` no enum `sim | nao | abstencao | ausente`.
- **Sync incremental** via `atualizado_desde`.
- `resultado` e `status` em valores fechados (enviar a lista de valores possíveis na doc).

## 7. Mapeamento para o portal (resumo)
| VotaLegis | Tabela do portal | Chave |
|---|---|---|
| sessão | `plenary_sessions` | `voting_system_id = sessao.id` |
| matéria | `legislative_activities` | `voting_system_id = materia.id`; `tramitation_steps = tramitacao` |
| votação | `nominal_votings` + `nominal_voting_entries` | `voting_system_id = votacao.id`; votos → entries |

## 8. Erros
`401` token inválido · `404` id inexistente · `429` rate limit (`Retry-After`).
Erros: `{ "error": "mensagem" }`.
