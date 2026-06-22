# Validação do backup WordPress de Sumé

Backup analisado:
`C:\Users\arauj\Downloads\web_camaradesume.pb.gov.br_20260615_063130_2WIeKY.zip`

Data da validação: 22/06/2026.

## Estrutura do backup

O zip principal contém:

- `database.sql.gz` com dump MySQL do WordPress.
- `files.zip` com os arquivos do site.
- `meta.json` com metadados do backup.

Inventário do `files.zip`:

- 67.108 entradas totais.
- 8.947 entradas em `wp-content/uploads` incluindo diretórios.
- 596 PDFs.
- 7.686 imagens.
- 91 documentos (`doc`, `docx`, `xls`, `xlsx`, `csv`).
- 30.616 entradas de plugins.

## Migração realizada nesta passada

Foi criada uma esteira completa para o acervo WordPress geral, além dos importadores
específicos que já existiam.

- `scripts/extract_wp_legacy_content.mjs`
  - Lê o `database.sql`.
  - Extrai posts publicados, páginas publicadas/privadas, anexos e caminhos de upload.
  - Gera `database/wp_legacy_content.json`.
- `database/wp_legacy_content.json`
  - 1.636 posts publicados.
  - 36 páginas do WordPress.
  - 1.411 anexos do WordPress.
  - 1.855 caminhos de upload referenciados por posts, páginas e anexos.
- `app/services/wp_legacy_content_importer.ts`
  - Importa posts como Notícias históricas.
  - Importa páginas livres no módulo Páginas.
  - Preserva páginas antigas que colidem com módulos nativos como `legado-...`, sem
    sobrescrever rotas como Transparência, Comissões, Diário, Duodécimos e afins.
  - Reescreve URLs de `/wp-content/uploads/...` para `/uploads/wp-migration/...`
    quando o arquivo existe localmente.
  - Mantém o link remoto original quando algum arquivo citado não existe no backup.
- `commands/wp_legacy_content.ts`
  - Comando: `node ace wp:legacy-content`.
  - Simulação: `node ace wp:legacy-content --dry-run`.
- `public/uploads/wp-migration/`
  - 8.707 arquivos extraídos de `wp-content/uploads`.
  - Diretório ignorado no Git para não versionar gigabytes de acervo.
- `scripts/extract_wp_uploads_from_backup.ps1`
  - Extrai `wp-content/uploads` diretamente do zip de backup para
    `public/uploads/wp-migration`.
  - Usa prefixo de caminho longo do Windows para preservar nomes extensos de PDFs.

O script one-off `scripts/wp_import.sh` agora também chama `node ace wp:legacy-content`.

## O que bateu com o projeto atual

Os datasets extraídos em `database/wp_*.json` batem com as tabelas do backup:

- PNTP/Acesso à Informação: 104 registros, 99 anexos, 87 declarações no SQL.
  O projeto possui `database/wp_pntp.json` com os mesmos 104 registros e 99 anexos.
- Diário Oficial: 580 matérias no SQL.
  O projeto possui `database/wp_diario_oficial.json` com os mesmos 580 registros.
- Links Rápidos: 38 links no SQL.
  O projeto possui `database/wp_quick_links.json` com os mesmos 38 links
  (13 da home e 25 de Acesso à Informação/PNTP).
- Atividades Legislativas: 478 itens no SQL.
  O projeto possui `database/wp_activities.json` com os mesmos 478 itens e 11 vereadores.
- Conteúdo base de migração:
  `database/migration_data.json` tem 107 notícias, 11 vereadores, 21 FAQs,
  4 mesa diretora, 4 comissões e 5 perguntas da pesquisa.
  `database/migration_extra.json` tem 504 matérias, 24 publicações, 10 atas
  e 47 itens de transparência.

## Validação dos arquivos físicos

Dos 1.855 caminhos de upload referenciados no inventário completo, 1.849 possuem
arquivo correspondente em `public/uploads/wp-migration`.

Permanecem 6 caminhos sem arquivo exato no backup:

- `2025/01/WhatsApp-Image-2025-01-23-at-08.23.49.jpeg`
- `2025/05/ORGANOGRAMA-SUME.pdf`
- `2025/06/Plano-de-Contratacoes-Anual-PCA-CM-de-Sume.pdf`
- `2026/02/VERBAS-2026.pdf`
- `2026/03/Requerimento-53.doc`
- `2026/04/Gemini_Generated_Image_914p2e914p2e914p-300x290.jpg`

Arquivos parecidos encontrados:

- `2025/04/Organograma-Funcional-CM-Sume.pdf`
- `2026/04/Requerimento-53.doc`
- Vários PDFs de verbas em `2025/04` e `2025/06`, mas não `2026/02/VERBAS-2026.pdf`.

O importador não quebra essas referências: quando o arquivo local não existe,
mantém a URL remota original do WordPress como fallback.

## Pendência operacional

A gravação no banco local não pôde ser concluída nesta máquina porque o Postgres
do `.env` (`127.0.0.1:5432`, banco `camara_sume`) não estava rodando.

Com o banco ativo, executar:

```bash
node ace migration:run
node ace wp:legacy-content
```

Para reextrair os uploads físicos do backup em uma máquina Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\extract_wp_uploads_from_backup.ps1 -BackupZip "C:\Users\arauj\Downloads\web_camaradesume.pb.gov.br_20260615_063130_2WIeKY.zip"
```

Ou, no deploy/one-off completo:

```bash
sh scripts/wp_import.sh
```

A simulação do comando foi executada com sucesso:

```bash
node ace wp:legacy-content --dry-run
```

## Conclusão

O acervo agora está preparado para migração completa:

- Dados estruturados e módulos nativos: cobertos.
- Posts históricos do WordPress: inventariados e prontos para importar.
- Páginas WordPress: inventariadas e preservadas sem sobrescrever módulos nativos.
- Uploads físicos: extraídos localmente, com fallback remoto para 6 divergências.

Para considerar 100% aplicado no ambiente, falta apenas rodar o importador com
Postgres ativo e revisar, no painel, quais páginas legadas devem permanecer
publicadas, virar redirect ou ficar apenas como arquivo histórico.
