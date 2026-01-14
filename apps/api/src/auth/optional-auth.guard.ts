import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";

/**
 * OptionalAuthGuard
 *
 * Similar to AuthGuard but doesn't throw if no token is present.
 * Populates req.user if a valid token exists, otherwise continues without it.
 *
 * Use this for routes that want to know about the authenticated user but don't require it.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private authGuard = new AuthGuard();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to authenticate, but don't fail if it doesn't work
      await this.authGuard.canActivate(context);
      return true;
    } catch {
      // No valid token present, but that's OK for optional auth
      return true;
    }
  }
}
