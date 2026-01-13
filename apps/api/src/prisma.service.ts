// apps/api/src/prisma.service.ts
import "dotenv/config"; // Cargar variables de entorno
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@conozca/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * PrismaService
 * 
 * Servicio de NestJS que extiende PrismaClient y maneja el ciclo de vida
 * de la conexión a PostgreSQL usando el driver adapter de Prisma 7.
 * 
 * @remarks
 * Prisma 7 requiere usar driver adapters cuando el schema no contiene `url`.
 * Este servicio configura el adapter de PostgreSQL en el constructor.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Obtener la URL de conexión desde variables de entorno
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL no está definida. Asegúrate de crear un archivo .env en packages/database ' +
        'o configura la variable de entorno DATABASE_URL.'
      );
    }
    
    // Configurar el pool de conexiones de PostgreSQL
    const pool = new Pool({ connectionString });
    
    // Crear el adapter de Prisma para PostgreSQL
    const adapter = new PrismaPg(pool);
    
    // Inicializar PrismaClient con el adapter
    super({ adapter });
  }

  /**
   * Hook de NestJS que se ejecuta cuando el módulo se inicializa.
   * Establece la conexión con la base de datos.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Hook de NestJS que se ejecuta cuando el módulo se destruye.
   * Cierra la conexión con la base de datos de forma limpia.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}