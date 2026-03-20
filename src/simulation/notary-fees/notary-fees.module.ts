import { Module } from '@nestjs/common';
import { ComputeNotaryFeesUseCase } from './application/use-cases/compute-notary-fees.use-case';
import { NotaryFeesRulesService } from './domain/services/notary-fees-rules.service';
import { NotaryFeesController } from './infrastructure/http/notary-fees.controller';

@Module({
  controllers: [NotaryFeesController],
  providers: [NotaryFeesRulesService, ComputeNotaryFeesUseCase],
})
export class NotaryFeesModule {}
