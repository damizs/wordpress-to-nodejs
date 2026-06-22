#!/bin/sh
# Importacao one-off do acervo WordPress + otimizacao de imagens.
# Rodar manualmente (terminal do Coolify) na primeira implantacao da camara:
#   sh /app/scripts/wp_import.sh
set -e

MARKER="/app/public/uploads/.wp-migrated-v2"
if [ "$FORCE_WP_MIGRATE" = "true" ] || [ ! -f "$MARKER" ]; then
  echo "=== Running WordPress data migration ==="
  node ace wp:migrate --force && touch "$MARKER"
else
  echo "=== WordPress migration already done (marker found, use FORCE_WP_MIGRATE=true to redo) ==="
fi

# Registros PNTP (Acesso a Informacao) + DOWNLOAD dos PDFs do site antigo para
# o portal (localiza os arquivos; idempotente, baixa so o que falta).
echo "=== Importing PNTP records + downloading files ==="
node ace wp:pntp || echo "PNTP import had errors (non-fatal)"

echo "=== Importing official gazette entries ==="
node ace wp:diario || echo "Diario import had errors (non-fatal)"

echo "=== Importing WordPress quick links ==="
node ace wp:quick-links || echo "Quick links import had errors (non-fatal)"

echo "=== Portal bootstrap (links externos, E-SIC, menus, ATRICON) ==="
node ace portal:bootstrap || echo "Portal bootstrap had errors (non-fatal)"

echo "=== Importing full WordPress legacy posts/pages ==="
node ace wp:legacy-content || echo "Legacy content import had errors (non-fatal)"

sh "$(dirname "$0")/optimize_images.sh"
