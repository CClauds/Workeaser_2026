# Workeaser API — Dockerfile multi-stage para staging/produção
# Build: cd src/workeaser-api/workeaser-management-api-main && docker build -t workeaser-api -f ../../../delivery_workeaser_scaffolding/docker/Dockerfile.workeaser-api .

# ===== Stage 1: dependencies =====
FROM node:22-bullseye-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --omit=dev && \
    cp -R node_modules /tmp/prod_node_modules && \
    npm ci --no-audit --no-fund

# ===== Stage 2: build =====
FROM node:22-bullseye-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== Stage 3: runtime =====
FROM node:22-bullseye-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Apenas usuário não-root para segurança
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app

# Tini para PID 1 saudável (signal handling)
RUN apt-get update && apt-get install -y --no-install-recommends tini wget && rm -rf /var/lib/apt/lists/*

COPY --from=deps /tmp/prod_node_modules ./node_modules
COPY --from=build /app/build ./
COPY --from=build /app/package.json ./
COPY --from=build /app/ace-manifest.json ./

# Garantir que pastas de upload local existam (caso drive=local)
RUN mkdir -p /app/tmp /app/uploads && chown -R app:app /app

USER app
EXPOSE 3333

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3333/health/db || exit 1
