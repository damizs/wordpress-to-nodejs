#!/bin/sh
set -e

# Migrations rodam ANTES do servidor (integridade do schema), com duas proteções:
#  - TIMEOUT: nunca travar o boot indefinidamente se o banco ficar lento/indisponível.
#    A 1ª implantação cria as tabelas; deploys seguintes são no-op em segundos. Se o
#    timeout matar o processo, a conexão morre e o advisory lock é liberado sozinho.
#  - CONCORRÊNCIA (rolling / 2 containers): NÃO é preciso lock manual — o migrator do
#    Lucid já envolve a execução em pg_try_advisory_lock(1) no dialeto pg. Um 2º
#    container que rode migration:run ao mesmo tempo falha o lock e cai no "|| echo"
#    (non-fatal) sem corromper o schema; o container que segurou o lock aplica tudo.
#  Mantemos non-fatal de propósito: um erro de migration NÃO pode derrubar o site —
#  o servidor sobe e ao menos serve /health e o conteúdo já migrado.
echo "=== Running database migrations ==="
timeout "${MIGRATION_TIMEOUT:-300}" node ace migration:run --force \
  || echo "Migration warnings/timeout (non-fatal) — seguindo o boot para não derrubar o site"

echo "=== Running database seeds ==="
timeout "${SEED_TIMEOUT:-180}" node ace db:seed || true

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
