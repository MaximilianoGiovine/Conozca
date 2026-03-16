# API - Conozca

API REST del proyecto Conozca construida con NestJS.

## 🚀 Puerto

**4000** (configurable vía variable de entorno `PORT`)

## 📦 Stack Tecnológico

- **Framework**: NestJS 11
- **ORM**: Prisma 7 con driver adapter `@prisma/adapter-pg`
- **Base de datos**: PostgreSQL 16
- **Lenguaje**: TypeScript 5

## 🏗️ Estructura

```
src/
├── main.ts              # Entry point de la aplicación
├── app.module.ts        # Módulo principal
├── app.controller.ts    # Controller de ejemplo
├── app.service.ts       # Service de ejemplo (con query Prisma)
└── prisma.service.ts    # Servicio Prisma configurado
```

## 🔧 Prisma Configuration

Este proyecto usa **Prisma 7** con driver adapters. La configuración está en `prisma.service.ts`:

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

constructor() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  super({ adapter });
}
```

**Nota importante**: El schema de Prisma y las migraciones están en `packages/database`, no en este directorio.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con hot-reload
pnpm dev

# Compilar
pnpm build

# Producción
pnpm start:prod

# Linting
pnpm lint

# Tests
pnpm test           # Unit tests
pnpm test:e2e       # End-to-end tests
pnpm test:cov       # Coverage
```

## 🌐 Endpoints

### `GET /`
Endpoint de health check que retorna el número de usuarios en la base de datos.

**Respuesta:**
```
Conexión exitosa. Actualmente hay N usuarios registrados en Conozca.
```

## 🔐 Variables de Entorno

Las variables de entorno se leen desde `packages/database/.env`:

- `DATABASE_URL`: Connection string de PostgreSQL
- `PORT`: Puerto del servidor (opcional, por defecto 4000)

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📝 Agregar Nuevos Endpoints

1. Crear un módulo: `nest g module nombre`
2. Crear un controller: `nest g controller nombre`
3. Crear un service: `nest g service nombre`
4. Inyectar `PrismaService` en el service para acceder a la BD

## 🤝 Desarrollo

Asegúrate de que PostgreSQL esté corriendo antes de iniciar:

```bash
# Desde la raíz del monorepo
docker-compose up -d
```

Luego inicia el dev server:

```bash
pnpm dev
```
