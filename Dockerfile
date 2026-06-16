# ---- Build Stage ----
# Cache buster: 2026-02-25-14:05
FROM node:20-alpine AS builder

WORKDIR /app
ENV NODE_ENV=development
# Vite + ApexCharts/TinyMCE no SSR exigem heap maior em VPS pequenas (evita exit 137/255 no build)
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node ace build

# ---- Production Stage ----
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

WORKDIR /app

COPY --from=builder /app/build/package.json /app/build/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./

# Install curl for asset downloads, ImageMagick for resizing, jpegoptim/optipng for compression, libwebp for WebP
RUN apk add --no-cache curl imagemagick jpegoptim optipng libwebp-tools

# Ensure uploads directory exists for volume mount
RUN mkdir -p /app/public/uploads

# Copy startup + one-off scripts
COPY startup.sh /app/startup.sh
COPY scripts/ /app/scripts/
RUN chmod +x /app/startup.sh /app/scripts/*.sh

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://localhost:3333/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["/app/startup.sh"]
