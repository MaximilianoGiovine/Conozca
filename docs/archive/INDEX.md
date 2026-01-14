# 📚 Guía de Documentación - Conozca

Índice completo de documentación del proyecto. Selecciona el archivo según tu rol y necesidad.

---

## 🎯 Status Actual

**Fase 1**: ✅ COMPLETADA (Autenticación)
- 65 tests unitarios + 50 E2E
- 100% cobertura en auth
- Servidor validado

**Fase 2**: ✅ COMPLETADA (Artículos)
- 56+ tests unitarios + 21 E2E
- Módulo CRUD completo
- Control de acceso por rol
- Categorías y autores

**Siguiente**: Fase 3 (Comentarios, Búsqueda, Tags)

---

## 👤 Selecciona tu Rol

### 👨‍💻 Soy Desarrollador
**¿Cómo empiezo?**
1. Lee: [README.md](./README.md) (5 min)
2. Sigue: [QUICK_START.md](./QUICK_START.md) (10 min)
3. Revisa: [ARCHITECTURE.md](./ARCHITECTURE.md) (15 min)

**¿Qué se completó en Fase 2?**
- Lee: [PHASE_2_COMPLETION.md](./PHASE_2_COMPLETION.md)
- Resumido en: [PHASE_2_SUMMARY.md](./PHASE_2_SUMMARY.md)

**¿Cómo contribuyo?**
- Lee [apps/api/README.md](./apps/api/README.md)
- Estudia [ARCHITECTURE.md](./ARCHITECTURE.md)
- Usa [TESTING.md](./TESTING.md) para validar cambios
- Sigue el patrón de ArticleModule para Fase 3

**Endpoints Fase 2 (Artículos)**
```
POST   /articles              - Crear artículo
GET    /articles              - Listar (paginado)
GET    /articles/:slug        - Obtener por slug
PATCH  /articles/:id          - Actualizar
DELETE /articles/:id          - Eliminar

POST   /articles/categories   - Crear categoría
GET    /articles/categories   - Listar categorías

POST   /articles/authors      - Crear autor
GET    /articles/authors      - Listar autores
```

---

### 👨‍🔬 Soy QA / Tester
**¿Qué debo testear?**
1. Abre [TESTING.md](./TESTING.md)
2. Endpoints Fase 1: Autenticación (6 endpoints)
3. Endpoints Fase 2: Artículos (9 endpoints)
4. Copia los curl commands y ejecuta

**Fase 1 - Endpoints Auth**
- ✅ POST /auth/register
- ✅ POST /auth/login
- ✅ POST /auth/refresh
- ✅ POST /auth/logout
- ✅ POST /auth/forgot-password
- ✅ POST /auth/reset-password

**Fase 2 - Endpoints Artículos**
- ✅ POST /articles (crear)
- ✅ GET /articles (listar)
- ✅ GET /articles/:slug (obtener)
- ✅ PATCH /articles/:id (actualizar)
- ✅ DELETE /articles/:id (eliminar)
- ✅ POST /articles/categories (crear categoría)
- ✅ GET /articles/categories (listar categorías)
- ✅ POST /articles/authors (crear autor)
- ✅ GET /articles/authors (listar autores)

**Herramientas:**
- Curl (en terminal)
- Postman / Insomnia
- REST Client (VS Code extension)

---

### 👨‍💼 Soy Product Manager / Stakeholder
**¿Cuál es el status?**
→ Ve a [PROJECT_STATUS.md](./PROJECT_STATUS.md)

**¿Qué se hizo en Fase 2?**
→ Ve a [PHASE_2_COMPLETION.md](./PHASE_2_COMPLETION.md)

**¿Cuál es el plan de desarrollo?**
→ Lee [ROADMAP.md](./ROADMAP.md)

**¿Qué se completó en Fase 1?**
→ Lee [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md)

---

### 👨‍🏫 Soy Arquitecto / Tech Lead
**¿Cómo está diseñado?**
→ Ve a [ARCHITECTURE.md](./ARCHITECTURE.md)

**¿Cómo está estructurado el código?**
→ Revisa [apps/api/README.md](./apps/api/README.md)

**¿Cuál es la BD?**
→ Lee [packages/database/README.md](./packages/database/README.md)

---

## 📑 Documentos Disponibles

### 1. 📘 [README.md](./README.md)
**Propósito:** Overview general del proyecto  
**Contenido:**
- Descripción del proyecto Conozca
- Estructura del monorepo
- Quick start (instalación)
- Tecnologías utilizadas
- Estado actual
- Próximas fases

**Lee esto si:** Acabas de llegar al proyecto

---

### 2. 🚀 [QUICK_START.md](./QUICK_START.md)
**Propósito:** Iniciar el desarrollo rápidamente  
**Contenido:**
- Paso a paso para correr localmente
- Endpoints disponibles
- Ejemplos de uso
- Troubleshooting rápido

**Lee esto si:** Quieres empezar a desarrollar ahora

---

### 3. 🧪 [TESTING.md](./TESTING.md)
**Propósito:** Guía completa de testing  
**Contenido:**
- 6 endpoints detallados
- Ejemplos curl para cada uno
- Workflow completo
- Herramientas recomendadas
- Checklist de testing

**Lee esto si:** Vas a hacer testing o debugging

---

### 4. 🗺️ [ROADMAP.md](./ROADMAP.md)
**Propósito:** Plan de 12 fases de desarrollo  
**Contenido:**
- Visión del proyecto
- 12 fases descritas
- Dependencias entre fases
- MVP definition
- Progress tracking

**Lee esto si:** Necesitas entender el plan completo

---

### 5. ✅ [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md)
**Propósito:** Resumen técnico de Fase 1  
**Contenido:**
- Objetivos logrados
- Archivos creados/modificados
- Estadísticas de código
- Testing realizado
- Próximos pasos

**Lee esto si:** Quieres detalles técnicos de Fase 1

---

### 6. 📊 [PROJECT_STATUS.md](./PROJECT_STATUS.md)
**Propósito:** Estado actual del proyecto  
**Contenido:**
- Resumen ejecutivo
- Tecnologías utilizadas
- Archivos clave
- Estadísticas
- Checklist de finalización

**Lee esto si:** Necesitas briefing ejecutivo

---

### 7. 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Propósito:** Arquitectura del sistema  
**Contenido:**
- Diagrama general
- Flujo de autenticación
- Estructura de tokens
- Módulos y layers
- Security layers

**Lee esto si:** Quieres entender el diseño técnico

---

## 🎯 Rutas de Aprendizaje

### Ruta: "Quiero contribuir código"
1. [README.md](./README.md) - 5 min
2. [QUICK_START.md](./QUICK_START.md) - 10 min
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - 15 min
4. [apps/api/src/auth/](./apps/api/src/auth/) - 20 min
5. [TESTING.md](./TESTING.md) - 10 min
**Total:** ~60 minutos

### Ruta: "Quiero entender todo"
1. [README.md](./README.md) - 5 min
2. [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 10 min
3. [ROADMAP.md](./ROADMAP.md) - 15 min
4. [ARCHITECTURE.md](./ARCHITECTURE.md) - 15 min
5. [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md) - 10 min
**Total:** ~55 minutos

### Ruta: "Necesito testear rápido"
1. [TESTING.md](./TESTING.md) - 10 min
2. Copiar curl commands - 5 min
3. Ejecutar contra API - 10 min
**Total:** ~25 minutos

---

## 📁 Documentación Específica por Carpeta

### `/apps/api`
- [apps/api/README.md](./apps/api/README.md) - API-specific documentation
- [apps/api/src/auth/](./apps/api/src/auth/) - Auth module (implementation reference)
- [apps/api/src/main.ts](./apps/api/src/main.ts) - Application entry point

### `/packages/database`
- [packages/database/README.md](./packages/database/README.md) - Database package doc
- [packages/database/prisma/schema.prisma](./packages/database/prisma/schema.prisma) - Database schema
- [packages/database/prisma/migrations/](./packages/database/prisma/migrations/) - Migration history

---

## 🔍 Búsqueda Rápida

**¿Cómo hago...?**

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| Instalar y correr localmente | [QUICK_START.md](./QUICK_START.md) | Iniciar el Proyecto |
| Testear endpoints | [TESTING.md](./TESTING.md) | Testing Workflow |
| Entender la arquitectura | [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura General |
| Ver qué falta de Fase 1 | [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md) | Características Opcionales |
| Implementar Fase 2 | [ROADMAP.md](./ROADMAP.md) | Fase 2: CRUD de Artículos |
| Agregar nuevo endpoint | [ARCHITECTURE.md](./ARCHITECTURE.md) | Estructura de Módulos |
| Configurar variables env | [QUICK_START.md](./QUICK_START.md) | Variables de Ambiente |
| Ver status del proyecto | [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Estado Actual |
| Entender tokens JWT | [ARCHITECTURE.md](./ARCHITECTURE.md) | Token Structure |

---

## 📚 Lectura Recomendada por Experiencia

### Para Principiante
1. [README.md](./README.md)
2. [QUICK_START.md](./QUICK_START.md)
3. [TESTING.md](./TESTING.md)

### Para Intermedio
1. [ARCHITECTURE.md](./ARCHITECTURE.md)
2. [ROADMAP.md](./ROADMAP.md)
3. [apps/api/src/auth/](./apps/api/src/auth/) (codigo)

### Para Avanzado
1. [ARCHITECTURE.md](./ARCHITECTURE.md)
2. [PROJECT_STATUS.md](./PROJECT_STATUS.md)
3. [packages/database/README.md](./packages/database/README.md)
4. [packages/database/prisma/schema.prisma](./packages/database/prisma/schema.prisma)

---

## 🎯 Checklist de Onboarding

- [ ] He leído [README.md](./README.md)
- [ ] He corrido [QUICK_START.md](./QUICK_START.md)
- [ ] He probado los endpoints en [TESTING.md](./TESTING.md)
- [ ] Entiendo la [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Conocgo el [ROADMAP.md](./ROADMAP.md)
- [ ] He revisado el código en `apps/api/src/auth/`
- [ ] Estoy listo para Fase 2

---

## 📞 Soporte

Si tienes dudas después de leer la documentación:

1. **Busca en los documentos** - La mayoría de preguntas ya están respondidas
2. **Revisa [TESTING.md](./TESTING.md)** - Para problemas técnicos
3. **Abre un issue** - Si encontraste un bug o falta info
4. **Pregunta al equipo** - Para decisiones arquitectónicas

---

## ✅ Checklist de Documentación

- [x] README.md - Overview general
- [x] QUICK_START.md - Iniciar desarrollo
- [x] TESTING.md - Guía de testing
- [x] ROADMAP.md - Plan de desarrollo
- [x] PHASE_1_SUMMARY.md - Resumen Fase 1
- [x] PROJECT_STATUS.md - Status actual
- [x] ARCHITECTURE.md - Arquitectura técnica
- [x] Este documento (INDEX)

---

**Última actualización:** 2025-01-08  
**Versión:** 1.0.0  
**Estado:** ✅ Documentación Completa

