#!/bin/sh
# Força reimportação completa (Coolify one-off ou env temporária).
# Uso: FORCE_CONTENT_BOOTSTRAP=true sh /app/scripts/bootstrap_production.sh
set -e

export FORCE_CONTENT_BOOTSTRAP=true
sh /app/scripts/wp_import.sh

echo "=== Bootstrap de produção concluído ==="
