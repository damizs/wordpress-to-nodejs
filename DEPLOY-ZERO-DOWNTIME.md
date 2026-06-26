# Deploy zero-downtime — Câmara de Sumé

Objetivo: durante um deploy (Coolify/Traefik trocando o container), o portal
**não pode** cair em Bad Gateway (502/504).

Este documento tem duas partes:

1. **O que já foi implementado no repositório** (aplicado automaticamente, seguro):
   drain de shutdown, `stop_grace_period` e healthcheck como gate. Não muda
   roteamento — vale para o deploy atual (mesmo em modelo `recreate`).
2. **Zero-downtime REAL no Coolify** (opt-in do cliente): remover o bind de porta
   do host e habilitar Rolling Update. **Não** está aplicado no `docker-compose.yml`
   ativo — é uma decisão de infraestrutura, com passo-a-passo e rollback abaixo.

---

## Parte 1 — Implementado no repositório

### 1a. Shutdown gracioso com drain ("fail health then drain")

Quando o Docker manda `SIGTERM` no container velho (porque o novo já subiu e ficou
healthy, ou num restart), em vez de encerrar na hora nós:

1. **Marcamos** o processo como "em encerramento" (`markShuttingDown()`).
2. O `/health` passa a responder **503** (`#services/shutdown_state` →
   `app_firewall_middleware`). O proxy/healthcheck vê o container "unhealthy" e
   **para de rotear** novas requisições para ele.
3. **Aguardamos** a janela de **DRAIN** (`SHUTDOWN_DRAIN_MS`, default 6000ms), com
   o servidor HTTP ainda de pé servindo as requisições reais normalmente.
4. **Encerramos** com `app.terminate()`, que fecha o servidor HTTP (para de aceitar
   conexões e espera as em voo terminarem) e fecha o pool do Postgres.

O Docker só manda `SIGKILL` depois do `stop_grace_period` — configurado **maior**
que `DRAIN + query_timeout`, para o kill nunca cair no meio do drain.

### 1b. Healthcheck como gate do deploy

Há um `HEALTHCHECK` no `Dockerfile` e um bloco `healthcheck` espelhado no
`docker-compose.yml` (`GET /health` via `node fetch`, sem tocar o banco):

```
interval: 30s   timeout: 10s   retries: 5   start_period: 900s
```

O `start_period` de **900s (15 min)** é proposital: a 1ª implantação roda
`migration:run` + `db:seed` de forma **síncrona** antes do servidor escutar (o
import pesado do acervo vai em 2º plano), então um boot frio numa VPS pequena pode
demorar. Durante o `start_period` o Docker não marca "unhealthy" — isso evita que o
Coolify reprove um primeiro deploy lento. Em deploys seguintes (marcadores já
existem em `public/uploads/`) o boot é de segundos e o `/health` 200 vem cedo.

### Peças (arquivos)

| Arquivo | Papel |
|---------|-------|
| `app/services/shutdown_state.ts` | Singleton de processo: `markShuttingDown()` / `isShuttingDown()`. Sem `Date.now`/`Math.random`. |
| `bin/server.ts` | No `SIGTERM` (e `SIGINT` sob PM2): `markShuttingDown()` → `await sleep(SHUTDOWN_DRAIN_MS)` → `await app.terminate()`. |
| `app/middleware/app_firewall_middleware.ts` | `/health` responde **503** (`Connection: close`, `Retry-After: 15`) quando `isShuttingDown()`; fora disso mantém o early-return barato (sem tocar o banco) para `/health`, `/assets/`, `/uploads/`. |
| `docker-compose.yml` | `healthcheck` (gate) + `stop_grace_period: 45s` (> DRAIN 6s + `query_timeout` 25s). |
| `Dockerfile` | `HEALTHCHECK` espelhando o do compose. |
| `startup.sh` | `migration:run` e `db:seed` com `timeout` (nunca travam o boot); import do acervo em 2º plano. |

> O `start/routes.ts` (rota `GET /health` → `{status:'ok'}`) **não** foi tocado.
> O 503 é dado pelo middleware do *server stack*, que roda **antes** do roteamento.

### Configuração (variáveis)

| Variável | Default | Efeito |
|----------|---------|--------|
| `SHUTDOWN_DRAIN_MS` | `6000` | Tempo entre falhar o `/health` e o `app.terminate()`. Lido de `process.env` direto (não passa pelo schema de `start/env.ts`). |
| `MIGRATION_TIMEOUT` | `300` | Teto (s) do `migration:run` no boot (non-fatal se estourar). |
| `SEED_TIMEOUT` | `180` | Teto (s) do `db:seed` no boot (non-fatal). |

Regra de dimensionamento do grace period:

```
stop_grace_period  >  SHUTDOWN_DRAIN_MS + query_timeout
       45s         >        6s          +     25s   (= 31s)  OK
```

Se aumentar `SHUTDOWN_DRAIN_MS` ou `query_timeout` (`config/database.ts`), aumente
também o `stop_grace_period` no compose **e** o "kill timeout" do Coolify para
manter a folga. (Nota: o valor 45s foi mantido em vez de 30s justamente porque
30s < 31s do piso de dimensionamento — 30s arriscaria SIGKILL no meio do drain.)

### Por que isto evita 502/504

- **Sem drain (antes):** `SIGTERM` → `app.terminate()` imediato → o servidor fecha
  enquanto o proxy ainda tinha o container na rotação → requisições em voo e novas
  batem em socket fechado → **502/504**.
- **Com drain (agora):** o `/health` falha primeiro, o proxy tira o container da
  rotação, as requisições em voo terminam dentro da janela, e só então o processo
  encerra.

---

## Parte 2 — Zero-downtime REAL no Coolify (opt-in, NÃO aplicado)

> A Parte 1 melhora muito o shutdown, mas **sozinha não garante** zero-downtime se o
> Coolify recriar o container (stop antigo → start novo). A garantia real exige
> remover o bind de porta do host **e** ligar Rolling Update. Como isso depende da
> infra e não pode ser testado aqui, está documentado, não aplicado.

### Por que cai hoje (host port 3333 → recreate → 502/504)

O `docker-compose.yml` ativo publica a porta no host:

```yaml
    ports:
      - "3333:3333"
```

Uma porta do host é recurso **exclusivo**: o Docker não consegue subir o container
NOVO enquanto o VELHO ainda segura `0.0.0.0:3333` (erro *port is already
allocated*). Logo o Coolify é **obrigado** a parar o velho antes de subir o novo
(recreate) → existe um intervalo **sem backend** → Traefik responde 502 (no
available server) / 504 (timeout).

O bind no host é **desnecessário para o roteamento**: o Coolify+Traefik roteia para
o app pela rede externa `coolify`, batendo direto no IP do container na **porta do
container** (3333). A app já sobe com `HOST=0.0.0.0`, então o Traefik a alcança sem
o `publish`. Trocar `ports` por `expose` desbloqueia o Rolling Update.

### Passo-a-passo no painel do Coolify

1. **Confirmar como o domínio chega no app HOJE** (crítico — ver Riscos abaixo):
   - `node.camaradesume.pb.gov.br` já vai via Traefik/labels do Coolify.
   - `camaradesume.pb.gov.br`: confirmar se é servido VIA Coolify/Traefik (domínio
     cadastrado no recurso) e **não** por um Nginx externo apontando para
     `host:3333`. Se for `host:3333`, **NÃO** remova o `ports` ainda.
2. **Ports Exposes = 3333** (a porta do CONTAINER que o Traefik usa no
   `loadbalancer.server.port`).
3. **Ports Mappings (publish no host) = VAZIO** — equivale a remover o
   `ports: "3333:3333"` do compose.
4. **Habilitar "Rolling Update" / "Zero Downtime Deployment"** no recurso
   (Configuration → Build/Deploy). É isso que faz o Coolify subir o novo, esperar
   ficar healthy, trocar o tráfego e só ENTÃO derrubar o velho.
5. **Health Check como gate**: manter habilitado e com timeout/espera que tolere o
   boot frio (>= 900s, igual ao `start_period`).
6. **Kill timeout / graceful stop >= 45s**, casando com `stop_grace_period: 45s` e
   a janela `SHUTDOWN_DRAIN_MS`.
7. **Confirmar o app na rede `coolify`** e os domínios cadastrados, para o Coolify
   gerar as labels do Traefik e rotear pela rede (não pela porta do host).

> Plano B: se o recurso "Docker Compose" do Coolify só fizer `compose up -d`
> (recreate) em vez de um swap health-gated, avaliar converter para "Application"
> com build pack Dockerfile e ligar o Rolling Update nativo (mesma imagem, sem host
> port).

### Variante de compose pronta (zero-downtime)

Aplicar **apenas** quando os passos acima forem confirmados no painel. Diferença
para o ativo: troca `ports` por `expose` (mantém todo o resto — healthcheck,
`stop_grace_period`, redes, volume).

```yaml
networks:
  coolify:
    external: true

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=3333
      - APP_KEY=${APP_KEY}
      - SESSION_DRIVER=cookie
      - DB_HOST=${DB_HOST:-supabase-db-ldnnyd5fd64huxqtewhsybwo}
      - DB_PORT=${DB_PORT:-5432}
      - DB_USER=${DB_USER:-postgres}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE:-camara_sume}
      - TZ=America/Sao_Paulo
      - LOG_LEVEL=info
    # SEM publish no host: o Traefik roteia pela rede 'coolify' usando a porta do
    # CONTAINER (3333). Sem bind exclusivo de host, o Coolify pode subir o container
    # novo ao lado do velho (Rolling Update) sem 'port already allocated'.
    expose:
      - "3333"
    volumes:
      - uploads:/app/public/uploads
    networks:
      - default
      - coolify
    restart: unless-stopped
    healthcheck:
      test:
        ['CMD', 'node', '-e', "fetch('http://localhost:3333/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 900s
    stop_grace_period: 45s

volumes:
  uploads:
```

### Validação pós-deploy

- Durante o deploy, rodar em loop: `curl -sS -o /dev/null -w "%{http_code}\n"
  https://node.camaradesume.pb.gov.br/health` — deve manter **200** o tempo todo,
  **sem 502/504** na virada.
- Após subir: `GET /health` → 200; `/noticias`, `/vereadores`, `/atas` com
  listagem.
- Drain: ao parar um container, nos logs deve aparecer `SIGTERM` → janela de drain
  (~6s) → `terminate` ANTES do `SIGKILL` (dentro do `stop_grace_period` 45s). Teste
  num container de staging: `docker exec <c> sh -c "kill -TERM 1"` e observe o
  `/health` virar 503 e o processo sair ~6s depois.

### Rollback

1. **Pelo painel:** botão **Rollback** do Coolify para o deployment anterior que
   estava funcionando (anote o atual ANTES de mudar).
2. **Pelo compose:** reverter para a variante com host port + desligar Rolling
   Update:

   ```yaml
       ports:
         - "3333:3333"
   ```

   e fazer deploy `recreate`. (É a configuração atual do `docker-compose.yml`.)

### Riscos / perguntas a confirmar antes de aplicar a Parte 2

- **Como `camaradesume.pb.gov.br` chega no app hoje?** Se for um Nginx/proxy externo
  no host apontando para `127.0.0.1:3333`, **remover o `ports` quebra esse caminho**.
  Confirmar no host/Coolify antes.
- **Migrations backward-compatible (expand/contract)?** No rolling, o container NOVO
  roda `migration:run` enquanto o VELHO ainda serve código antigo contra o schema já
  migrado — uma migration destrutiva pode derrubar o velho durante a sobreposição.
  Concorrência entre containers já é segura (Lucid usa `pg_try_advisory_lock(1)`).
- **O Coolify desta instância faz swap health-gated** (novo healthy antes de derrubar
  o velho) **ou só `compose up -d`** (recreate)? Se for só recreate, ver Plano B.
- **Algo mais depende de `host:3333`** (monitoração externa, cron no host, scripts)?
  Mapear antes de remover o publish. O `HEALTHCHECK` do Docker NÃO depende — ele bate
  em `localhost` dentro do container.
