import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JWTVerifyResult, JWTPayload, createRemoteJWKSet, jwtVerify } from 'jose';

export const SUPABASE_SUPPORTED_JWT_ALGORITHMS = ['RS256', 'ES256'] as const;

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwksByIssuer = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new ServiceUnavailableException('SUPABASE_URL is not configured');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const issuer = normalizeIssuer(supabaseUrl);
    const audience =
      this.configService.get<string>('SUPABASE_JWT_AUDIENCE') ?? 'authenticated';

    let verifiedToken: JWTVerifyResult<JWTPayload>;
    try {
      verifiedToken = await jwtVerify(token, this.getJwks(issuer), {
        issuer,
        audience,
        algorithms: [...SUPABASE_SUPPORTED_JWT_ALGORITHMS],
      });
    } catch {
      throw new UnauthorizedException('Invalid Supabase access token');
    }

    const subject = verifiedToken.payload.sub;
    if (!subject) {
      throw new UnauthorizedException('Token payload is missing user subject');
    }

    request.user = {
      id: subject,
      email:
        typeof verifiedToken.payload.email === 'string'
          ? verifiedToken.payload.email
          : undefined,
    };

    return true;
  }

  private getJwks(issuer: string): ReturnType<typeof createRemoteJWKSet> {
    const cached = this.jwksByIssuer.get(issuer);
    if (cached) {
      return cached;
    }

    const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    this.jwksByIssuer.set(issuer, jwks);
    return jwks;
  }
}

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

function normalizeIssuer(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`;
}
