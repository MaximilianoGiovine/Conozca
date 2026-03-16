# Database Package

Package compartido que contiene el schema de Prisma, migraciones y exporta el cliente Prisma configurado.

## 📦 Contenido

- **Schema**: `prisma/schema.prisma` - Definición de modelos, enums y relaciones
- **Migraciones**: `prisma/migrations/` - Historial de cambios en la BD
- **Config**: `prisma.config.ts` - Configuración de Prisma CLI
- **Export**: `index.ts` - Re-exporta `@prisma/client`

## 🗄️ Modelos del Schema

### User
Usuarios del sistema con 3 roles:
- `ADMIN`: Acceso completo
- `EDITOR`: Gestión de contenido
- `USER`: Lectores registrados

### Author
Autores/firmas que aparecen en los artículos.

### Category
Categorías para organizar el contenido.

### Article
Artículos de la revista con:
- Título, slug, contenido, excerpt
- Relación con Author (firma) y User (editor que lo subió)
- Status: DRAFT, PUBLISHED, ARCHIVED

### View
Registro de visualizaciones para analíticas.

## 🔧 Configuración Prisma 7

Este proyecto usa Prisma 7 con cambios importantes:

1. **No hay `url` en el datasource** del schema
2. La URL se configura en `prisma.config.ts`
3. El cliente usa driver adapters (`@prisma/adapter-pg`)

## 🛠️ Scripts

```bash
# Generar cliente Prisma
pnpm db:generate

# Aplicar cambios al schema (desarrollo)
pnpm db:push

# Crear migración (producción)
pnpm prisma migrate dev --name nombre_migracion

# Abrir Prisma Studio
pnpm prisma studio
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en este directorio:

```env
DATABASE_URL="postgresql://admin:mypassword123@localhost:5432/conozca_db?schema=public"
```

## 📝 Modificar el Schema

1. Edita `prisma/schema.prisma`
2. Genera el cliente: `pnpm db:generate`
3. Aplica cambios: `pnpm db:push` (dev) o crea migración (prod)

## 🚀 Uso en Otras Apps

Este package se importa como `@conozca/database`:

```typescript
import { PrismaClient } from '@conozca/database';

const prisma = new PrismaClient();
```

## 📚 Documentación

- [Prisma 7 Docs](https://pris.ly/d/prisma7)
- [Driver Adapters](https://pris.ly/d/prisma7-client-config)
- [Schema Reference](https://pris.ly/d/prisma-schema)
