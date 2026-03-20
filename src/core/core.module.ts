import { Module } from '@nestjs/common';
import { ErrorModule } from './error/error.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [ErrorModule, SecurityModule],
  exports: [ErrorModule, SecurityModule],
})
export class CoreModule {}
