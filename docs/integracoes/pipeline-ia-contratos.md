# Pipeline de IA — Extração de Contratos e Fiscais (GetPublic → Portal)

> Como automatizar, via IA (DeepSeek ou o hub central de integrações), a extração
> estruturada de **contratos** (PNTP 9.1) e **fiscais de contrato** (PNTP 9.3) a
> partir dos documentos publicados no GetPublic — sem digitação manual.
>
> A 1ª passada foi feita manualmente (Claude) em jun/2026: 50 contratos + fiscais
> carregados para revisão. Este doc descreve o fluxo para repetir/automatizar.

## 1. Fonte dos documentos (GetPublic)

Já indexados em `getpublic_materias` (ver `getpublic-o-que-precisamos.md`). Tipos relevantes:

| Tipo da matéria | Vira no portal | Campos |
|---|---|---|
| `EXTRATO DE CONTRATO` | **contrato** novo | número, contratada, CNPJ, valor, vigência, modalidade, base legal, data, objeto |
| `EXTRATO DE ADITIVO` | **aditivo** ao contrato-pai | contrato original, novo valor/vigência, objeto do aditivo |
| `EXTRATO DE DISTRATO` | encerra contrato | contrato original |
| `EXTRATO DE APOSTILAMENTO` | nota no contrato | repactuação de preço |
| `PORTARIA` (designação) | **fiscal/gestor** do contrato (9.3) | fiscal titular/suplente + cargo + nº da portaria + contrato |

**PDF de cada matéria** (tentar nesta ordem — o nome varia):
1. `https://getpublic.inf.br/uploads/CMSU/pdf/<codigo>/<codigo>.pdf`
2. `…/getpub.pdf`
3. `…/getpub-view.pdf?v=<token>` (token na página `visualizar-materia`)

Extrair texto da **página 1** (o resto é comprovante de publicação — ruído).
O texto é nativo (TCPDF), não escaneado → `pdftotext`/`pdf-parse` resolvem; OCR raramente é necessário.

## 2. Prompt de extração (DeepSeek / OpenAI-compatível)

Modelo sugerido: `deepseek-chat` (barato, bom em PT). Endpoint compatível com OpenAI:
`POST https://api.deepseek.com/v1/chat/completions`, `Authorization: Bearer <DEEPSEEK_API_KEY>`,
`response_format: { type: "json_object" }`, `temperature: 0`.

**System:**
```
Você extrai dados estruturados de extratos de contratos e portarias de uma Câmara
Municipal brasileira, publicados no Diário Oficial. Responda APENAS com JSON válido
no schema pedido. Não invente: use null quando o dado não estiver no texto. Valores
monetários como número (ex.: 78000.00). Datas em ISO YYYY-MM-DD. O "número do contrato"
é o do CORPO do documento (ex.: "EXTRATO DO CONTRATO Nº 00012/2026" → "00012/2026"),
NÃO o número do título/matéria.
```

**User (para EXTRATO DE CONTRATO):**
```
Classifique e extraia do texto abaixo. Schema:
{
  "doc_kind": "contrato|aditivo|distrato|apostilamento|retificacao",
  "numero": "string|null",            // número do contrato (corpo)
  "ano": "string|null",
  "contrato_original": "string|null", // p/ aditivo/distrato/apostilamento
  "contratada": "string|null",
  "cnpj": "string|null",
  "objeto": "string|null",
  "valor": number|null,
  "vigencia": "string|null",          // texto literal da vigência
  "data_inicio": "YYYY-MM-DD|null",
  "data_fim": "YYYY-MM-DD|null",
  "modalidade": "string|null",
  "fundamento_legal": "string|null",
  "data_assinatura": "YYYY-MM-DD|null",
  "processo": "string|null"
}
TEXTO:
<<<texto da página 1>>>
```

**User (para PORTARIA de designação de fiscal — PNTP 9.3):**
```
Extraia a designação de fiscal/gestor. Schema:
{
  "portaria_numero": "string|null",        // ex.: "DV00021-1/2025"
  "contrato_numero": "string|null",         // contrato fiscalizado (Art. 2º)
  "contratada": "string|null",
  "fiscal_titular": "string|null",
  "fiscal_titular_cargo": "string|null",
  "fiscal_suplente": "string|null",
  "gestor": "string|null",
  "gestor_cargo": "string|null"
}
TEXTO:
<<<texto da portaria>>>
```

## 3. Mapeamento para o banco (`contracts`)

| Campo IA | Coluna `contracts` |
|---|---|
| numero / ano | `number` / `year` |
| contratada / cnpj | `contractor_name` / `contractor_document` |
| objeto | `object` / `content` |
| valor | `value` |
| vigencia (texto) / data_fim | `term` / `end_date` |
| modalidade / fundamento_legal | `modality` / `legal_basis` |
| data_assinatura | `sign_date` |
| (portaria) fiscal_titular / cargo / portaria_numero | `fiscal_name` / `fiscal_role` / `fiscal_act` |
| (portaria) gestor / cargo | `manager_name` / `manager_role` |
| — | `file_url` = visualizador GetPublic; `slug` = `contrato-<n>-<ano>` |

- **Idempotência:** upsert por (`number`,`year`). Aditivo/distrato → casa pelo
  `contrato_original` e atualiza `end_date`/`value`/`status`/`notes`.
- **Fiscal (PORTARIA):** casa pelo `contrato_numero` e preenche os campos fiscal/gestor.
- **Status:** `vigente` se `end_date >= hoje`, senão `encerrado`; distrato → `encerrado`.
- **Proveniência/revisão:** `notes` inicia com `[GETPUBLIC-IA]` — marca rascunho a revisar
  e permite rollback (`DELETE … WHERE notes LIKE '[GETPUBLIC-IA]%'`).

## 4. Integração via hub central (recomendado)

O hub que conecta os portais node faz as chamadas de IA e **empurra** o resultado:
1. Portal expõe as matérias-fonte a extrair (de `getpublic_materias`, com URL do PDF).
2. Hub baixa PDF → extrai texto → DeepSeek (prompts da §2) → JSON.
3. Hub faz `POST /painel/contratos/importar-ia` (a criar) com o array de objetos do schema.
4. Portal faz upsert como rascunho `[GETPUBLIC-IA]`; humano revisa em `/painel/contratos`.

Alternativa local: comando `node ace contratos:extrair-ia` que faz tudo no portal
(precisa `DEEPSEEK_API_KEY` no Coolify + lib de PDF, ex.: `pdf-parse`).

## 5. Estado da 1ª passada (jun/2026, feita por Claude)

- 64 matérias-fonte (56 EXTRATO DE CONTRATO + 8 ADITIVO) baixadas e extraídas.
- 50 contratos carregados (44 c/ valor) + aditivos/distratos anexados ao pai.
- Fiscais: 44 portarias de designação localizadas (Art. 117, Lei 14.133/2021) — extração
  fiscal↔contrato em andamento. Marcador `[GETPUBLIC-IA]` para revisão.
- Scripts da passada manual: `/root/contratos-ia/` (extrair2.py, load_sql.py).
