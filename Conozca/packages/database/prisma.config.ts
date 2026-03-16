import "dotenv/config";
import { defineConfig } from "@prisma/config";

/**
 * Configuración de Prisma CLI
 * 
 * Este archivo es usado por el CLI de Prisma (migrate, generate, studio, etc.)
 * para saber dónde está el schema y cómo conectarse a la base de datos.
 * 
 * @remarks
 * En Prisma 7, la URL de conexión ya no va en el schema.prisma sino aquí.
 * Las aplicaciones que usan el cliente deben pasar un adapter en el constructor.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // La URL se lee desde la variable de entorno DATABASE_URL
    url: process.env["DATABASE_URL"],
  },
});
