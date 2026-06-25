# PROMPT — Construir a API REST do VotaLegis (consumo pelo Portal da Câmara)

> Cole este prompt para um desenvolvedor ou IA construir a API. É autossuficiente.

---

## Papel e objetivo

Você vai **projetar e implementar uma API REST somente-leitura** para o **VotaLegis**
(sistema de votação legislativa de uma Câmara Municipal). Um **portal público da Câmara**
vai consumir essa API periodicamente para sincronizar, de forma automática, três coisas:

1. **Sessões** plenárias
2. **Matérias** legislativas (projetos, requerimentos, indicações, etc.) com sua **tramitação**
3. **Votação nominal** de cada matéria (resultado + voto de cada vereador)

Hoje o portal importa esses dados raspando HTML — frágil e manual. A API substitui isso por
uma sincronização confiável. **A API não cria nem altera nada; só expõe leitura.**

## Princípios inegociáveis (a razão de cada um está entre parênteses)

1. **IDs estáveis e únicos** em sessão, matéria e votação. Uma vez emitido, o `id` de um
   registro **nunca muda** (o portal usa o `id` como chave para atualizar sem duplicar).
2. **Sincronização incremental**: todo recurso de listagem aceita `atualizado_desde`
   (datetime ISO 8601) e retorna só o que mudou desde então. Todo objeto traz `atualizado_em`.
   (O portal guarda o maior `atualizado_em` visto e pede só o delta no próximo sync.)
3. **Datas em ISO 8601** (date `YYYY-MM-DD`; datetime com timezone, ex. `-03:00`).
4. **Campos categóricos são enums fechados** — documente a lista completa de valores
   possíveis de `tipo`, `status`, `resultado` e `voto`. (O portal mapeia esses valores.)
5. **Paginação** em todas as listagens: `page` (default 1) e `per_page` (default 50, máx 200),
   com bloco `meta` no retorno.
6. **Autenticação**: header `Authorization: Bearer <TOKEN>`, escopo somente-leitura e
   restrito à Câmara. Sem token / token inválido → `401`.
7. **Respostas JSON**; erros no formato `{ "error": "mensagem legível" }`; use os códigos
   HTTP corretos (`401`, `404`, `429` com `Retry-After`).

## Recursos e contratos

### 1) Sessões — `GET /api/v1/sessoes`
Query: `desde`, `ate` (date), `atualizado_desde` (datetime), `page`, `per_page`.
```json
{
  "data": [{
    "id": "SESS-2026-0007",
    "titulo": "7ª Sessão Ordinária",
    "tipo": "ordinaria",
    "data": "2026-03-18",
    "hora_inicio": "09:00",
    "status": "encerrada",
    "pauta": "texto ou itens da pauta",
    "video_url": "https://youtube.com/watch?v=...",
    "url": "https://votalegis.exemplo/sessao/7",
    "atualizado_em": "2026-03-18T12:00:00-03:00"
  }],
  "meta": { "page": 1, "per_page": 50, "total": 120, "total_pages": 3 }
}
```
- `tipo`: `ordinaria | extraordinaria | solene | especial` (documente o conjunto real).
- `status`: `agendada | em_andamento | encerrada | cancelada`.
- `video_url` opcional (link da transmissão, se houver).

### 2) Matérias — `GET /api/v1/materias` e `GET /api/v1/materias/{id}`
Query da lista: `sessao_id`, `desde`, `ate`, `atualizado_desde`, `page`, `per_page`.
```json
{
  "id": "MAT-2026-0123",
  "numero": "PL 015/2026",
  "tipo": "projeto_de_lei",
  "titulo": "Projeto de Lei nº 015/2026",
  "ementa": "Dispõe sobre ...",
  "autor": "Vereador Fulano de Tal",
  "origem": "legislativo",
  "sessao_id": "SESS-2026-0007",
  "status": "aprovada",
  "data": "2026-03-18",
  "tramitacao": [
    { "etapa": "Apresentação", "data": "2026-03-01", "descricao": "Protocolada" },
    { "etapa": "1ª votação",   "data": "2026-03-18", "descricao": "Aprovada em plenário" }
  ],
  "url": "https://votalegis.exemplo/materia/123",
  "atualizado_em": "2026-03-18T11:30:00-03:00"
}
```
- `tipo`: `projeto_de_lei | projeto_de_resolucao | projeto_de_decreto_legislativo | requerimento | indicacao | mocao | veto | emenda | ...` (documente o conjunto real).
- `origem`: `legislativo | executivo`.
- `status`: `em_tramitacao | aprovada | rejeitada | retirada | arquivada | ...`.
- `tramitacao`: lista ordenada por data (a linha do tempo da matéria).

### 3) Votação nominal — `GET /api/v1/materias/{id}/votacoes` e `GET /api/v1/votacoes/{id}`
```json
{
  "id": "VOT-2026-0088",
  "materia_id": "MAT-2026-0123",
  "sessao_id": "SESS-2026-0007",
  "titulo": "Votação do PL 015/2026 (1º turno)",
  "data": "2026-03-18",
  "resultado": "aprovada",
  "unanime": false,
  "totais": { "sim": 7, "nao": 2, "abstencao": 0, "ausente": 1 },
  "votos": [
    { "vereador_id": "VER-12", "vereador_nome": "Fulano de Tal", "partido": "ABC", "voto": "sim" },
    { "vereador_id": "VER-08", "vereador_nome": "Beltrano Silva", "partido": "XYZ", "voto": "nao" }
  ],
  "atualizado_em": "2026-03-18T11:35:00-03:00"
}
```
- `resultado`: `aprovada | rejeitada | retirada | prejudicada` (documente o conjunto real).
- `voto`: `sim | nao | abstencao | ausente`.
- `votos[].vereador_id`: id estável do parlamentar **se existir** (deixa o casamento perfeito);
  `vereador_nome` + `partido` são obrigatórios de qualquer forma.
- `totais` deve bater com a contagem de `votos`.

## Critérios de aceite (valide antes de entregar)
- [ ] Os 3 recursos retornam no formato acima, com `meta` de paginação nas listas.
- [ ] `atualizado_desde` realmente filtra o delta (teste pedindo com uma data recente).
- [ ] IDs são estáveis entre chamadas (a mesma sessão/matéria/votação mantém o `id`).
- [ ] Datas em ISO 8601; enums só com os valores documentados; `voto` no conjunto fechado.
- [ ] `totais` consistente com `votos`; `unanime=true` ⇔ todos os presentes votaram igual.
- [ ] `401` sem token, `404` em id inexistente, `429` com `Retry-After` sob carga.
- [ ] Documentação (OpenAPI/Swagger) lista os enums reais de `tipo`, `status`, `resultado`.

## Entregáveis
1. A API implementada conforme o contrato.
2. Especificação **OpenAPI 3** (`/openapi.json` ou arquivo) com os enums reais.
3. Um **token de teste** e a **base URL** para o portal validar.
4. (Opcional, ótimo) um endpoint de saúde `GET /api/v1/health` → `{ "status": "ok" }`.
