# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node ace build --ignore-ts-errors

# ---- Production Stage ----
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

WORKDIR /app

COPY --from=builder /app/build/package.json /app/build/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3333/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
