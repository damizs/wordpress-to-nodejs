# O que o GetPublic precisa disponibilizar na API — Câmara Municipal de Sumé

> Documento para **encaminhar ao GetPublic**. Descreve, do ponto de vista do
> Portal da Câmara (o consumidor), o que a API precisa expor para integrarmos a
> busca e a listagem de matérias **sem digitação manual** e sem nos obrigar a
> baixar/armazenar os PDFs (os documentos continuam vivendo no GetPublic).

## Contexto (o que já existe hoje)

- Cada documento é uma **matéria** com **código estável de 14 dígitos**
  (ex.: `20260219095152`) vinculada à entidade **Sumé = `CMSU`**.
- Já existe o **visualizador público**:
  `https://getpublic.inf.br/system/visualizar-materia?materia=<codigo>&link=CMSU`
- O **PDF direto** parece estar em
  `https://getpublic.inf.br/uploads/CMSU/pdf/<codigo>/getpub-view.pdf`
- Existe o backend `diarios_serverside.php` (DataTables) que, **com sessão e o
  flag `buscaConteudo=true`**, busca no OCR dos diários e retorna as matérias que
  casam (`codigo`, `titulo`, `tipo`, `urlMateria`).

Conseguimos integrar por engenharia reversa desse backend, mas ele é **frágil
para automação**: exige sessão/cookies, **não tem "listar todas as matérias"**
(só devolve matérias quando há termo de busca — hoje contornamos unindo buscas
por vogais), **não tem sincronização incremental** e não é um contrato estável.

Pedimos abaixo um **endpoint REST somente-leitura** que formalize isso.

---

## 1. Autenticação

- `Authorization: Bearer <API_KEY>` — **uma chave por entidade** (escopo só `CMSU`).
- Somente leitura. São documentos **públicos** (sem dado sigiloso).

## 2. Endpoint principal — listar matérias (com filtros + sync incremental)

```
GET /api/v1/entidades/CMSU/materias
```

| param | tipo | descrição |
|---|---|---|
| `tipo` | string, repetível, **opcional** | `portaria` \| `aviso_licitacao` \| `extrato_contrato` \| `extrato_aditivo` \| `extrato_dispensa` \| `termo_homologacao` \| `termo_adjudicacao` \| `ata` \| `requerimento` \| `resolucao` \| `decreto_legislativo` \| `projeto_lei` \| `edital` \| `ordem_cronologica` \| `outros` (ver §5) |
| `publicado_desde` / `publicado_ate` | date `YYYY-MM-DD` | filtro por data de publicação |
| `atualizado_desde` | datetime ISO 8601 | **sync incremental** — só o que mudou desde o último sync |
| `q` | string, opcional | busca por título **e conteúdo/OCR** (o que o `buscaConteudo` já faz) |
| `page` / `per_page` | int | paginação (default 50, máx 200) |

**Resposta `200`:**
```json
{
  "data": [
    {
      "codigo": "20260219095152",                 // 14 dígitos, ESTÁVEL e único (chave de upsert)
      "tipo": "portaria",                          // taxonomia da §5
      "numero": "35/2026",                         // número oficial, quando houver
      "titulo": "PORTARIA 35/2026",
      "data_publicacao": "2026-02-19",             // ISO date
      "ano": 2026,
      "diario_edicao": "00269",                    // edição do diário que contém a matéria
      "url_visualizador": "https://getpublic.inf.br/system/visualizar-materia?materia=20260219095152&link=CMSU",
      "url_documento": "https://getpublic.inf.br/uploads/CMSU/pdf/20260219095152/getpub-view.pdf",
      "mime": "application/pdf",
      "atualizado_em": "2026-02-19T09:55:00-03:00" // p/ delta sync
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 1234, "total_pages": 25 }
}
```

> **O ponto mais importante:** queremos **listar TODAS as matérias** da entidade
> (com paginação), **sem precisar** de um termo de busca. Hoje o backend só
> devolve matérias quando há `q`/`buscaConteudo`. Sem um "listar tudo" não há como
> sincronizar o acervo de forma confiável.

## 3. Endpoint de diários (edições)

```
GET /api/v1/entidades/CMSU/diarios
```
Lista as edições do Diário Oficial: `codigo` (ex.: `00269`), `titulo`,
`data` (ISO), `url_documento` (PDF da edição), `qtd_materias`, `atualizado_em`.
*(Hoje obtemos isso do `diarios_serverside.php`; só falta formalizar.)*

## 4. Detalhe de uma matéria (opcional, valioso p/ IA)

```
GET /api/v1/materias/{codigo}
```
Igual ao item da lista **+** (quando o GetPublic já tiver):
```json
{ "texto": "conteúdo textual/OCR do documento (se houver)",
  "anexos": [{ "titulo": "Anexo I", "url": "https://.../anexo.pdf", "mime": "application/pdf" }] }
```
> `texto`/OCR é opcional, mas nos pouparia re-OCR ao extrair dados de
> contratos/portarias (gestor, fiscal, vigência) por IA.

## 5. Taxonomia de tipos (a que já vimos no acervo de Sumé)

`AVISO DE LICITAÇÃO`, `EXTRATO DE CONTRATO`, `EXTRATO DE ADITIVO`,
`EXTRATO DE DISPENSA DE LICITAÇÃO`, `EXTRATO DE INEXIGIBILIDADE`,
`EXTRATO DE RATIFICAÇÃO`, `TERMO DE HOMOLOGAÇÃO`, `TERMO DE ADJUDICAÇÃO`,
`AVISO DE HABILITAÇÃO`, `DEMAIS ATOS DE LICITAÇÃO`, `EDITAL`, `ORDEM CRONOLÓGICA`,
`PORTARIA`, `ATA`, `REQUERIMENTO`, `INDICAÇÃO`, `EMENDA`,
`RESOLUÇÃO LEGISLATIVA`, `DECRETO LEGISLATIVO`, `PROJETO DE LEI LEGISLATIVO`,
`PROJETO DE RESOLUÇÃO`, `ATOS ADMINISTRATIVOS`, `OUTROS ATOS ADMINISTRATIVOS`,
`RESULTADO`, `DECRETO`.

> Ideal: cada tipo com um **slug estável** (`extrato_contrato`, `portaria`…) além
> do rótulo de exibição, p/ mapearmos aos módulos do portal sem heurística.

## 6. Convenções obrigatórias

- **`codigo` é a chave de idempotência** — nunca muda; o portal faz upsert por ele
  (não duplica em re-sync).
- **Datas em ISO 8601** (date `YYYY-MM-DD`; datetime com timezone `-03:00`).
- **`atualizado_em` confiável** em toda matéria — é o que viabiliza o sync barato.
- **URLs `url_visualizador` e `url_documento` estáveis** (confirmar o padrão do PDF
  `uploads/CMSU/pdf/<codigo>/getpub-view.pdf`).
- **Paginação** com `meta.total` / `total_pages`.
- **CORS/headers** liberados para leitura server-to-server (a chamada parte do
  servidor do portal, não do navegador).

## 7. Resumo do mínimo necessário (prioridade)

1. **Listar TODAS as matérias da entidade, paginado, sem termo de busca** (§2).  ← crítico
2. **Filtro `atualizado_desde`** p/ sincronização incremental diária. ← crítico
3. **Autenticação por API key** por entidade (em vez de sessão/cookies). ← importante
4. Campos estáveis: `codigo`, `tipo`(slug), `numero`, `titulo`, `data_publicacao`,
   `diario_edicao`, `url_visualizador`, `url_documento`, `atualizado_em`. ← importante
5. (Opcional) `texto`/OCR e `anexos` no detalhe da matéria, p/ extração por IA.

Com (1)+(2)+(3)+(4) já sincronizamos todo o acervo de forma confiável e mantemos
a busca do portal sempre fresca — sem armazenar nenhum PDF localmente.
