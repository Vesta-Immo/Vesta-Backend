import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredApiKey = this.configService.get<string>('API_KEY');
    const apiKeyOptional =
      (this.configService.get<string>('API_KEY_OPTIONAL') ?? '').toLowerCase() ===
      'true';

    if (!configuredApiKey) {
      if (apiKeyOptional) {
        return true;
      }

      throw new ServiceUnavailableException('API key is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (typeof apiKey !== 'string') {
      throw new UnauthorizedException('Invalid API key');
    }

    const configuredBuffer = Buffer.from(configuredApiKey);
    const receivedBuffer = Buffer.from(apiKey);

    const matches =
      configuredBuffer.length === receivedBuffer.length &&
      timingSafeEqual(configuredBuffer, receivedBuffer);

    if (!matches) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
