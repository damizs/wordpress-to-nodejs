# AGENTS.md — Portal da Câmara Municipal de Sumé

Documentação viva do projeto: o que é, como deve ser, como está, e o que falta.
Mantenha este arquivo atualizado ao adicionar módulos/funcionalidades.

---

## 1. Visão geral

Portal institucional da **Câmara Municipal de Sumé (PB)**, reescrito do WordPress
(Elementor + plugins) para uma stack moderna nativa. Objetivos:

1. **Conformidade legal** — LAI (Lei 12.527/2011), LC 131/2009, e-MAG/WCAG, LGPD,
   Dados Abertos (Dec. 8.777/2016) e a matriz **PNTP/ATRICON 2026**.
2. **Autonomia do cliente** — quase tudo editável pelo painel `/painel`, sem
   depender de programador (páginas, menus, conteúdo, aparência, transparência).
3. **UI/UX moderno, acessível e responsável** — design system próprio, modo
   escuro, acessibilidade (e-MAG + VLibras), responsivo em qualquer tela.

> **Cores institucionais de Sumé:** `#141b47` (principal/navy) e `#272971`
> (secundária). Destaque em dourado. Editáveis em Aparência.

---

## 2. Stack & arquitetura

- **Backend:** AdonisJS 6 (TypeScript), Lucid ORM, PostgreSQL.
- **Frontend:** Inertia 2 + React 19, Tailwind 3, **SSR habilitado** (Vite).
- **Auth:** sessão (cookie httpOnly) + **RBAC** próprio (User ↔ Role ↔ Permission),
  permissões no padrão `recurso.acao` (ex.: `noticia.criar`, `transparencia.gerenciar`).
  Middleware `middleware.can(['perm'])` exige QUALQUER uma das permissões.
- **Segurança:** Shield (CSRF), sessões, uploads validados.
- **Build/deploy:** `node ace build`; Docker + Coolify; `startup.sh` roda
  `migration:run --force` → `db:seed` → server. Import do WordPress só com
  `FORCE_WP_MIGRATE=true` (comando `wp:migrate`, idempotente).

**Pastas:** `app/` (controllers, models, services, helpers), `inertia/`
(pages, components, layouts, lib, hooks, css), `start/` (routes, kernel,
legacy_redirects), `database/migrations`, `config/`, `public/`, `.acervo/plugins`
(plugins WP de referência para portar).

---

## 3. Design system

Tokens HSL em `inertia/css/app.css` + `tailwind.config.ts`. **Sempre use tokens**
(`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
`bg-muted`, `navy`, `gold`, `sky`, `primary`) — nunca `bg-white`/`text-gray-*`
fixos no chrome (quebra o modo escuro).

- **Paleta:** `--navy` (principal), `--gold` (destaque), `--sky` (secundária),
  derivados `--navy-dark/-light`, `--gold-light`.
- **Modo escuro:** classe `.dark` no `<html>`. **Alto contraste:** `.high-contrast`.
  **Escala de fonte:** `html[data-font-scale="1|2|3"]`. Aplicados antes do paint
  por script anti-flash em `resources/views/inertia_layout.edge` (localStorage).
- **Temas de cor (preset):** `inertia/lib/campaigns.tsx` — Navy/Verde/Vinho/Roxo/
  Grafite. Setting `theme_preset`.
- **Estilos de layout:** `inertia/lib/layouts.ts` + atributo `data-layout` no
  `<html>` → Institucional (padrão), Minimalista, Moderno, Clássico. Sobrescreve
  raio/sombra/tipografia/densidade via CSS, **sem reescrever páginas**. Setting
  `layout_style`. Ortogonal ao tema de cor.
- **Modelos de site (estrutura):** `inertia/lib/templates.ts` + atributo
  `data-template` no `<html>` → Institucional (padrão), Clássico/Governamental,
  Moderno/Destaque, Compacto/Notícias. Setting `site_template`. Muda a ESTRUTURA
  do front: arranjo do `Header` (ramificado por template, com busca/menu-mobile/
  widgets compartilhados), a abertura da home (`HomeHero` quando `homeHero:true`) e
  a **ordem das seções internas da home** (`homeOrder` por modelo; a home renderiza
  as seções nessa ordem, respeitando a visibilidade `section_*_visible`).
  Ortogonal a cor e a `layout_style` — combina com qualquer um. Persistido para o
  script anti-flash reaplicar antes do paint.
- **Campanhas sazonais:** Outubro Rosa, Novembro Azul, Setembro Amarelo, Maio
  Amarelo, Junho Vermelho, Abril Azul. `campaign_mode` = `auto|off|<chave>`.
  Recolore **apenas header, footer e botões** (`--gradient-hero/-navy`,
  `--primary`) — o resto mantém a paleta institucional. Banner dispensável.
- **`DynamicTheme.tsx`** aplica preset/custom/campanha/layout/modelo. **`DynamicFavicon`**
  ajusta o favicon.

**Convenções visuais:**
- Cabeçalho de seção: **sempre** `SectionHeading` (badge ACIMA do título — a badge
  vai num `<div>` próprio porque `.heading-accent` é `inline-block`). `tone`
  light/dark, `align` center/left.
- **Container padrão ÚNICO:** a classe Tailwind `.container` (em `tailwind.config.ts`:
  centralizado, **max 1480px em telas grandes**, com **padding lateral responsivo
  de 24px no mobile até 48px no desktop**. Breadcrumb, header, footer
  E o conteúdo de TODA página usam a MESMA `.container` → alinhamento perfeito em
  qualquer tela. Componente reutilizável: `inertia/components/PageContainer.tsx`.
  **Nunca** use `max-w-* mx-auto` no conteúdo principal (centraliza e desalinha do
  breadcrumb) — o conteúdo deve preencher a largura do `.container`.
- Página interna: `PageHero` + `Breadcrumb` + `<section className="py-10 lg:py-14"><div className="container">`.
- **Tags/badges douradas:** texto **navy escuro** (não branco nem dourado-sobre-
  dourado) — contraste AA. Ex.: badge do PageHero = `bg-gold text-navy-dark`.
- Painel: **UI kit** `inertia/components/admin/ui.tsx** (Button, Input, Select,
  Field, Card, Table, StatusBadge, ConfirmDelete, Pagination, EmptyState, Modal,
  Toolbar, PageHeader). Nunca reimplementar tabela/badge com cores soltas.
- Carrossel automático infinito: `InfiniteCarousel.tsx` (scroll-snap + rAF).
- Status com cor: `StatusBadge` (admin) / mapa único por entidade (público).

---

## 4. Módulos do painel (`/painel`)

Menu em `inertia/layouts/AdminLayout.tsx` (`navGroups`) — grupos **recolhíveis**
(estado em `localStorage: admin_collapsed_groups`).
O painel tem busca rápida/comando global com `Ctrl/Cmd+K`, varrendo os módulos
permitidos pelo RBAC, e o Dashboard exibe o **Radar de atualização** com módulos
vazios/desatualizados, última data e caminho direto para correção.

**Conteúdo:** Notícias (+ Automação Instagram via RapidAPI+IA), Publicações, FAQ.
**Legislativo:** Vereadores, Comissões, Legislaturas, Biênios, **Sessões**
(agendamento/vídeo, pauta, ata/minuta, PDF, campos de integração com sistema de
votação e export público ICS em `/agenda.ics`), **Atas** e **Pautas** (módulos INDEPENDENTES — tabelas
`atas`/`pautas`, models `Ata`/`Pauta`, mesmos campos: título, data, tipo de
sessão, conteúdo textual e PDF; páginas públicas `/atas` e `/pautas` leem dessas
tabelas; busca/sitemap/ATRICON repontados), Atividades Legislativas (multi-autoria
→ perfil do vereador, **origem Executivo/Legislativo** para organizar Projetos de Lei),
Votações Nominais (importação por HTML).
**Transparência:** Transparência (seções+links, link com `open_mode` nova-aba/
modal e `hide_chrome`), **Duodécimos**, **Relatórios Fiscais** (RGF/RREO —
ramificação ano→período: bimestre/trimestre/quadrimestre/semestre por documento
"a depender da câmara"; upload de PDF; PNTP 11.5), Licitações (+ documentos), **Contratos**
(estruturado: modalidade/base legal, contratado/valor/vigência (datas ou texto
"12 meses"), **gestor e fiscal técnico com cargos + portaria** — PNTP 9.1/9.3;
importável dos anexos "contrato" das licitações via `POST /painel/contratos/importar`),
Acesso à Informação (categorias PNTP), **Radar ATRICON**, Pesquisa de Satisfação.
**Site:** Homepage, **Páginas** (editor de blocos com pré-visualização, redefinir
alterações e modelos prontos como Carta de Serviços/SIC/Transparência), Conteúdo Institucional,
Biblioteca de Mídia, Aparência (**em abas**: Tema/Campanhas · Modelo & Layout ·
Cores · Identidade/logos · **Notícias** (modelo de card: `news_layout` =
mosaico/grade/lista/destaque) · Rodapé & Contato), Menus do Site,
Feriados, Selos, Links Rápidos, Categorias, Fotos da Cidade.
**Sistema:** Usuários, Papéis e Permissões (RBAC).

---

## 5. Páginas públicas

`/` (home), `/noticias[/:slug]`, `/vereadores[/:slug]`, `/mesa-diretora`,
`/comissoes`, `/atas[/:slug]`, `/pautas[/:slug]`, `/atividades-legislativas[/:slug]`,
`/publicacoes-oficiais[/:slug]`, `/transparencia[/:slug]` (deep-link modal),
`/licitacoes[/:slug]`, `/contratos[/:slug]`, `/diario-oficial`, `/agenda`, `/agenda.ics`, `/votacoes`, `/duodecimos`,
`/relatorios-fiscais` (RGF/RREO em árvore ano→período),
`/dados-abertos[/:dataset/:format]` (JSON/CSV), `/perguntas-frequentes`,
`/historia-da-camara`, `/sobre`, `/ouvidoria`, `/politica-de-privacidade`,
`/pesquisa-de-satisfacao`, `/mapa-do-site`, `/busca`, e o catch-all `/:slug`
(páginas dinâmicas de Acesso à Informação + Páginas publicadas).

Home: TopBar → Header → **HolidaysStrip** (faixa de feriados no topo do corpo) →
seções (Notícias, Acesso Rápido, E-SIC, Transparência, Vereadores, Legislativo
em Números, Diário, Instagram, Conheça Sumé, Certificações, Pesquisa) → Footer.

---

## 6. Funcionalidades transversais

- **Acessibilidade (e-MAG):** `AccessibilityBar` (FAB acima do assistente) — A−/A/
  A+, alto contraste, modo escuro, **VLibras**; skip-link; foco visível. O widget
  oficial do VLibras é inicializado no layout raiz (`resources/views/inertia_layout.edge`),
  então fica em **todo o site** (qualquer página, inclusive painel), independente
  do React; só não aparece em conteúdo embedado (`?embed=1`). A barra apenas
  mostra/esconde esse widget global (preferência persistida em `localStorage`).
- **Busca global:** lupa no header → `/busca` (ILIKE em 9 entidades).
- **Menus editáveis:** header e rodapé lidos de `site_settings` (JSON), com
  fallback nos defaults de `menus_controller.ts`. TopBar tem links próprios.
  No header, mantenha **A Câmara** para institucional/composição (História,
  Vereadores, Mesa Diretora, Comissões) e use **Matérias** para produção
  legislativa/documentos (Atividades Legislativas, Atas, Pautas, Publicações
  Oficiais).
- **Páginas com editor de blocos:** heading, texto (markdown-lite seguro),
  imagem, documentos, acordeão, destaque, botões, vídeo. `BlockRenderer.tsx`.
  O painel de páginas tem prévia renderizada, modelos prontos e botão para
  redefinir alterações antes de salvar.
- **Biblioteca de mídia:** upload central (imagens/PDFs), copiar URL.
- **Conteúdo institucional:** textos de Sobre/História editáveis (`InstitutionalContent`).
- **Feriados:** nacionais calculados (computus da Páscoa) + municipais/estaduais
  editáveis. `HolidaysStrip` no corpo da home.
- **Dados abertos:** `/dados-abertos` com export JSON/CSV (6 datasets).
- **Radar ATRICON:** matriz PNTP/ATRICON 2026 alinhada à planilha oficial
  (`Matriz de Critérios 2026 (Final)`: 83 critérios aplicáveis ao Legislativo
  Municipal), verificação automática REAL do conteúdo (`runAutoChecks`),
  **auditoria inteligente dos links da transparência** (`TransparencyAuditService`:
  URL válida, módulo interno preenchido/atualizado, HTTP em links externos),
  metas de frescor **quinzenais** (15 dias) para atas/pautas/votações,
  **mapa de conteúdo** módulo a módulo (frescor/total/última data + link),
  snapshots de evolução, painel "o que falta", precedência auto→manual com alerta
  de divergência, e evidência parcial automática por links da transparência quando
  o critério depende de sistema/portal externo. Logo ATRICON enviável.
  e-SIC/SIC e Ouvidoria contam como `externo` quando atendidos por sistema externo.
  O painel expõe `/painel/atricon/evidencias.json`, um pacote de evidências para
  leitura periódica por IA: matriz, pendências, módulos, links auditados, fluxo de
  verificação e separação entre módulos nativos, páginas PNTP, Transparência e
  sistemas externos.
- **Convenção PNTP:** e-SIC e Ouvidoria vivem em rotas/canais próprios (`/esic` e
  `/ouvidoria`); folha/remuneração permanece como link externo em Transparência;
  Ordem Cronológica (`/ocp`), Diárias (`/diarias`) e Carta de Serviços
  (`/carta-servicos`) são páginas dinâmicas de Acesso à Informação.
- **Modal de links da transparência:** `/transparencia/:slug` (deep-link) abre o
  conteúdo configurado; links internos escondem header/rodapé (`?embed=1`).
- **SEO:** `SeoController` (sitemap.xml, robots.txt), `SeoHead`.
- **Campanhas/temas/layout:** ver §3.

---

## 7. Conformidade legal — status (LAI / LC 131 / e-MAG / PNTP / LGPD)

✅ feito · ⚠️ parcial/ajustar · ❌ falta · 💡 recomendado

- ✅ Transparência ativa (estrutura, cargos, contato, FAQ, legislação) — seções +
  Acesso à Informação + Institucional.
- ✅ Acessibilidade e-MAG + VLibras; ✅ LGPD (Política de Privacidade completa);
  ✅ Dados Abertos (JSON/CSV, licença CC BY 4.0 e dicionário de campos por dataset).
- ✅ Licitações/contratos nativos; ✅ **Duodécimos** nativo; ✅ **RGF/RREO** nativo
  (módulo Relatórios Fiscais, ano→período). ⚠️ Despesas, folha,
  diárias, balancetes e **remuneração individualizada**: em parte **externos**
  (Portal da Transparência contratado) via Links da Transparência; parte pode ser
  nativa (o cliente decide caso a caso). Garantir que os links externos existam/
  estejam visíveis.
- ✅ SIC/e-SIC e Ouvidoria: **sistema externo** (links) — conta como atendido.
  ⚠️ Exibir explicitamente "autoridade de monitoramento + tel/e-mail do SIC".
- ✅ Radar ATRICON nativo com matriz PNTP 2026 alinhada aos arquivos oficiais
  enviados (83 critérios aplicáveis ao Legislativo; e-SIC/SIC e Ouvidoria como
  `externo` quando atendidos por sistema externo).

---

## 8. O que falta / roadmap

**Conformidade (prioridade alta)**
- [x] Alinhar `atricon_matrix.ts` e `database/pntp2026_criteria.json` à **cartilha
      PNTP 2026** (planilha oficial + erratas/notas enviadas pelo cliente).
- [x] `/dados-abertos`: declarar licença CC BY 4.0 + dicionário de campos.
- [ ] Bloco/página do **SIC** (autoridade de monitoramento + contato) e checar
      links externos de despesas/folha/diárias/remuneração.

**Funcionalidades**
- [x] **Agenda/calendário de sessões** (página `/agenda` + export ICS em `/agenda.ics`).
- [ ] **Transmissão ao vivo** das sessões (campo YouTube na sessão → banner "AO
      VIVO" + vídeo na ata). Integração com o **sistema de votação próprio** via
      **API** (a especificar).
- [x] **Linha do tempo de tramitação** das matérias: estrutura manual pronta no
      painel e renderização pública em `/atividades-legislativas/:slug`, com campos
      `voting_system_id`/`voting_system_url` preparados para conciliação externa.
- [ ] **Integração real via API do sistema de votação** para sincronizar sessões,
      matérias, votações, tramitação e transmissão ao vivo quando o contrato da API
      for definido.
- [x] **Feed do Instagram** na seção "Siga-nos": feed ao vivo via scraper público
      (RapidAPI, **sem senha/sessionid** da câmara). Provedor primário =
      `instagram-scraper-stable-api` (`get_ig_user_posts.php`); fallback =
      `instagram-public-bulk-scraper`. `InstagramFeedService` baixa as miniaturas
      para `public/uploads/instagram-feed/` (a URL do CDN expira) e cacheia em
      `instagram_settings` (`feed_cache`/`feed_cached_at`). A home usa o cache e
      dispara refresh em 2º plano quando passa de ~6h. Atualização manual no painel
      (Notícias → Instagram → "Atualizar feed agora") ou via `node ace instagram:feed`.
- [x] **Galeria de Vídeos (Reels)**: seção `reels` na home (entra nos modelos de
      site, após `instagram`) + página pública **`/videos`**. Usa
      `get_ig_user_reels.php` (o conteúdo vem em `node.media`, **sem caption/data**;
      traz `play_count`/`code`/thumbnail). Capas baixadas para
      `public/uploads/instagram-reels/`, cache em `reels_cache`/`reels_cached_at`.
      Componente `ReelsGallery` (grade 9:16 + **lightbox com embed oficial** do
      Instagram via `embed.js`). Mesmo refresh do feed (botão + `instagram:feed`).
      Para o item de menu, adicionar `/videos` em Menus do Site.
- [ ] **Avisos de licitação** (definir formato com o cliente: mural de abertas /
      tipo de conteúdo novo / aba).
- [ ] **QR Code** em páginas de detalhe (publicações, atas, vereador, transparência).

**Qualidade**
- [x] Container padrão único (1480px + padding responsivo de 24px a 48px), conteúdo alinhado ao breadcrumb em todas
      as páginas, contraste das tags douradas corrigido, filtros com altura uniforme
      e responsivos (empilham < md), gráfico do Legislativo com área 3D/4D + cards
      numéricos com hierarquia.
- [ ] Passada dedicada de **responsividade/UX** ("site bem preenchido", todas as
      telas) e de acessibilidade.
- [ ] Rate limiting no login; bloquear/sanear upload de SVG; cache de
      `siteSettings`; pipeline de otimização de imagem (sharp) nos uploads.
- [ ] Primeiros testes automatizados (Japa) dos fluxos críticos.

---

## 9. Plugins WordPress de origem (porte → nativo)

Plugins ativos no site de Sumé e equivalente nativo:
- `camara-filters` → filtros das listagens ✅ · `camara-sitemap` → `/mapa-do-site` ✅
- `portal-transparencia` → Transparência ✅ · `pntp-legislativo` → Radar ATRICON ✅
- `diario-oficial-sync` → Diário Oficial ✅ (visual do plugin) · `links-rapidos` ✅
- `pesquisa-satisfacao` ✅ · `automacao-legislativa-ai` / `noticias-instagram` →
  Automação Instagram ✅ · `pdf-popup-viewer` → LinkModal ✅
- `pojo-accessibility` + `vlibras-widget` → AccessibilityBar + VLibras ✅
- `ajax-search-pro` → Busca global ✅ · `ht-qrcode-generator` → QR (💡 pendente)
- `forminator` → formulários (ouvidoria externa) · `wpdatatables` → tabelas

Fontes de referência em `.acervo/plugins/`.

---

## 10. Convenções de trabalho (importante)

- **Rotas novas:** registrar ANTES do catch-all `/:slug` e checar
  `start/legacy_redirects.ts` (redirects 301 do WP têm precedência e já causaram
  "Duplicate route" 2×: `/transparencia/:slug`, `/mapa-do-site`, `/duodecimos`).
  Adicionar o slug à regex de reservados do catch-all.
- **Seeders idempotentes:** nunca `delete()`+recria no boot (o `quick_links_seeder`
  apagava edições a cada deploy — corrigido para semear só se vazio). Migrations de
  dados: aplicar só se ausente/igual ao default.
- **Tokens sempre** (dark-safe). **UI kit** no painel. **SectionHeading/PageHero**
  no público. Máximo 1–2 efeitos por elemento (a "dieta de efeitos" removeu
  shine/glow/mesh/ken-burns).
- **Multi-autoria** de atividades legislativas já vincula matérias ao perfil do
  vereador — não quebrar.
- **Typecheck antes de commitar:** `npm run typecheck`. Commits em PT-BR,
  co-autoria Codex. `git config` local: Luiz Miguel <luizmiguel.dev@gmail.com>.
- **Pós-deploy:** rodar `node ace migration:run` para as tabelas novas (Páginas,
 Mídia, ATRICON snapshots, open_mode, slug transparência, Duodécimos, cores Sumé,
 **Contratos**, **Relatórios Fiscais**, origem das Atividades Legislativas e campos
 de integração com sistema de votação). O `startup.sh` já roda `migration:run --force` no boot.
- **Migração WP — atividades + autoria:** as Atividades Legislativas e a **autoria
 dos vereadores** vêm do CPT `a-legislativa` + relação JetEngine `jet_rel_21`
 (VEREADOR>>ATIVIDADE). Para um backup novo: extrair o `database.sql` do zip e rodar
 `node scripts/extract_wp_activities.mjs <database.sql>` → gera
 `database/wp_activities.json` (atividades + autores por nome/slug). O comando
 `wp:migrate` tem a seção `importActivitiesWithAuthors` (fonte ÚNICA de
 `legislative_activities`: limpa + reimporta + sincroniza o pivô
 `legislative_activity_authors`, casando autor↔vereador por slug/nome). O import
 também classifica `origin` (`executivo`, `legislativo`, `nao_informado`) por
 autoria/texto para separar Projetos de Lei do Executivo e do Legislativo no site e
 no painel. O branch legislativo do `importMaterias` foi desativado para não duplicar.
- **Migração WP — registros PNTP + arquivos:** o plugin `portal-transparencia`
 mantém 4 tabelas (`pntp_registros`, `pntp_anexos`, `pntp_declaracoes`, `pntp_secoes`).
 `node scripts/extract_wp_pntp.mjs <database.sql>` gera `database/wp_pntp.json`
 (98 registros, 27 seções, anexos com a URL do PDF no site ao vivo). O comando
 `wp:pntp` (serviço `wp_pntp_importer`) cria as categorias por **slug**, faz
 upsert por (slug+título+ano) sem apagar registros manuais e **baixa os PDFs**
 do site antigo para `public/uploads/acesso-informacao/wp/` (fallback p/ link
 remoto se o download falhar). Roda 1× no boot via marcador
 `.pntp-imported-v1` (ou `FORCE_PNTP_IMPORT=true`). ⚠️ As páginas dinâmicas de
 Acesso à Informação filtram por **slug** (`information_records.category` = slug,
 não o nome) — o import antigo do `wp:migrate` (por nome) foi desativado.
- **Migração WP — Diário Oficial / GET Public:** o plugin `diario-oficial-sync`
 sincronizava a tabela GET `MATERIA` para `<prefix>dos_materias` e renderizava
 via shortcode `[diario_oficial]`. Para backup novo: extrair `database.sql` do zip
 e rodar `node scripts/extract_wp_diario.mjs <database.sql>` → gera
 `database/wp_diario_oficial.json` (somente dados públicos; credenciais `dos_*`
 não são exportadas). O comando `node ace wp:diario` importa para
 `official_gazette_entries` por `edition_number = materia_codigo`, usando
 `https://getpublic.inf.br/api/document/<codigo>/pdf` como `file_url` para o modal
 público do Diário Oficial.
- **Migração WP — Links Rápidos:** o plugin `links-rapidos` mantém
 `<prefix>lr_links`/`<prefix>lr_secoes`. Para backup novo, rodar
 `node scripts/extract_wp_quick_links.mjs <database.sql>` → gera
 `database/wp_quick_links.json`. O `wp:migrate` prefere esse JSON quando ele existe
 e importa apenas `secao_id = 1` como atalhos da home; `secao_id = 2` é Acesso à
 Informação/PNTP e fica nos módulos próprios.

---

_Última atualização: jun/2026. Atualize este arquivo a cada novo módulo._
