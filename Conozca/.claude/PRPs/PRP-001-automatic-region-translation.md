# PRP-001: Traducción Automática por Región

> **Estado**: PENDIENTE
> **Fecha**: 2026-03-04
> **Proyecto**: Conozca

---

## Objetivo

Implementar la redirección y traducción automática del sitio basada en la región (geolocalización) o el idioma de preferencia del navegador del usuario, para que el contenido se muestre instantáneamente en su idioma nativo sin requerir selección manual.

## Por Qué

| Problema | Solución |
|----------|----------|
| El sitio actualmente carga por defecto en español (`/es`) sin importar de dónde visite el usuario, causando fricción para lectores internacionales. | Utilizar detección de idioma/región en el middleware para redirigir automáticamente a `/en`, `/pt`, `/fr` o `/es`. |

**Valor de negocio**: Mejora la experiencia del usuario (UX) para la audiencia global, reduce la tasa de rebote internacional y aumenta la retención de lectura al mostrar contenido en el idioma correcto desde el primer instante.

## Qué

### Criterios de Éxito
- [ ] Usuarios de Brasil u otros países lusófonos son redirigidos a `/pt`.
- [ ] Usuarios de países francófonos son redirigidos a `/fr`.
- [ ] Usuarios de países angloparlantes son redirigidos a `/en`.
- [ ] Usuarios hispanohablantes son redirigidos a `/es`.
- [ ] La preferencia negociada toma en cuenta el header `accept-language` o los headers de geolocalización (ej. `x-vercel-ip-country`).

### Comportamiento Esperado
Cuando un visitante ingresa a `conozca.com` o al `localhost:3000/`, el `middleware.ts` interceptará la petición, analizará los headers HTTP del visitante para determinar su idioma o país de origen, y hará un rewrite/redirect a la variante de la ruta localizada correspondiente.

---

## Contexto

### Referencias
- `src/middleware.ts` y `src/i18n/routing.ts` - Configuración actual de `next-intl`.
- Documentación de Next.js Middleware y Next-Intl Routing.

### Arquitectura Propuesta (Feature-First)
No se requieren nuevas carpetas de features. Las modificaciones se aplicarán directamente en la capa de enrutamiento internacional.

Archivos a modificar:
- `src/middleware.ts`
- `src/i18n/routing.ts`

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Configurar Detección de Idioma en middleware
**Objetivo**: Modificar `middleware.ts` y `i18n/routing.ts` para habilitar `localeDetection` o configurar una resolución de locale basada en headers como `accept-language` / `x-vercel-ip-country`.
**Validación**: Acceder a `/` usando un navegador configurado en inglés redirige a `/en`.

### Fase 2: Validación Final
**Objetivo**: Sistema funcionando end-to-end simulando diferentes regiones locales.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma UI en diferentes idiomas según el `accept-language` request.
- [ ] Criterios de éxito cumplidos

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

### 2026-03-04: Next-Intl Locale Detection
- **Error**: El template base cargaba español por defecto ignorando el locale del request.
- **Fix**: Activar de forma explícita `localeDetection: true` y `localePrefix: 'as-needed'` en el middleware y en la factory de enrutamiento (`defineRouting`) para habilitar redirecciones 307 basadas en el HTTP header `Accept-Language` o en las cookies configuradas previamente. 
- **Aplicar en**: Futuros proyectos multilenguaje en la SaaS Factory.

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] [Gotcha 1 - Next-Intl por defecto usa `accept-language`, si no está funcionando es probable que se haya desactivado `localeDetection` o el orden en el header no coincida con nuestros `locales`].
- [ ] [Gotcha 2 - Localmente probar geolocalización por IP (`x-vercel-ip-country`) es difícil porque Vercel inyecta esto solo en producción; dependeremos de `accept-language` para la prueba local].

## Anti-Patrones

- NO añadir dependencias pesadas de terceros para detección de IP cuando los headers estándar HTTP son suficientes.
- NO forzar redirecciones que rompan el acceso directo a una URL específica (e.g. si alguien de Brasil va directamente a `/en/about`, no obligarlo a ir a `/pt`).

---

*PRP pendiente aprobación. No se ha modificado código.*
