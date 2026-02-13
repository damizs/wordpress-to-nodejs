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

# Optimize images in background
OPT_MARKER="/app/public/uploads/.images-optimized-v3"
if [ ! -f "$OPT_MARKER" ]; then
  echo "=== Optimizing images (background) ==="
  (
    sleep 5
    # Progressive JPEG + strip metadata + compress
    find /app/public/uploads/wp-migration -type f \( -name "*.jpg" -o -name "*.jpeg" \) \
      -exec jpegoptim --strip-all --all-progressive --max=80 -q {} \; 2>/dev/null || true
    find /app/public/uploads/wp-migration -type f -name "*.png" \
      -exec optipng -o2 -quiet {} \; 2>/dev/null || true

    # Generate WebP versions
    find /app/public/uploads/wp-migration -type f \( -name "*.jpg" -o -name "*.jpeg" \) | while read img; do
      webp="${img%.*}.webp"
      [ -f "$webp" ] || cwebp -q 75 -m 6 "$img" -o "$webp" 2>/dev/null || true
    done
    find /app/public/uploads/wp-migration -type f -name "*.png" | while read img; do
      webp="${img%.*}.webp"
      [ -f "$webp" ] || cwebp -q 80 -m 6 "$img" -o "$webp" 2>/dev/null || true
    done

    touch "$OPT_MARKER"
    echo "=== Images optimized (progressive + WebP) ==="
  ) &
fi

echo "=== Starting server ==="
exec node bin/server.js
