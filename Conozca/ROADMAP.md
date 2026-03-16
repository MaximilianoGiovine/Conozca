# 🗺️ Roadmap Conozca

Hoja de ruta del desarrollo de **Conozca**, una revista digital independiente.

## 📌 Visión

Conozca es una plataforma de publicación de contenido de calidad, construida para:
- Publicar y gestionar artículos editoriales
- Construir y mantener una audiencia de lectores
- Analizar el impacto de contenido
- Monetizar a través de suscripciones y donaciones

---

## 🚀 Fases de Desarrollo

### **Fase 1: Autenticación & Seguridad** 🔐
**Estado:** ✅ COMPLETADA (100%)  
**Prioridad:** 🔴 ALTA

Implementar el sistema de identidad y control de acceso.

- [x] JWT tokens (acceso y refresco)
- [x] Endpoint `POST /auth/register` - crear cuenta
- [x] Endpoint `POST /auth/login` - iniciar sesión
- [x] Endpoint `POST /auth/refresh` - refrescar token
- [x] Endpoint `POST /auth/logout` - cerrar sesión
- [x] Hash de contraseñas con bcrypt
- [x] Middleware de autenticación
- [x] Validación de roles (ADMIN, EDITOR, USER)
- [x] Recuperación de contraseña (`/auth/forgot-password`, `/auth/reset-password`)

**Dependencias:**
- `@nestjs/jwt` ✅
- `bcrypt` ✅
- `passport` ✅ (opcional, para OAuth futuro)

**Archivos creados:**
- `apps/api/src/auth/auth.service.ts` - Lógica de autenticación
- `apps/api/src/auth/auth.controller.ts` - Endpoints
- `apps/api/src/auth/auth.module.ts` - Módulo
- `apps/api/src/auth/jwt.strategy.ts` - Estrategia JWT
- `apps/api/src/auth/auth.guard.ts` - Guard de autenticación
- `apps/api/src/auth/role.guard.ts` - Guard de roles
- `apps/api/src/auth/auth.dto.ts` - Data Transfer Objects

---

### **Fase 2: CRUD de Artículos** 📝
**Estado:** Por comenzar  
**Prioridad:** 🔴 ALTA

Sistema completo de publicación de artículos.

**Endpoints:**
- [ ] `POST /articles` - crear artículo (EDITOR+)
- [ ] `GET /articles` - listar artículos publicados (con paginación)
- [ ] `GET /articles/draft` - listar borradores (EDITOR+)
- [ ] `GET /articles/:slug` - leer artículo completo
- [ ] `PATCH /articles/:id` - editar artículo
- [ ] `DELETE /articles/:id` - eliminar artículo (ADMIN)
- [ ] `PATCH /articles/:id/publish` - publicar borrador
- [ ] `PATCH /articles/:id/archive` - archivar artículo

**Filtros & Búsqueda:**
- [ ] Filtrar por categoría
- [ ] Filtrar por autor
- [ ] Filtrar por estado (DRAFT, PUBLISHED, ARCHIVED)
- [ ] Búsqueda de texto en título/contenido
- [ ] Ordenar por fecha, popularidad

**Validaciones:**
- [ ] Slug único
- [ ] Autor debe existir
- [ ] Categoría debe existir
- [ ] Contenido mínimo requerido

---

### **Fase 3: Gestión de Usuarios & Permisos** 👥
**Estado:** Por comenzar  
**Prioridad:** 🔴 ALTA

Control de acceso y roles de usuarios.

**Endpoints:**
- [ ] `GET /users` - listar usuarios (ADMIN)
- [ ] `GET /users/:id` - obtener usuario (ADMIN o self)
- [ ] `PATCH /users/:id` - editar usuario (ADMIN)
- [ ] `PATCH /users/:id/role` - cambiar rol (ADMIN)
- [ ] `DELETE /users/:id` - eliminar usuario (ADMIN)
- [ ] `PATCH /users/:id/activate` - activar usuario (ADMIN)
- [ ] `PATCH /users/:id/deactivate` - desactivar usuario (ADMIN)

**Roles:**
- `ADMIN` - Acceso total al sistema
- `EDITOR` - Puede crear y editar artículos
- `USER` - Lector registrado (newsletter, historial)

---

### **Fase 4: Autores y Categorías** 📚
**Estado:** Por comenzar  
**Prioridad:** 🟡 MEDIA

Gestión de metadatos de contenido.

**Endpoints de Autores:**
- [ ] `POST /authors` - crear autor (ADMIN)
- [ ] `GET /authors` - listar autores
- [ ] `GET /authors/:id` - obtener autor
- [ ] `PATCH /authors/:id` - editar autor (ADMIN)
- [ ] `DELETE /authors/:id` - eliminar autor (ADMIN)

**Endpoints de Categorías:**
- [ ] `POST /categories` - crear categoría (ADMIN)
- [ ] `GET /categories` - listar categorías
- [ ] `GET /categories/:slug` - obtener categoría
- [ ] `PATCH /categories/:id` - editar categoría (ADMIN)
- [ ] `DELETE /categories/:id` - eliminar categoría (ADMIN)

---

### **Fase 5: Newsletter** 📧
**Estado:** Por comenzar  
**Prioridad:** 🟡 MEDIA

Sistema de suscripción y comunicación con lectores.

**Endpoints:**
- [ ] `POST /newsletter/subscribe` - suscribirse
- [ ] `POST /newsletter/unsubscribe` - desuscribirse
- [ ] `GET /newsletter/subscribers` - listar suscriptores (ADMIN)
- [ ] `POST /newsletter/send` - enviar newsletter (ADMIN)

**Características:**
- [ ] Email de confirmación
- [ ] Validación de email
- [ ] Historial de suscripción/desuscripción
- [ ] Integración con SendGrid o Resend

---

### **Fase 6: Analíticas** 📊
**Estado:** Por comenzar  
**Prioridad:** 🟡 MEDIA

Tracking de visualizaciones y comportamiento de lectores.

**Endpoints:**
- [ ] `POST /articles/:id/view` - registrar visualización
- [ ] `GET /articles/stats/top` - artículos más leídos
- [ ] `GET /articles/:id/stats` - estadísticas de un artículo
- [ ] `GET /dashboard/stats` - estadísticas generales (ADMIN)
- [ ] `GET /dashboard/stats/period` - estadísticas por período

**Métricas:**
- [ ] Vistas totales
- [ ] Vistas por período
- [ ] Tiempo promedio de lectura
- [ ] Tasa de rebote
- [ ] Dispositivo/navegador
- [ ] Geolocalización (opcional)

---

### **Fase 7: Frontend Web (Next.js)** 🌐
**Estado:** Por comenzar  
**Prioridad:** 🟡 MEDIA

Sitio público de lectura.

**Páginas:**
- [ ] Homepage - últimos artículos
- [ ] Artículo completo - lectura con metadata
- [ ] Categoría - artículos de una categoría
- [ ] Búsqueda - búsqueda de artículos
- [ ] Autor - artículos de un autor
- [ ] Newsletter signup - suscripción en footer

**Características:**
- [ ] SEO optimizado (meta tags, Open Graph)
- [ ] Sitemap
- [ ] Responsive design
- [ ] Compartir en redes sociales
- [ ] Dark mode (opcional)

---

### **Fase 8: Dashboard Admin (Next.js)** 🎛️
**Estado:** Por comenzar  
**Prioridad:** 🟡 MEDIA

Panel de administración.

**Páginas:**
- [ ] Login de administradores
- [ ] Dashboard principal con KPIs
- [ ] CRUD visual de artículos
- [ ] Gestión de usuarios
- [ ] Gestión de categorías y autores
- [ ] Dashboard de analíticas
- [ ] Gestión de suscriptores

**Características:**
- [ ] Interfaz intuitiva
- [ ] Validación en tiempo real
- [ ] Confirmaciones de acciones peligrosas
- [ ] Exportar datos (CSV, PDF)

---

### **Fase 9: Donaciones** 💳
**Estado:** Por comenzar  
**Prioridad:** 🟢 BAJA

Sistema de monetización.

- [ ] Integración Stripe/PayPal
- [ ] `POST /donations` - procesar donación
- [ ] `GET /donations` - historial (ADMIN)
- [ ] Email de agradecimiento
- [ ] Página de donación en web

---

### **Fase 10: Email Marketing** 📬
**Estado:** Por comenzar  
**Prioridad:** 🟢 BAJA

Automatización de comunicación.

- [ ] Templates de email
- [ ] `POST /newsletters/send` - envío manual (ADMIN)
- [ ] Automatización por publicación
- [ ] Estadísticas de apertura y clicks
- [ ] A/B testing (opcional)

---

### **Fase 11: SEO & Performance** ⚡
**Estado:** Por comenzar  
**Prioridad:** 🟢 BAJA

Optimización para buscadores y velocidad.

**SEO:**
- [ ] Sitemap dinámico
- [ ] robots.txt
- [ ] Schema.org para artículos
- [ ] Meta tags optimizados
- [ ] Open Graph completo
- [ ] Canonical URLs

**Performance:**
- [ ] Compresión de imágenes
- [ ] CDN para assets
- [ ] Caching de artículos publicados
- [ ] Optimización de queries Prisma
- [ ] Rate limiting en API

---

### **Fase 12: Escalabilidad** 🚀
**Estado:** Por comenzar  
**Prioridad:** 🟢 BAJA

Preparar para crecimiento.

- [ ] Redis para caché
- [ ] Rate limiting por IP
- [ ] Paginación eficiente
- [ ] Índices de base de datos
- [ ] Logs centralizados (Winston/Datadog)
- [ ] Monitoreo de uptime
- [ ] Backups automáticos

---

## 📊 Estado General

```
Fase 1 (Auth)          ██████████ 85%
Fase 2 (Artículos)     ░░░░░░░░░░ 0%
Fase 3 (Usuarios)      ░░░░░░░░░░ 0%
Fase 4 (Meta)          ░░░░░░░░░░ 0%
Fase 5 (Newsletter)    ░░░░░░░░░░ 0%
Fase 6 (Analíticas)    ░░░░░░░░░░ 0%
Fase 7 (Web)           ░░░░░░░░░░ 0%
Fase 8 (Admin)         ░░░░░░░░░░ 0%
Fase 9 (Donaciones)    ░░░░░░░░░░ 0%
Fase 10 (Email)        ░░░░░░░░░░ 0%
Fase 11 (SEO)          ░░░░░░░░░░ 0%
Fase 12 (Scale)        ░░░░░░░░░░ 0%
```

---

## 🎯 MVP (Minimum Viable Product)

Para lanzar Conozca con funcionalidad mínima viable:

**Debe tener:**
1. ✅ Fase 1: Autenticación
2. ✅ Fase 2: CRUD de artículos básico
3. ✅ Fase 7: Frontend para lectura
4. ✅ Fase 8: Dashboard admin mínimo

**Puede esperar:**
- Newsletter
- Donaciones
- Analíticas avanzadas
- Email marketing

---

## 🔧 Stack Tecnológico

**Backend:**
- NestJS 11
- Prisma 7 con PostgreSQL 16
- JWT para autenticación

**Frontend:**
- Next.js 16
- React 19
- TypeScript

**Infrastructure:**
- Docker (PostgreSQL)
- Turbo para monorepo

---

## 📝 Notas

- Cada fase incluye tests unitarios y E2E
- Mantener documentación actualizada
- Code review antes de merge a main
- Cumplir convenciones del proyecto

---

## 🚀 Próximo Paso

**Comenzar Fase 1: Autenticación & Seguridad**

Ver `apps/api/README.md` para instrucciones de desarrollo.
