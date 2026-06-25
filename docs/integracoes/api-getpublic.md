# Especificação da API — GetPublic → Portal da Câmara (Diário, Publicações, Contratos, Licitações, Dispensas)

> **Para quem vai construir a API no GetPublic.** Este documento descreve, do ponto de
> vista do **consumidor** (o Portal da Câmara de Sumé), exatamente quais endpoints,
> parâmetros e campos a API do GetPublic precisa expor para que o portal sincronize
> automaticamente os documentos oficiais, **sem digitação manual**.
>
> Use este texto como **prompt/brief** para implementar a API (por humano ou IA).

## 1. Contexto e objetivo

O GetPublic (`getpublic.inf.br`) é o sistema onde a Câmara **posta** os documentos
oficiais. Cada documento é uma **matéria** com um **código estável de 14 dígitos**
e está vinculado a uma **entidade** (Sumé = `CMSU`). Hoje o portal só linka o Diário,
via `https://getpublic.inf.br/system/visualizar-materia?materia=<codigo>&link=CMSU`.

**Objetivo:** o portal roda `getpublic:sync` periodicamente e popula sozinho os módulos
**Diário Oficial, Publicações Oficiais, Contratos, Licitações e Dispensas**. Fonte única
no GetPublic → sempre fresco no portal (bom para PNTP/ATRICON).

## 2. Autenticação

- `Authorization: Bearer <API_KEY>` — uma chave por entidade (escopo = só `CMSU`).
- Somente leitura. Sem dados sigilosos (são documentos públicos).

## 3. Endpoints

### 3.1 Listar matérias (com filtros e sync incremental)
```
GET /api/v1/entidades/{entidade}/materias
```
**Query params:**
| param | tipo | descrição |
|---|---|---|
| `tipo` | string (opcional, repetível) | `diario` \| `publicacao` \| `contrato` \| `licitacao` \| `dispensa` (taxonomia abaixo) |
| `publicado_desde` | date ISO `YYYY-MM-DD` | filtra por data de publicação |
| `publicado_ate` | date ISO | idem |
| `atualizado_desde` | datetime ISO 8601 | **sync incremental**: só o que mudou desde o último sync |
| `page` / `per_page` | int | paginação (default 50, máx 200) |

**Resposta `200`:**
```json
{
  "data": [
    {
      "codigo": "20260115093000",        // 14 dígitos, ESTÁVEL e único (chave de upsert)
      "tipo": "contrato",                 // taxonomia da §5
      "numero": "012/2026",               // número oficial do documento
      "titulo": "Extrato do Contrato nº 012/2026",
      "resumo": "Contratação de ... (ementa curta)",
      "data_publicacao": "2026-01-15",    // ISO date
      "ano": 2026,
      "url_visualizador": "https://getpublic.inf.br/system/visualizar-materia?materia=20260115093000&link=CMSU",
      "url_documento": "https://getpublic.inf.br/.../arquivo.pdf",  // PDF direto (p/ extração por IA)
      "mime": "application/pdf",
      "atualizado_em": "2026-01-15T09:30:00-03:00"   // p/ delta sync
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 1234, "total_pages": 25 }
}
```

### 3.2 Detalhe de uma matéria (com texto p/ extração por IA)
```
GET /api/v1/materias/{codigo}
```
Igual ao item da lista **+**:
```json
{
  "texto": "conteúdo textual do documento (se houver OCR/texto no GetPublic)",
  "anexos": [{ "titulo": "Anexo I", "url": "https://.../anexo.pdf", "mime": "application/pdf" }]
}
```
> `texto` é **opcional mas valioso**: se o GetPublic já tem o texto extraído, o portal
> evita re-OCR. Se não vier, o portal extrai do `url_documento`.

## 4. Convenções obrigatórias
- **`codigo` é a chave de idempotência** — nunca muda para a mesma matéria; o portal faz
  upsert por ele (não duplica em re-sync).
- **Datas em ISO 8601** (date `YYYY-MM-DD`; datetime com timezone).
- **Sync incremental** via `atualizado_desde` (o portal guarda o maior `atualizado_em` visto).
- **`url_documento`** deve apontar para o **PDF** (não só o visualizador HTML) quando possível —
  é o que a IA lê para extrair os campos estruturados de contrato/licitação.

## 5. Taxonomia de `tipo` (mapeamento para os módulos do portal)
| `tipo` GetPublic | Módulo nativo do portal | Campos preenchidos |
|---|---|---|
| `diario` | Diário Oficial (`official_gazette_entries`) | `edition_number=codigo`, `publication_date`, `file_url=url_visualizador`, `description=titulo` |
| `publicacao` | Publicações Oficiais (`official_publications`) | `number`, `type`, `title`, `publication_date`, `file_url` |
| `contrato` | Contratos (`contracts`) | `number`, `file_url`, `year` + **campos estruturados via IA** (valor, contratado, vigência, gestor/fiscal, portaria — PNTP 9.1/9.3) |
| `licitacao` | Licitações (`licitacoes`) | `number`, `modality`, `title`, `object`, `opening_date`, `file_url` |
| `dispensa` | Licitações (`licitacoes`, `modality='dispensa'`) | idem licitação |

> Se o GetPublic tiver subtipos próprios, mande-os num campo extra `subtipo` — o portal
> mapeia. O importante é o `tipo` macro acima estar correto.

## 6. O que o portal faz com o retorno (resumo)
1. `getpublic:sync` (agendado) lista por `atualizado_desde`.
2. Upsert por `codigo` no módulo correto (tabela acima).
3. Para `contrato`/`licitacao`: dispara a **extração por IA** do PDF → preenche campos
   estruturados como **rascunho** → humano revisa no painel → publica.
4. Mantém `url_visualizador` como link público do documento.

## 7. Erros
- `401` sem/!chave inválida · `403` chave sem acesso à entidade · `404` matéria inexistente ·
  `429` rate limit (envie `Retry-After`). Respostas de erro: `{ "error": "mensagem" }`.
