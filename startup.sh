#!/bin/sh
set -e

echo "=== Running database migrations ==="
node ace migration:run --force || echo "Migration warnings (non-fatal)"

echo "=== Running database seeds ==="
node ace db:seed || true

# Run WordPress migration only once
MARKER="/app/public/uploads/.wp-migrated"
if [ "$FORCE_WP_MIGRATE" = "true" ] || [ ! -f "$MARKER" ]; then
  echo "=== Running WordPress data migration ==="
  [ "$FORCE_WP_MIGRATE" = "true" ] && echo "(Forced via FORCE_WP_MIGRATE env)"
  node ace wp:migrate --force && touch "$MARKER" || echo "WP migration had errors (non-fatal)"
else
  echo "=== WordPress migration already done (skipping) ==="
fi

# Convert images to progressive JPEG (loads blurry-first instead of top-to-bottom)
OPT_MARKER="/app/public/uploads/.images-progressive"
if [ ! -f "$OPT_MARKER" ]; then
  echo "=== Converting images to progressive JPEG ==="
  find /app/public/uploads/wp-migration -type f \( -name "*.jpg" -o -name "*.jpeg" \) \
    -exec jpegoptim --strip-all --max=80 --all-progressive {} \; 2>/dev/null || true
  find /app/public/uploads/wp-migration -type f -name "*.png" \
    -exec optipng -o2 -quiet {} \; 2>/dev/null || true
  touch "$OPT_MARKER"
  echo "=== Images optimized ==="
fi

echo "=== Starting server ==="
exec node bin/server.js
