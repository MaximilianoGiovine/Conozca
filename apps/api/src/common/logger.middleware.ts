import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

/**
 * Middleware para logging de todas las peticiones HTTP
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new LoggerService('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.debug(`Incoming request: ${method} ${originalUrl}`);

    // Log response
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const userId = (req as any).user?.sub;

      this.logger.logRequest(method, originalUrl, statusCode, duration, userId);
    });

    next();
  }
}
