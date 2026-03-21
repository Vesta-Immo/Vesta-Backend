import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common/interfaces';
import {
  SUPABASE_SUPPORTED_JWT_ALGORITHMS,
  SupabaseAuthGuard,
} from './supabase-auth.guard';
import { createRemoteJWKSet, jwtVerify } from 'jose';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

const mockedCreateRemoteJWKSet = jest.mocked(createRemoteJWKSet);
const mockedJwtVerify = jest.mocked(jwtVerify);

const createExecutionContext = (
  headers: Record<string, string | string[] | undefined>,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  }) as unknown as ExecutionContext;

describe('SupabaseAuthGuard', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedCreateRemoteJWKSet.mockReturnValue(
      jest.fn() as unknown as ReturnType<typeof createRemoteJWKSet>,
    );
  });

  it('throws when SUPABASE_URL is missing', async () => {
    const configService = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    const guard = new SupabaseAuthGuard(configService);

    await expect(guard.canActivate(createExecutionContext({}))).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws when Authorization header is missing', async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'SUPABASE_URL') {
          return 'https://yrnmdpqapptuehhqmghz.supabase.co';
        }

        return undefined;
      }),
    } as unknown as ConfigService;

    const guard = new SupabaseAuthGuard(configService);

    await expect(guard.canActivate(createExecutionContext({}))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('verifies token with Supabase issuer, audience and supported algorithms', async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'SUPABASE_URL') {
          return 'https://yrnmdpqapptuehhqmghz.supabase.co';
        }

        if (key === 'SUPABASE_JWT_AUDIENCE') {
          return 'authenticated';
        }

        return undefined;
      }),
    } as unknown as ConfigService;

    mockedJwtVerify.mockResolvedValue({
      payload: {
        sub: '1825b223-a69d-46fc-835c-52c99ad0b480',
        email: 'robindijoux@gmail.com',
      },
      protectedHeader: {
        alg: 'ES256',
      },
      key: {} as never,
    });

    const guard = new SupabaseAuthGuard(configService);
    const context = createExecutionContext({
      authorization: 'Bearer valid-token',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockedJwtVerify).toHaveBeenCalledTimes(1);
    expect(mockedJwtVerify).toHaveBeenCalledWith(
      'valid-token',
      expect.any(Function),
      {
        issuer: 'https://yrnmdpqapptuehhqmghz.supabase.co/auth/v1',
        audience: 'authenticated',
        algorithms: [...SUPABASE_SUPPORTED_JWT_ALGORITHMS],
      },
    );
  });
});
