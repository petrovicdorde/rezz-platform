import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class CronAuthGuard implements CanActivate {
  private readonly logger = new Logger(CronAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (!secret) {
      this.logger.error(
        'CRON_SECRET is not configured. Cron endpoints are disabled.',
      );
      throw new UnauthorizedException();
    }
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['authorization'];
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = header.slice('Bearer '.length).trim();
    if (token !== secret) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
