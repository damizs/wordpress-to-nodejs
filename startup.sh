#!/bin/sh
set -e

echo "=== Running database migrations ==="
node ace migration:run --force || echo "Migration warnings (non-fatal)"

echo "=== Running database seeds ==="
node ace db:seed || true

# Atividades legislativas + AUTORIA dos vereadores (leve, idempotente).
# Roda automaticamente UMA vez por versao do dataset: o marcador fica no volume
# de uploads (persistente). Para reimportar (ex.: backup novo do WP), suba o
# numero do marcador aqui ou rode com FORCE_ACTIVITIES_IMPORT=true.
ACT_MARKER="/app/public/uploads/.activities-imported-v5"
if [ "$FORCE_ACTIVITIES_IMPORT" = "true" ] || [ ! -f "$ACT_MARKER" ]; then
  echo "=== Importing legislative activities + authorship ==="
  if node ace wp:activities; then
    mkdir -p /app/public/uploads && touch "$ACT_MARKER"
  else
    echo "Activities import had errors (non-fatal)"
  fi
fi

# Registros PNTP (Acesso a Informacao). No BOOT roda SEM download (rapido, nao
# bloqueia healthcheck): cria as categorias/registros por slug e usa o link
# remoto do PDF. O DOWNLOAD dos PDFs para o portal acontece no one-off pesado
# (scripts/wp_import.sh) ou com FORCE_PNTP_IMPORT=true. Idempotente.
PNTP_MARKER="/app/public/uploads/.pntp-imported-v2"
if [ "$FORCE_PNTP_IMPORT" = "true" ] || [ ! -f "$PNTP_MARKER" ]; then
  echo "=== Importing PNTP information records (boot: sem download) ==="
  if [ "$FORCE_PNTP_IMPORT" = "true" ]; then
    node ace wp:pntp && mkdir -p /app/public/uploads && touch "$PNTP_MARKER" || echo "PNTP import had errors (non-fatal)"
  elif node ace wp:pntp --skip-download; then
    mkdir -p /app/public/uploads && touch "$PNTP_MARKER"
  else
    echo "PNTP import had errors (non-fatal)"
  fi
fi

# Diario Oficial sincronizado do WordPress/GET Public. Import leve e idempotente.
DIARIO_MARKER="/app/public/uploads/.diario-imported-v1"
if [ "$FORCE_DIARIO_IMPORT" = "true" ] || [ ! -f "$DIARIO_MARKER" ]; then
  echo "=== Importing official gazette entries ==="
  if node ace wp:diario; then
    mkdir -p /app/public/uploads && touch "$DIARIO_MARKER"
  else
    echo "Diario import had errors (non-fatal)"
  fi
fi

# Links rapidos da home vindos do plugin WordPress links-rapidos.
QUICK_LINKS_MARKER="/app/public/uploads/.quick-links-imported-v1"
if [ "$FORCE_QUICK_LINKS_IMPORT" = "true" ] || [ ! -f "$QUICK_LINKS_MARKER" ]; then
  echo "=== Importing WordPress quick links ==="
  if node ace wp:quick-links; then
    mkdir -p /app/public/uploads && touch "$QUICK_LINKS_MARKER"
  else
    echo "Quick links import had errors (non-fatal)"
  fi
fi

# Links externos de transparencia, E-SIC, ouvidoria, menus e ATRICON (idempotente).
BOOT_MARKER="/app/public/uploads/.portal-bootstrapped-v1"
if [ "$FORCE_PORTAL_BOOTSTRAP" = "true" ] || [ ! -f "$BOOT_MARKER" ]; then
  echo "=== Portal bootstrap (transparency links + external config) ==="
  if node ace portal:bootstrap; then
    mkdir -p /app/public/uploads && touch "$BOOT_MARKER"
  else
    echo "Portal bootstrap had errors (non-fatal)"
  fi
fi

# Import pesado NAO roda no boot (healthcheck). Para importar o acervo do
# WordPress na primeira implantacao, rode como comando one-off:
#   sh /app/scripts/wp_import.sh
# Ou force via env (uma subida unica com FORCE_WP_MIGRATE=true, depois remova):
if [ "$FORCE_WP_MIGRATE" = "true" ]; then
  echo "=== FORCE_WP_MIGRATE=true: running WordPress import before boot ==="
  sh /app/scripts/wp_import.sh || echo "WP migration had errors (non-fatal)"
fi

echo "=== Starting server ==="
exec node bin/server.js
