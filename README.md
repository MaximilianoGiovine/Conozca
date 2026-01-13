# Conozca Monorepo

Monorepo moderno para el proyecto **Conozca**, una revista digital con API REST, aplicaciones web y gestión de contenido.

## 🏗️ Estructura del Proyecto

```
conozca-monorepo/
├── apps/
│   ├── api/          # API REST con NestJS + Swagger
│   ├── web/          # Aplicación web principal (Next.js)
│   └── docs/         # Documentación (Next.js)
├── packages/
│   ├── database/     # Schema de Prisma y cliente compartido
│   ├── ui/           # Componentes UI compartidos
│   ├── eslint-config/    # Configuraciones de ESLint
│   └── typescript-config/ # Configuraciones de TypeScript
├── docker-compose.yml    # PostgreSQL + API + pgAdmin
└── API_DOCUMENTATION.md  # Documentación completa de API

## ✨ Características Principales

- 🔐 **Autenticación JWT** - Register, login, refresh tokens, password reset
- 📝 **Gestión de Artículos** - CRUD completo con estados y scheduling
- 🏷️ **Categorías y Autores** - Organización de contenido
- 🧩 **Sistema de Bloques** - Editor avanzado con múltiples tipos de contenido
- � **Sistema de Comentarios** - Comentarios con moderación y reportes
- 📤 **Upload de Archivos** - Soporte para Local, Cloudinary, S3
- 📧 **Email Service** - Verificación, reset de password, notificaciones
- 🔒 **Rate Limiting** - Global y por endpoint para prevenir abuso
- 📊 **Roles y Permisos** - USER, EDITOR, ADMIN con permisos granulares
- 📝 **Winston Logger** - Logging estructurado con rotación de archivos
- 🐛 **Sentry Integration** - Error tracking y monitoring en producción
- 🔄 **Health Checks** - Monitoring y status del servicio
- 📚 **Swagger/OpenAPI** - Documentación interactiva automática
- 🐳 **Docker Ready** - Containerización completa
- 🚀 **CI/CD** - GitHub Actions para testing y deployment
```

## 🚀 Quick Start

### Prerrequisitos

- **Node.js** >= 18
- **pnpm** 9.0.0 (automático con packageManager)
- **Docker** (para PostgreSQL)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd conozca-monorepo

# 2. Instalar dependencias
pnpm install

# 3. Iniciar PostgreSQL
docker-compose up -d

# 4. Configurar variables de entorno
cp .env.example packages/database/.env

# 5. Generar cliente Prisma
cd packages/database
pnpm prisma generate

# 6. Aplicar migraciones
pnpm prisma migrate deploy

# 7. Iniciar todas las aplicaciones
cd ../..
pnpm dev
```

### Aplicaciones Disponibles

Después de ejecutar `pnpm dev`, las aplicaciones estarán disponibles en:

- **Web**: http://localhost:3000
- **Docs**: http://localhost:3001
- **API**: http://localhost:4000

## 📦 Packages

### Apps

#### `apps/api`
API REST construida con NestJS con documentación Swagger/OpenAPI integrada. Maneja autenticación, artículos, y toda la lógica de negocio.

**Puerto:** 4000  
**Stack:** NestJS 11, Prisma, PostgreSQL, JWT, Swagger  
**Documentación:** http://localhost:4000/api/docs  
**Health Check:** http://localhost:4000/health

**Features:**
- ✅ Autenticación JWT con refresh tokens
- ✅ Rate limiting (global + por endpoint)
- ✅ Roles: USER, EDITOR, ADMIN
- ✅ CRUD de artículos con estados
- ✅ Sistema de bloques de contenido
- ✅ Sistema de comentarios con moderación
- ✅ Upload de archivos (Local/Cloudinary/S3)
- ✅ Email service con Nodemailer
- ✅ Winston logger con rotación de archivos
- ✅ Sentry error tracking
- ✅ Scheduling de publicaciones
- ✅ SEO metadata
- ✅ Redirects automáticos
- ✅ Swagger UI interactivo

#### `apps/web`
Aplicación web principal del proyecto Conozca.

**Puerto:** 3000  
**Stack:** Next.js 16, React 19, Turbopack

#### `apps/docs`
Documentación del proyecto.

**Puerto:** 3001  
**Stack:** Next.js 16

### Packages

#### `packages/database`
Contiene el schema de Prisma, migraciones y exporta el cliente configurado.

**Responsabilidades:**
- Schema de base de datos (models, enums, relations)
- Migraciones
- Cliente Prisma con driver adapter para PostgreSQL

#### `packages/ui`
Componentes React compartidos entre aplicaciones.

#### `packages/eslint-config` y `packages/typescript-config`
Configuraciones compartidas para mantener consistencia en el código.

## 🗄️ Base de Datos

### Schema Principal

El proyecto usa PostgreSQL con Prisma 7. Los principales modelos son:

- **User**: Usuarios del sistema (ADMIN, EDITOR, USER)
- **Author**: Autores/firmas de artículos
- **Category**: Categorías de contenido
- **Article**: Artículos de la revista
- **View**: Registro de visualizaciones (analíticas)

### Comandos Útiles

```bash
# Generar cliente Prisma (después de cambios en schema)
cd packages/database
pnpm prisma generate

# Aplicar cambios al schema (desarrollo)
pnpm prisma db push

# Crear una migración
pnpm prisma migrate dev --name nombre_migracion

# Abrir Prisma Studio (GUI para ver datos)
pnpm prisma studio

# Conectarse directamente a PostgreSQL
docker exec -it conozca-db psql -U admin -d conozca_db
```

## 🛠️ Scripts Disponibles

En la raíz del monorepo:

```bash
pnpm dev          # Iniciar todas las apps en modo desarrollo
pnpm build        # Compilar todas las apps
pnpm lint         # Ejecutar linter en todas las apps
pnpm format       # Formatear código con Prettier
```

## 🔧 Configuración de Prisma 7

Este proyecto usa **Prisma 7**, que introdujo cambios importantes:

1. **No se usa `url` en el schema**: La URL de conexión se configura en `prisma.config.ts`
2. **Driver Adapters obligatorios**: Se usa `@prisma/adapter-pg` con `pg` para conexión directa
3. **Constructor con adapter**: El `PrismaClient` recibe el adapter en el constructor

Ver `apps/api/src/prisma.service.ts` para la implementación.

## 📝 Convenciones de Código

- **TypeScript** para todo el código
- **ESLint + Prettier** para formateo consistente
- **Conventional Commits** para mensajes de commit
- **pnpm workspaces** para gestión de monorepo
- **Turbo** para builds y dev en paralelo

## 🐳 Docker

El proyecto incluye PostgreSQL containerizado:

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Ver logs
docker logs conozca-db

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## ✅ Estado del Proyecto

### ✅ Fase 1: Production Ready - COMPLETADA

**Completado:**
- ✅ Endpoint-level throttling en endpoints sensibles
- ✅ Migraciones Prisma (Session, EmailVerificationToken, Redirect, ArticleSchedule)
- ✅ Docker multi-stage con Alpine
- ✅ docker-compose.yml completo (postgres, api, pgadmin)
- ✅ Scripts de deployment (deploy.sh, rollback.sh, generate-secrets.sh)
- ✅ GitHub Actions CI/CD (6 jobs: lint, test, e2e, build, deploy)
- ✅ Health check endpoint
- ✅ Environment configuration (.env.example)
- ✅ Documentación de deployment

**Ver:** [DEPLOYMENT.md](DEPLOYMENT.md)

### ✅ Fase 2: Documentación & Developer Experience - COMPLETADA

**Completado:**
- ✅ Swagger/OpenAPI integrado (http://localhost:4000/api/docs)
- ✅ Todos los DTOs documentados con @ApiProperty
- ✅ Auth controller completamente documentado
- ✅ Article controller con estructura base
- ✅ Guía completa de API con ejemplos
- ✅ Rate limiting visible en docs
- ✅ Roles y permisos documentados
- ✅ Integration guides para React/Next.js
- ✅ Postman collection con todos los endpoints
- ✅ 217 tests pasando (134 unit + 83 E2E)

**Ver:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### ✅ Fase 3: Backend Optimizations - COMPLETADA ✨

**Completado:**
- ✅ Winston Logger (140 lines) - Logging estructurado con rotación diaria
- ✅ Email Service (180 lines) - Nodemailer con verificación/reset/notificaciones
- ✅ Upload Service (200+ lines) - Soporte Local/Cloudinary/S3 con CDN
- ✅ Comments System (350+ lines) - CRUD con moderación y reportes (13/13 tests ✅)
- ✅ Sentry Integration (240 lines) - Error tracking y performance monitoring
- ✅ Migración de base de datos para comentarios
- ✅ .env.example con 65 variables configurables
- ✅ Code examples para todas las features
- ✅ Deployment guides (staging + production)
- ✅ Setup & verification scripts
- ✅ TypeScript compilation: 0 errors
- ✅ **PRODUCTION READY** 🚀

**Ver:**
- [BACKEND_OPTIMIZATIONS.md](BACKEND_OPTIMIZATIONS.md) - Guía completa 5,000+ palabras
- [PHASE3_FINAL_SUMMARY.md](PHASE3_FINAL_SUMMARY.md) - Resumen de entrega Phase 3
- [PHASE3_ALL_STEPS_COMPLETED.md](PHASE3_ALL_STEPS_COMPLETED.md) - Todos los pasos realizados
- [DEPLOYMENT_PRODUCTION_READY.md](DEPLOYMENT_PRODUCTION_READY.md) - Guía deployment
- [EXAMPLES_USAGE.md](EXAMPLES_USAGE.md) - Ejemplos de código
- [PHASE3_BACKEND_QUICK_REFERENCE.md](PHASE3_BACKEND_QUICK_REFERENCE.md) - Quick reference para developers

### 🚀 Próximas Fases

**Fase 4 (Frontend Development):**
- [ ] Web application con Next.js
- [ ] Panel de administración
- [ ] Editor de artículos avanzado
- [ ] Integración de comentarios en frontend
- [ ] Upload de imágenes en editor

**Fase 5 (Advanced Features):**
- [ ] Notificaciones en tiempo real
- [ ] Sistema de búsqueda avanzada (Elasticsearch)
- [ ] CDN y optimización de assets
- [ ] Analytics dashboard
- [ ] Newsletter system

## 📚 Documentación

- **[API Documentation](API_DOCUMENTATION.md)** - Guía completa de la API REST
- **[Backend Optimizations](BACKEND_OPTIMIZATIONS.md)** - Guía Phase 3: logger, email, uploads, comments, Sentry (5,000+ palabras)
- **[Phase 3 Summary](PHASE3_FINAL_SUMMARY.md)** - Resumen de entrega Phase 3
- **[Phase 3 Complete Steps](PHASE3_ALL_STEPS_COMPLETED.md)** - Todos los próximos pasos realizados
- **[Production Deployment](DEPLOYMENT_PRODUCTION_READY.md)** - Guía staging + production
- **[Code Examples](EXAMPLES_USAGE.md)** - Ejemplos prácticos para todas las features
- **[Quick Reference](PHASE3_BACKEND_QUICK_REFERENCE.md)** - Comandos rápidos para developers
- **[Integration Guides](INTEGRATION_GUIDES.md)** - Ejemplos de consumo en React/Next.js y Node
- **[Deployment Guide](DEPLOYMENT.md)** - Instrucciones de deployment básico
- **[Testing Guide](apps/api/TESTING_GUIDE.md)** - Testing unitario y E2E
- **[Phase 1 Summary](FASE_1_PRODUCTION_READY.md)** - Resumen Fase 1
- **[Phase 2 Summary](PHASE2_COMPLETION_SUMMARY.md)** - Resumen Fase 2
- **[Swagger UI](http://localhost:4000/api/docs)** - Documentación interactiva
- **Colección Postman**: [postman/ConozcaAPI.postman_collection.json](postman/ConozcaAPI.postman_collection.json)
- **Environments Postman**: 
  - [Local](postman/ConozcaAPI.postman_environment.json)
  - [Staging](postman/ConozcaAPI.postman_environment.staging.json)
  - [Production](postman/ConozcaAPI.postman_environment.production.json)

Ver [ROADMAP.md](./ROADMAP.md) para el plan completo de 12 fases de desarrollo.

## 🤝 Contribuir

1. Crear una rama desde `main`
2. Hacer cambios siguiendo las convenciones
3. Asegurar que `pnpm lint` y `pnpm build` pasen
4. Crear Pull Request

## 📄 Licencia

UNLICENSED - Proyecto privado
