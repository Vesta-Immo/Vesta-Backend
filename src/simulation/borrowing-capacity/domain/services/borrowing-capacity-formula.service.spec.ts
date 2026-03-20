import { BorrowingCapacityFormulaService } from './borrowing-capacity-formula.service';

describe('BorrowingCapacityFormulaService', () => {
  const service = new BorrowingCapacityFormulaService();

  it('computes borrowing capacity with non-zero rate', () => {
    const result = service.compute({
      annualHouseholdIncome: 60000,
      monthlyDebtPayments: 300,
      annualRatePercent: 3.6,
      durationMonths: 300,
      maxDebtRatioPercent: 35,
    });

    expect(result.monthlyPaymentCapacity).toBe(1450);
    expect(result.borrowingCapacity).toBeGreaterThan(260000);
  });

  it('returns zero monthly payment when debts exceed capacity', () => {
    const result = service.compute({
      annualHouseholdIncome: 24000,
      monthlyDebtPayments: 1000,
      annualRatePercent: 3,
      durationMonths: 240,
      maxDebtRatioPercent: 35,
    });

    expect(result.monthlyPaymentCapacity).toBe(0);
    expect(result.borrowingCapacity).toBe(0);
  });
});
