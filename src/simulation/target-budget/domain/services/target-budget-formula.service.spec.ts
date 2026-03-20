import { TargetBudgetFormulaService } from './target-budget-formula.service';

describe('TargetBudgetFormulaService', () => {
  const service = new TargetBudgetFormulaService();

  it('computes target budget correctly', () => {
    const result = service.compute({
      borrowingCapacity: 250000,
      downPayment: 30000,
      estimatedRenovationCosts: 15000,
    });

    expect(result.targetBudget).toBe(265000);
  });

  it('never returns a negative amount', () => {
    const result = service.compute({
      borrowingCapacity: 10000,
      downPayment: 0,
      estimatedRenovationCosts: 50000,
    });

    expect(result.targetBudget).toBe(0);
  });
});
