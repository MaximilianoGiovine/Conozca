# PRP-002: Base de Datos y CMS del Blog (Multilenguaje)

> **Estado**: PENDIENTE
> **Fecha**: 2026-03-04
> **Proyecto**: Conozca

---

## Objetivo

Implementar la estructura de base de datos en Supabase para soportar un Blog o Revista Digital multilenguaje, de forma que los artículos y categorías puedan ser traducidos a los 4 idiomas soportados (`es`, `en`, `pt`, `fr`). 

## Por Qué

| Problema | Solución |
|----------|----------|
| No hay tablas en la base de datos para crear, gestionar ni leer artículos y categorías. | Crear migraciones SQL en Supabase que estructuren el contenido core y sus traducciones separadas. |
| El contenido debe estar disponible en 4 idiomas. | Usar el patrón de "Tablas de Traducción" (`articles` + `article_translations`) para escalar localizaciones dinámicamente. |

**Valor de negocio**: Permite a los editores gestionar contenido y administrar la revista digital, fundamental para el funcionamiento del medio de comunicación. 

## Qué

### Criterios de Éxito
- [ ] Creación de tablas: `categories`, `category_translations`, `articles`, `article_translations`.
- [ ] Aplicar *Row Level Security* (RLS) para que cualquier usuario pueda leer (SELECT) artículos publicados.
- [ ] Sólo usuarios con roles autorizados (superadmin o autores) pueden crear, editar y borrar (INSERT, UPDATE, DELETE).
- [ ] Conexión Exitosa: el `articleService.ts` puede ejecutar `.select()` sin arrojar el error `PGRST205` (falta de tabla).

### Comportamiento Esperado
Una vez aplicadas las migraciones, un Administrador podrá iniciar sesión y crear Artículos y Categorías. Estos se vincularán automáticamente al idioma correspondiente, y los visitantes podrán consumir la API a través de `articleService.ts` leyendo del idioma correcto de acuerdo a su entorno.

---

## Contexto

### Referencias
- Tipos definidos en `src/features/blog/types/article.ts`.
- Servicio en `src/features/blog/services/articleService.ts`.
- **Esquema provisto por el humano:** `supabase/cms_schema.sql`.

Se utilizará la estructura diseñada en `supabase/cms_schema.sql`, extendida para incluir las nuevas peticiones específicas:
1. Tabla `users` y `user_roles` con policies y función `is_admin()`.
2. Tabla `authors` (perfiles públicos vinculados a usuarios).
3. Tabla `categories` y `category_translations` con RLS.
4. Tabla `articles` y `article_translations` con RLS, y un Trigger para `updated_at`.
5. Tabla `comments` para que los usuarios puedan interactuar en los artículos.

---

## Blueprint (Assembly Line)

### Fase 1: Creación de Migraciones
**Objetivo**: Generar los scripts SQL en `supabase/migrations/` con el esquema, RLS y roles requeridos.
**Validación**: Archivos creados correctamente usando Supabase CLI.

### Fase 2: Aplicación en Base de Datos Local/Remota
**Objetivo**: Conectar Supabase CLI con el `project_ref` usando el Token dado por el humano, y ejecutar `db push`.
**Validación**: Poder leer las tablas creadas sin errores usando la API REST.

### Fase 3: Pruebas de Servicio
**Objetivo**: Validar que el código Typescript puede consultar los datos.
**Validación**: Las promesas de `articleService.ts` devuelven arrays vacíos en lugar de un error 500 o 'pgrst205'.

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)
*(Por llenar durante la implementación)*

## Gotchas
- [ ] Supabase CLI requiere estar logueado para hacer `db push` al proyecto remoto.
- [ ] Necesitamos un usuario "superadmin" de base, como indica el Task.

## Anti-Patrones
- NO almacenar traducciones en un archivo JSON local si requerimos que el editor CMS manipule los textos de la BD dinámicamente.
---
*PRP pendiente aprobación.*
