import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * RoleGuard
 * 
 * Guard que verifica si el usuario tiene un rol específico.
 * Se usa con @UseGuards(AuthGuard, new RoleGuard(['ADMIN', 'EDITOR']))
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    return true;
  }
}
