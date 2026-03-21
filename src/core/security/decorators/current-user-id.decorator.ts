import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from '../guards/supabase-auth.guard';

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is missing from request context');
    }

    return userId;
  },
);
