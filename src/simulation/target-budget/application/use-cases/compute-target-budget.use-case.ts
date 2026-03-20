import { Injectable } from '@nestjs/common';
import { TargetBudgetFormulaService } from '../../domain/services/target-budget-formula.service';
import { TargetBudgetInput, TargetBudgetOutput } from '../../domain/target-budget.types';

export type ComputeTargetBudgetCommand = TargetBudgetInput;
export type ComputeTargetBudgetResult = TargetBudgetOutput;

@Injectable()
export class ComputeTargetBudgetUseCase {
  constructor(
    private readonly formulaService: TargetBudgetFormulaService,
  ) {}

  execute(command: ComputeTargetBudgetCommand): ComputeTargetBudgetResult {
    return this.formulaService.compute(command);
  }
}
