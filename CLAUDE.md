# CLAUDE.md — Portal da Câmara Municipal de Sumé

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
- **Campanhas sazonais:** Outubro Rosa, Novembro Azul, Setembro Amarelo, Maio
  Amarelo, Junho Vermelho, Abril Azul. `campaign_mode` = `auto|off|<chave>`.
  Recolore **apenas header, footer e botões** (`--gradient-hero/-navy`,
  `--primary`) — o resto mantém a paleta institucional. Banner dispensável.
- **`DynamicTheme.tsx`** aplica preset/custom/campanha/layout. **`DynamicFavicon`**
  ajusta o favicon.

**Convenções visuais:**
- Cabeçalho de seção: **sempre** `SectionHeading` (badge ACIMA do título — a badge
  vai num `<div>` próprio porque `.heading-accent` é `inline-block`). `tone`
  light/dark, `align` center/left.
- Página interna: `PageHero` + `Breadcrumb` + `<section className="py-10 lg:py-14"><div className="container">`.
  Conteúdo de leitura em `max-w-4xl mx-auto`; grades podem usar o container cheio.
- Painel: **UI kit** `inertia/components/admin/ui.tsx** (Button, Input, Select,
  Field, Card, Table, StatusBadge, ConfirmDelete, Pagination, EmptyState, Modal,
  Toolbar, PageHeader). Nunca reimplementar tabela/badge com cores soltas.
- Carrossel automático infinito: `InfiniteCarousel.tsx` (scroll-snap + rAF).
- Status com cor: `StatusBadge` (admin) / mapa único por entidade (público).

---

## 4. Módulos do painel (`/painel`)

Menu em `inertia/layouts/AdminLayout.tsx` (`navGroups`).

**Conteúdo:** Notícias (+ Automação Instagram via RapidAPI+IA), Publicações, FAQ.
**Legislativo:** Vereadores, Comissões, Legislaturas, Biênios, Sessões/Atas,
Atividades Legislativas (multi-autoria → perfil do vereador), Votações Nominais
(importação por HTML).
**Transparência:** Transparência (seções+links, link com `open_mode` nova-aba/
modal e `hide_chrome`), **Duodécimos**, Licitações (+ documentos), Acesso à
Informação (categorias PNTP), **Radar ATRICON**, Pesquisa de Satisfação.
**Site:** Homepage, **Páginas** (editor de blocos), Conteúdo Institucional,
Biblioteca de Mídia, Aparência (tema/cor/campanha/layout/logos), Menus do Site,
Feriados, Selos, Links Rápidos, Categorias, Fotos da Cidade.
**Sistema:** Usuários, Papéis e Permissões (RBAC).

---

## 5. Páginas públicas

`/` (home), `/noticias[/:slug]`, `/vereadores[/:slug]`, `/mesa-diretora`,
`/comissoes`, `/atas[/:slug]`, `/pautas[/:slug]`, `/atividades-legislativas[/:slug]`,
`/publicacoes-oficiais[/:slug]`, `/transparencia[/:slug]` (deep-link modal),
`/licitacoes[/:slug]`, `/diario-oficial`, `/votacoes`, `/duodecimos`,
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
  A+, alto contraste, modo escuro, **VLibras (carrega por padrão)**; skip-link;
  foco visível.
- **Busca global:** lupa no header → `/busca` (ILIKE em 9 entidades).
- **Menus editáveis:** header e rodapé lidos de `site_settings` (JSON), com
  fallback nos defaults de `menus_controller.ts`. TopBar tem links próprios.
- **Páginas com editor de blocos:** heading, texto (markdown-lite seguro),
  imagem, documentos, acordeão, destaque, botões, vídeo. `BlockRenderer.tsx`.
- **Biblioteca de mídia:** upload central (imagens/PDFs), copiar URL.
- **Conteúdo institucional:** textos de Sobre/História editáveis (`InstitutionalContent`).
- **Feriados:** nacionais calculados (computus da Páscoa) + municipais/estaduais
  editáveis. `HolidaysStrip` no corpo da home.
- **Dados abertos:** `/dados-abertos` com export JSON/CSV (6 datasets).
- **Radar ATRICON:** verificação automática REAL do conteúdo (`runAutoChecks`),
  **mapa de conteúdo** módulo a módulo (frescor/total/última data + link),
  snapshots de evolução, painel "o que falta", precedência auto→manual com alerta
  de divergência. Logo ATRICON enviável. Ouvidoria/e-SIC contam como `externo`.
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
  ✅ Dados Abertos (JSON/CSV) — ⚠️ falta declarar **licença aberta (CC-BY)** e
  documentar os campos.
- ✅ Licitações/contratos nativos; ✅ **Duodécimos** nativo. ⚠️ Despesas, folha,
  diárias, balancetes, RGF e **remuneração individualizada**: em parte **externos**
  (Portal da Transparência contratado) via Links da Transparência; parte pode ser
  nativa (o cliente decide caso a caso). Garantir que os links externos existam/
  estejam visíveis.
- ✅ SIC/e-SIC e Ouvidoria: **sistema externo** (links) — conta como atendido.
  ⚠️ Exibir explicitamente "autoridade de monitoramento + tel/e-mail do SIC".
- ✅ Radar ATRICON nativo. ⚠️ **Alinhar `app/helpers/atricon_matrix.ts` à cartilha
  PNTP 2026** (pesos/itens finais; ouvidoria/e-SIC como `externo`).

---

## 8. O que falta / roadmap

**Conformidade (prioridade alta)**
- [ ] Alinhar `atricon_matrix.ts` à **cartilha PNTP 2026** (PDF do cliente).
- [ ] `/dados-abertos`: declarar licença CC-BY + dicionário de campos.
- [ ] Bloco/página do **SIC** (autoridade de monitoramento + contato) e checar
      links externos de despesas/folha/diárias/remuneração.

**Funcionalidades**
- [ ] **Agenda/calendário de sessões** (página `/agenda` + export ICS).
- [ ] **Transmissão ao vivo** das sessões (campo YouTube na sessão → banner "AO
      VIVO" + vídeo na ata). Integração com o **sistema de votação próprio** via
      **API** (a especificar).
- [ ] **Linha do tempo de tramitação** das matérias (idealmente via API do
      sistema de votação).
- [ ] **Feed do Instagram** na seção "Siga-nos" (reaproveitar scraper RapidAPI já
      existente; precisa da chave no painel).
- [ ] **Avisos de licitação** (definir formato com o cliente: mural de abertas /
      tipo de conteúdo novo / aba).
- [ ] **QR Code** em páginas de detalhe (publicações, atas, vereador, transparência).

**Qualidade**
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
  co-autoria Claude. `git config` local: Luiz Miguel <luizmiguel.dev@gmail.com>.
- **Pós-deploy:** rodar `node ace migration:run` para as tabelas novas (Páginas,
  Mídia, ATRICON snapshots, open_mode, slug transparência, Duodécimos, cores Sumé).

---

_Última atualização: jun/2026. Atualize este arquivo a cada novo módulo._
