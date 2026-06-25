#!/bin/sh
set -e

echo "=== Running database migrations ==="
node ace migration:run --force || echo "Migration warnings (non-fatal)"

echo "=== Running database seeds ==="
node ace db:seed || true

# Bootstrap completo do acervo WordPress (idempotente — só roda o que falta).
# 1ª implantação: ~10–15 min (download de imagens + PDFs). Deploys seguintes: segundos.
# Pular: SKIP_CONTENT_BOOTSTRAP=true
# Reimportar tudo: FORCE_CONTENT_BOOTSTRAP=true
if [ "$SKIP_CONTENT_BOOTSTRAP" != "true" ]; then
  echo "=== Content bootstrap (WordPress acervo) ==="
  sh /app/scripts/wp_import.sh || echo "Content bootstrap had errors (non-fatal)"
else
  echo "=== Content bootstrap skipped (SKIP_CONTENT_BOOTSTRAP=true) ==="
fi

echo "=== Starting server ==="
exec node bin/server.js
