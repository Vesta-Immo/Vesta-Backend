import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { PrixImmoService } from './application/prix-immo.service';
import { PrixImmoController } from './infrastructure/prix-immo.controller';

@Module({
  imports: [CoreModule],
  controllers: [PrixImmoController],
  providers: [PrixImmoService],
  exports: [PrixImmoService],
})
export class PrixImmoModule {}