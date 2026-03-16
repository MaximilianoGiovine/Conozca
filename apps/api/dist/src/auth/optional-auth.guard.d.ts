import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class OptionalAuthGuard implements CanActivate {
    private authGuard;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
