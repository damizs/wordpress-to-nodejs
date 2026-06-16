#!/bin/sh
# Pipeline completo de conteudo/config para producao (Coolify one-off).
# Uso: sh /app/scripts/bootstrap_production.sh
set -e

echo "=== 1/4 WordPress migration (acervo completo) ==="
FORCE_WP_MIGRATE=true sh /app/scripts/wp_import.sh

echo "=== 2/4 Legislative activities + authorship ==="
FORCE_ACTIVITIES_IMPORT=true node ace wp:activities

echo "=== 3/4 PNTP records + PDF download ==="
FORCE_PNTP_IMPORT=true node ace wp:pntp

echo "=== 4/4 Portal bootstrap (links externos, E-SIC, ATRICON) ==="
FORCE_PORTAL_BOOTSTRAP=true node ace portal:bootstrap

echo "=== Bootstrap de producao concluido ==="
