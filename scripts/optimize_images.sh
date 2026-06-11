#!/bin/sh
# Otimizacao de imagens importadas do WordPress (progressive JPEG + WebP).
# Idempotente via marker; rodar como one-off apos o wp_import.sh.
OPT_MARKER="/app/public/uploads/.images-optimized-v3"
if [ -f "$OPT_MARKER" ]; then
  echo "=== Images already optimized (marker found) ==="
  exit 0
fi

echo "=== Optimizing images ==="
find /app/public/uploads/wp-migration -type f \( -name "*.jpg" -o -name "*.jpeg" \) \
  -exec jpegoptim --strip-all --all-progressive --max=80 -q {} \; 2>/dev/null || true
find /app/public/uploads/wp-migration -type f -name "*.png" \
  -exec optipng -o2 -quiet {} \; 2>/dev/null || true

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
