# Conozca

Plataforma editorial y de gestión construida con Next.js 16 para publicar, organizar y administrar contenido multilingüe. El proyecto combina un sitio público, un panel administrativo y APIs internas para contenido, reservas, comentarios y automatizaciones de correo.

## Stack

```yaml
Framework: Next.js 16 + React 19 + TypeScript
Routing: App Router + next-intl
Styling: Tailwind CSS 3.4
Backend: Supabase + PostgreSQL
Forms/Validation: Zod
State: Zustand
Editor de contenido: Tiptap
Emails: Resend
Tests e2e: Playwright
```

## Qué incluye

- Sitio público con rutas localizadas en `src/app/[locale]`.
- Blog, revistas, libros, enlaces, páginas legales y páginas informativas.
- Autenticación y panel interno para administrar usuarios, autores, artículos, comentarios y analíticas.
- APIs en `src/app/api` para CMS, reservas, correo y procesamiento de documentos.
- Soporte para traducciones y contenido en varios idiomas.

## Estructura principal

```text
src/
├── app/        # Rutas, layouts y API routes
├── features/   # Funcionalidades aisladas por dominio
├── shared/     # Componentes, utilidades y tipos reutilizables
├── lib/        # Clientes y helpers de infraestructura
├── hooks/      # Hooks compartidos
└── types/      # Tipos globales

supabase/       # Esquemas, migraciones y seed SQL
e2e/            # Pruebas end-to-end con Playwright
public/         # Assets estáticos
```

## Desarrollo local

1. Instala dependencias.

```bash
npm install
```

2. Configura las variables de entorno necesarias para Supabase y el envío de correo.

3. Levanta el entorno de desarrollo.

```bash
npm run dev
```

## Scripts disponibles

```bash
npm run dev               # Desarrollo con Turbopack
npm run build             # Build de producción
npm run start             # Arranque de producción
npm run lint              # Lint del proyecto
npm run superadmin:provision  # Crea o sincroniza el superadmin
```

## Variables de entorno

Las credenciales de Supabase y la configuración de acceso se cargan desde el entorno local. Como mínimo, el proyecto usa variables para la URL y la clave anónima de Supabase, además de los datos de provisión del superadmin cuando se ejecuta ese script.

## Notas operativas

- El proyecto usa Docker Compose y archivos de despliegue cuando se necesita levantar la infraestructura completa.
- `e2e/` contiene la cobertura funcional principal y conviene ejecutarla cuando se cambian flujos críticos.
