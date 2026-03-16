/**
 * Database Package
 * 
 * Re-exporta todo el contenido de @prisma/client para que las aplicaciones
 * puedan importar desde @conozca/database en lugar de @prisma/client.
 * 
 * Esto centraliza la configuración de Prisma y permite cambios futuros
 * sin afectar las aplicaciones que lo consumen.
 * 
 * @example
 * ```typescript
 * import { PrismaClient, User, Article } from '@conozca/database';
 * ```
 */
export * from '@prisma/client';