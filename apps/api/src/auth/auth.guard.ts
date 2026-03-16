import { Injectable } from "@nestjs/common";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";

/**
 * AuthGuard
 *
 * Guard de NestJS que protege rutas requiriendo un JWT válido.
 * Se usa en controladores con @UseGuards(AuthGuard)
 */
@Injectable()
export class AuthGuard extends PassportAuthGuard("jwt") {}
