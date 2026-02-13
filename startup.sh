#!/bin/sh
set -e

echo "=== Running database migrations ==="
node ace migration:run --force || echo "Migration warnings (non-fatal)"

echo "=== Running database seeds ==="
node ace db:seed || true

# Run WordPress migration only once (check marker file in persistent volume)
MARKER="/app/public/uploads/.wp-migrated"
if [ "$FORCE_WP_MIGRATE" = "true" ] || [ ! -f "$MARKER" ]; then
  echo "=== Running WordPress data migration ==="
  [ "$FORCE_WP_MIGRATE" = "true" ] && echo "(Forced via FORCE_WP_MIGRATE env)"
  node ace wp:migrate --force && touch "$MARKER" || echo "WP migration had errors (non-fatal)"
else
  echo "=== WordPress migration already done (skipping) ==="
fi

# Optimize images in background (progressive JPEG + strip metadata)
OPT_MARKER="/app/public/uploads/.images-optimized-v2"
if [ ! -f "$OPT_MARKER" ]; then
  echo "=== Optimizing images (background) ==="
  (
    sleep 5
    # Convert to progressive JPEG + strip metadata + compress
    find /app/public/uploads/wp-migration -type f \( -name "*.jpg" -o -name "*.jpeg" \) \
      -exec jpegoptim --strip-all --all-progressive --max=80 -q {} \; 2>/dev/null || true
    find /app/public/uploads/wp-migration -type f -name "*.png" \
      -exec optipng -o2 -quiet {} \; 2>/dev/null || true
    touch "$OPT_MARKER"
    echo "=== Images optimized (progressive) ==="
  ) &
fi

echo "=== Starting server ==="
exec node bin/server.js
