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

# Install runtime tools: curl for asset downloads, ImageMagick/jpegoptim/optipng/libwebp for media,
# postgresql-client for pg_dump backups and rclone for R2/Drive/Dropbox sync.
RUN apk add --no-cache curl imagemagick jpegoptim optipng libwebp-tools postgresql-client rclone

# Ensure uploads directory exists for volume mount
RUN mkdir -p /app/public/uploads

# Copy startup + one-off scripts
COPY startup.sh /app/startup.sh
COPY scripts/ /app/scripts/
RUN chmod +x /app/startup.sh /app/scripts/*.sh

EXPOSE 3333

# Healthcheck leve: NÃO toca o banco (/health é interceptado no firewall middleware
# antes de qualquer query). Como o import do acervo roda em 2º plano, o servidor passa
# a escutar em segundos e o 1º /health OK já marca "healthy".
# start-period=900s (15 min) tolera o BOOT FRIO da 1ª implantação: migrations + seed
# rodam SÍNCRONOS antes do servidor escutar (timeout até 300s+180s em startup.sh) e a
# VPS pode ser pequena. Durante o start-period o Docker NÃO marca "unhealthy" nem conta
# retries, então o gate de saúde do Coolify não reprova um primeiro deploy lento.
# Disponibilidade em 1º lugar: num rolling update o container VELHO continua servindo
# até o NOVO ficar healthy — um start-period generoso só ajuda a NÃO cair. Em deploys
# seguintes (marcadores já existem) o boot é de segundos e o healthy vem cedo.
HEALTHCHECK --interval=30s --timeout=10s --start-period=900s --retries=5 \
  CMD node -e "fetch('http://localhost:3333/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["/app/startup.sh"]
