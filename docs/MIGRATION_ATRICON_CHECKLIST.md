# WordPress Migration + ATRICON PNTP 2025 - Câmara de Sumé

## Migração WordPress → AdonisJS

### Arquivos Criados
| Arquivo | Descrição |
|---------|-----------|
| `database/wordpress_migration.sql` | SQL com 686 INSERTs para popular o banco |
| `commands/wp_migrate.ts` | Comando Ace: `node ace wp:migrate` |
| `app/controllers/public/privacy_policy_controller.ts` | Controller da política de privacidade |
| `inertia/pages/public/privacy-policy/index.tsx` | Página LGPD completa |

### Dados Migrados (686 registros)
| Tabela | Qtd | Origem WP (post_type) |
|--------|-----|----------------------|
| `councilors` | 11 | `vereador` |
| `legislative_activities` | 340 | `a-legislativa` |
| `official_publications` | 24 | `publicacoes` |
| `plenary_sessions` | 8 | `atas` |
| `faq_items` | 20 | `perguntas-frequentes` |
| `information_records` | 59 | verbas, estagiários, terceirizados, rgf, etc. |
| `news` | 200 | `post` (200 mais recentes de 1.022) |
| `quick_links` | 24 | mapeamento manual dos acesso-rapido |

### Como Executar
```bash
# No servidor (após deploy)
node ace wp:migrate

# Ou diretamente via psql
psql -U usuario -d banco -f database/wordpress_migration.sql
```

### Rotas Atualizadas
- Adicionada `/politica-de-privacidade` (rota explícita)
- Atualizada regex do catch-all para excluir a nova rota

---

## ATRICON PNTP 2025 - Compliance Check

### Matriz: 71 comuns + 11 legislativos = 82 critérios

### Critérios Específicos do Legislativo (Seção 20)

| # | Critério | Class. | Status | Observação |
|---|----------|--------|--------|------------|
| 20.1 | Composição com biografia | Obrig. | ✅ | `/vereadores` - foto, partido, bio |
| 20.2 | Leis e atos infralegais | Obrig. | ✅ | `/publicacoes-oficiais` + `/atividades-legislativa` |
| 20.3 | Projetos de lei + tramitação | Obrig. | ✅ | `/atividades-legislativa` com ementa, status, autor, PDF |
| 20.4 | Pauta sessões plenário | Obrig. | ✅ | `/pautas` |
| 20.5 | Pauta comissões | Obrig. | ✅ | `/pautas` serve pautas de todas as sessões |
| 20.6 | Atas com presença | Obrig. | ✅ | `/atas` com download PDF |
| 20.7 | Votações nominais | Recom. | ✅* | *Votações unânimes dispensam lista (art. cartilha) |
| 20.8 | Apreciação contas Executivo | Obrig. | ✅ | `/apreciacao` + `/parecer-contas` (info_records migrados) |
| 20.9 | Transmissão sessões | Recom. | ⚠️ | Campo videoUrl existe; precisa link YouTube visível |
| 20.10 | Cotas/verba indenizatória | Recom. | ✅ | `/verbas` (info_records) |
| 20.11 | Atividades por parlamentar | Recom. | ⚠️ | Dados existem mas falta view por vereador |

### Critérios Comuns Principais

| Dimensão | Peso | Status | Rotas |
|----------|------|--------|-------|
| Info Prioritárias | 2 | ✅ | Site próprio + portal transparência |
| Info Institucionais | 2 | ✅ | Estrutura org, FAQ, contatos, redes sociais |
| Receita | 4 | 🔗 | Link p/ portal externo em `/transparencia` |
| Despesa | 4 | 🔗 | Link p/ portal externo em `/transparencia` |
| Convênios | 1 | ✅ | `/acordos`, `/transferencias-recebidas`, `/transferencias-realizadas` |
| RH | 3 | ✅ | `/estagiarios`, `/terceirizados`, folha via transparência |
| Diárias | 1 | 🔗 | Link em `/transparencia` |
| Licitações | 3 | ✅ | `/licitacoes` |
| Contratos | 3 | 🔗 | Link em `/transparencia` |
| Obras | 2 | ✅ | `/obras` (info_records) |
| Planejamento | 4 | ✅ | `/ppa`, `/ldo`, `/loa` via `/transparencia` |
| SIC | 2 | 🔗 | Link externo (e-SIC) |
| Acessibilidade | 1 | ❌ | **PENDENTE** |
| Ouvidoria | 1 | 🔗 | Link externo |
| LGPD | 1 | ✅ | `/politica-de-privacidade` CRIADA |

### Itens de Verificação (peso na nota de cada critério)
- **Disponibilidade** (30%): ✅ Dados no portal
- **Atualidade** (30%): ⚠️ Depende de atualização constante dos dados
- **Série Histórica** (20%): ✅ Dados de 3+ anos migrados
- **Gravação Relatórios** (10%): ❌ **PENDENTE** - Export CSV
- **Filtro de Pesquisa** (10%): ✅ Filtros nas listagens

---

## Pendências Restantes (por prioridade)

### Alta Prioridade (impacto na nota)
1. **Export CSV/editável** nas listagens - vale 10% de cada critério
2. **Acessibilidade** (peso 1, mas obrigatório):
   - Alto contraste
   - Redimensionar texto
   - Mapa do site
   - Breadcrumbs
3. **Link YouTube** visível nas atas/sessões (critério 20.9)

### Média Prioridade
4. **View atividades por parlamentar** (critério 20.11)
5. **Glossário** (26 termos no WP, pode virar página estática)
6. **Radar da Transparência** - botão/widget no portal (critério 2.9)

### Já Resolvido
- ✅ Política de Privacidade (LGPD)
- ✅ Apreciação de Contas do Executivo
- ✅ Parecer Contas (migrados como information_records)
- ✅ Todas as 16 categorias de acesso à informação
- ✅ 686 registros migrados do WordPress
