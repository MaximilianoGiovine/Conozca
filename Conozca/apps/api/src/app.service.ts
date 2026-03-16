import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * AppService
 *
 * Servicio principal de la aplicación.
 * Contiene la lógica de negocio y se comunica con la base de datos vía Prisma.
 */
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  /**
   * Health check endpoint que verifica la conexión con la base de datos.
   *
   * @returns Mensaje con el número de usuarios registrados en el sistema
   */
  async getHello() {
    const userCount = await this.prisma.user.count();
    return `Conexión exitosa. Actualmente hay ${userCount} usuarios registrados en Conozca.`;
  }
}
