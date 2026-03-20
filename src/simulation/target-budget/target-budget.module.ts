import { Module } from '@nestjs/common';
import { ComputeTargetBudgetUseCase } from './application/use-cases/compute-target-budget.use-case';
import { TargetBudgetFormulaService } from './domain/services/target-budget-formula.service';
import { TargetBudgetController } from './infrastructure/http/target-budget.controller';

@Module({
  controllers: [TargetBudgetController],
  providers: [TargetBudgetFormulaService, ComputeTargetBudgetUseCase],
})
export class TargetBudgetModule {}
