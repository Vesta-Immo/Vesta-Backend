import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ErrorModule } from './error/error.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [DatabaseModule, ErrorModule, SecurityModule],
  exports: [DatabaseModule, ErrorModule, SecurityModule],
})
export class CoreModule {}
