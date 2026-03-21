import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Module({
  providers: [ApiKeyGuard, SupabaseAuthGuard],
  exports: [ApiKeyGuard, SupabaseAuthGuard],
})
export class SecurityModule {}
