# Multi-stage Dockerfile para Conozca API
# Optimizado para producción con Node.js Alpine

# ===== Stage 1: Dependencies =====
FROM node:20-alpine AS deps

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# ===== Stage 2: Build =====
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Instalar todas las dependencias (incluidas dev para el build)
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/typescript-config ./packages/typescript-config
COPY turbo.json ./

# Generate Prisma Client
WORKDIR /app/packages/database
RUN pnpm exec prisma generate

# Build la aplicación
WORKDIR /app/apps/api
RUN pnpm build

# ===== Stage 3: Production =====
FROM node:20-alpine AS runner

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Copiar dependencias de producción desde deps stage
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps --chown=nestjs:nodejs /app/packages/database/node_modules ./packages/database/node_modules

# Copiar código compilado
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/database ./packages/database

# Copiar archivos necesarios
COPY --chown=nestjs:nodejs apps/api/package.json ./apps/api/
COPY --chown=nestjs:nodejs package.json pnpm-workspace.yaml ./

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no-root
USER nestjs

WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Comando de inicio
CMD ["node", "dist/main.js"]
