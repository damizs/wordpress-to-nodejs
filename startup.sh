#!/bin/sh
set -e

echo "=== Running database migrations ==="
node ace migration:run --force || echo "Migration warnings (non-fatal)"

echo "=== Running database seeds ==="
node ace db:seed || true

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
