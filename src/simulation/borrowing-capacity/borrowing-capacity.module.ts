import { Module } from '@nestjs/common';
import { BorrowingCapacityFormulaService } from './domain/services/borrowing-capacity-formula.service';
import { ComputeBorrowingCapacityUseCase } from './application/use-cases/compute-borrowing-capacity.use-case';
import { BorrowingCapacityController } from './infrastructure/http/borrowing-capacity.controller';

@Module({
  controllers: [BorrowingCapacityController],
  providers: [BorrowingCapacityFormulaService, ComputeBorrowingCapacityUseCase],
})
export class BorrowingCapacityModule {}
