#!/bin/sh
set -e

echo "=== Running database migrations ==="
node ace migration:run --force || echo "Migration warnings (non-fatal)"

echo "=== Running database seeds ==="
node ace db:seed || true

# Bootstrap completo do acervo WordPress (idempotente — só roda o que falta).
# RODA EM 2º PLANO para o servidor HTTP subir imediatamente após migrations+seed.
# O import é pesado (download de imagens/PDFs + getpublic:sync chama API externa);
# se rodasse de forma síncrona ANTES do servidor, qualquer lentidão/indisponibilidade
# externa travava o boot inteiro (/health 503/504 → deploy exigia restart manual).
# 1ª implantação: ~10–15 min em 2º plano. Pular: SKIP_CONTENT_BOOTSTRAP=true.
# Reimportar tudo: FORCE_CONTENT_BOOTSTRAP=true
if [ "$SKIP_CONTENT_BOOTSTRAP" != "true" ]; then
  echo "=== Content bootstrap (WordPress acervo) — em 2º plano ==="
  ( sh /app/scripts/wp_import.sh || echo "Content bootstrap had errors (non-fatal)" ) &
else
  echo "=== Content bootstrap skipped (SKIP_CONTENT_BOOTSTRAP=true) ==="
fi

echo "=== Starting server ==="
exec node bin/server.js
