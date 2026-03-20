import Decimal from 'decimal.js';
import { TargetBudgetInput, TargetBudgetOutput } from '../target-budget.types';
import { roundCurrency } from '../../../../shared-kernel/rounding-policy';

export class TargetBudgetFormulaService {
  compute(command: TargetBudgetInput): TargetBudgetOutput {
    const targetBudget = new Decimal(command.borrowingCapacity)
      .add(command.downPayment)
      .sub(command.estimatedRenovationCosts);

    return {
      targetBudget: roundCurrency(Decimal.max(0, targetBudget)).toNumber(),
    };
  }
}
