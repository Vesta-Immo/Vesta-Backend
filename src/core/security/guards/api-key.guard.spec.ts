import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { ApiKeyGuard } from './api-key.guard';

const createExecutionContext = (
  headers: Record<string, string | string[] | undefined>,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  }) as unknown as ExecutionContext;

describe('ApiKeyGuard', () => {
  it('throws when API key is missing and optional mode is disabled', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'API_KEY') {
          return undefined;
        }

        return undefined;
      }),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);

    expect(() => guard.canActivate(createExecutionContext({}))).toThrow(
      ServiceUnavailableException,
    );
  });

  it('allows requests when API key is optional and not configured', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'API_KEY_OPTIONAL') {
          return 'true';
        }

        return undefined;
      }),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);

    expect(guard.canActivate(createExecutionContext({}))).toBe(true);
  });

  it('throws when API key is invalid', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'API_KEY') {
          return 'expected-key';
        }

        return undefined;
      }),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);

    expect(() =>
      guard.canActivate(
        createExecutionContext({
          'x-api-key': 'wrong-key',
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('allows request when API key matches', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'API_KEY') {
          return 'expected-key';
        }

        return undefined;
      }),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);

    expect(
      guard.canActivate(
        createExecutionContext({
          'x-api-key': 'expected-key',
        }),
      ),
    ).toBe(true);
  });
});