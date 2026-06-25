#!/bin/sh
# Bootstrap idempotente do acervo WordPress + config do portal.
# Roda automaticamente no deploy via startup.sh (1ª implantação ~10–15 min).
# Marcadores persistentes em /app/public/uploads/.
#
# Reimportar tudo: FORCE_CONTENT_BOOTSTRAP=true no Coolify (one-off).
# Reimportar só uma etapa: FORCE_WP_MIGRATE, FORCE_ACTIVITIES_IMPORT,
# FORCE_PNTP_IMPORT, FORCE_DIARIO_IMPORT, FORCE_QUICK_LINKS_IMPORT,
# FORCE_PORTAL_BOOTSTRAP, FORCE_LEGACY_CONTENT_IMPORT, FORCE_IMAGE_OPTIMIZE.

UPLOADS="/app/public/uploads"
mkdir -p "$UPLOADS"

# Acumula etapas que falharam para decidir o marcador agregado no final.
FAILED_STEPS=""
mark_failed() {
  FAILED_STEPS="$FAILED_STEPS $1"
}

if [ "$FORCE_CONTENT_BOOTSTRAP" = "true" ]; then
  rm -f \
    "$UPLOADS/.wp-migrated-v2" \
    "$UPLOADS/.activities-imported-v5" \
    "$UPLOADS/.pntp-imported-v3" \
    "$UPLOADS/.diario-imported-v1" \
    "$UPLOADS/.quick-links-imported-v1" \
    "$UPLOADS/.portal-bootstrapped-v1" \
    "$UPLOADS/.legacy-content-imported-v1" \
    "$UPLOADS/.images-optimized-v3" \
    "$UPLOADS/.content-bootstrap-complete-v1"
fi

# ── 1. Migração principal (notícias, vereadores, licitações, sessões…) ──
WP_MARKER="$UPLOADS/.wp-migrated-v2"
if [ "$FORCE_WP_MIGRATE" = "true" ] || [ ! -f "$WP_MARKER" ]; then
  echo "=== [1/8] WordPress data migration (wp:migrate) ==="
  if node ace wp:migrate --force; then
    touch "$WP_MARKER"
  else
    echo "WP migration had errors (non-fatal)"
    mark_failed "wp:migrate"
  fi
else
  echo "=== [1/8] WordPress migration already done ==="
  echo "=== [1b/8] Atas/Pautas (seed se tabelas vazias) ==="
  node ace seed:atas-pautas || echo "Atas/pautas seed had errors (non-fatal)"
fi

# ── 2. Atividades legislativas + autoria (depende dos vereadores) ──
ACT_MARKER="$UPLOADS/.activities-imported-v5"
if [ "$FORCE_ACTIVITIES_IMPORT" = "true" ] || [ ! -f "$ACT_MARKER" ]; then
  echo "=== [2/8] Legislative activities + authorship ==="
  if node ace wp:activities; then
    touch "$ACT_MARKER"
  else
    echo "Activities import had errors (non-fatal)"
    mark_failed "wp:activities"
  fi
else
  echo "=== [2/8] Activities import already done ==="
fi

# ── 3. PNTP + download dos PDFs ──
PNTP_MARKER="$UPLOADS/.pntp-imported-v3"
if [ "$FORCE_PNTP_IMPORT" = "true" ] || [ ! -f "$PNTP_MARKER" ]; then
  echo "=== [3/8] PNTP records + PDF download ==="
  if node ace wp:pntp; then
    touch "$PNTP_MARKER"
  else
    echo "PNTP import had errors (non-fatal)"
    mark_failed "wp:pntp"
  fi
else
  echo "=== [3/8] PNTP import already done ==="
fi

# ── 4. Diário Oficial ──
DIARIO_MARKER="$UPLOADS/.diario-imported-v1"
if [ "$FORCE_DIARIO_IMPORT" = "true" ] || [ ! -f "$DIARIO_MARKER" ]; then
  echo "=== [4/8] Official gazette entries ==="
  if node ace wp:diario; then
    touch "$DIARIO_MARKER"
  else
    echo "Diario import had errors (non-fatal)"
    mark_failed "wp:diario"
  fi
else
  echo "=== [4/8] Diario import already done ==="
fi

# ── 5. Links rápidos ──
QUICK_LINKS_MARKER="$UPLOADS/.quick-links-imported-v1"
if [ "$FORCE_QUICK_LINKS_IMPORT" = "true" ] || [ ! -f "$QUICK_LINKS_MARKER" ]; then
  echo "=== [5/8] WordPress quick links ==="
  if node ace wp:quick-links; then
    touch "$QUICK_LINKS_MARKER"
  else
    echo "Quick links import had errors (non-fatal)"
    mark_failed "wp:quick-links"
  fi
else
  echo "=== [5/8] Quick links import already done ==="
fi

# ── 6. Bootstrap portal (E-SIC, transparência externa, menus, ATRICON) ──
BOOT_MARKER="$UPLOADS/.portal-bootstrapped-v1"
if [ "$FORCE_PORTAL_BOOTSTRAP" = "true" ] || [ ! -f "$BOOT_MARKER" ]; then
  echo "=== [6/8] Portal bootstrap (external links + config) ==="
  if node ace portal:bootstrap; then
    touch "$BOOT_MARKER"
  else
    echo "Portal bootstrap had errors (non-fatal)"
    mark_failed "portal:bootstrap"
  fi
else
  echo "=== [6/8] Portal bootstrap already done ==="
fi

# ── 7. Acervo completo (posts/páginas legados) ──
LEGACY_MARKER="$UPLOADS/.legacy-content-imported-v1"
if [ "$FORCE_LEGACY_CONTENT_IMPORT" = "true" ] || [ ! -f "$LEGACY_MARKER" ]; then
  echo "=== [7/8] WordPress legacy posts/pages ==="
  if node ace wp:legacy-content; then
    touch "$LEGACY_MARKER"
  else
    echo "Legacy content import had errors (non-fatal)"
    mark_failed "wp:legacy-content"
  fi
else
  echo "=== [7/8] Legacy content import already done ==="
fi

# ── 8. Otimização de imagens ──
echo "=== [8/8] Image optimization ==="
if sh "$(dirname "$0")/optimize_images.sh"; then
  :
else
  echo "Image optimization had errors (non-fatal)"
  mark_failed "optimize_images"
fi

# Marcador agregado: só "complete" se todos os passos essenciais retornaram 0.
rm -f "$UPLOADS/.content-bootstrap-partial"
if [ -z "$FAILED_STEPS" ]; then
  touch "$UPLOADS/.content-bootstrap-complete-v1"
  echo "=== Content bootstrap finished (all steps OK) ==="
else
  rm -f "$UPLOADS/.content-bootstrap-complete-v1"
  echo "Failed steps:$FAILED_STEPS" > "$UPLOADS/.content-bootstrap-partial"
  echo "=== Content bootstrap finished with FAILURES:$FAILED_STEPS ==="
  echo "    Marcador .content-bootstrap-partial gravado para o healthcheck/operador."
fi
