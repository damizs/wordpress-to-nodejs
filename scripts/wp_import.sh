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

sh "$(dirname "$0")/optimize_images.sh"
