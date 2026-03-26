import { ProjectFormulaService } from './project-formula.service';
import { BorrowingCapacityFormulaService } from '../../../simulation/borrowing-capacity/domain/services/borrowing-capacity-formula.service';
import { NotaryFeesRulesService } from '../../../simulation/notary-fees/domain/services/notary-fees-rules.service';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';

describe('ProjectFormulaService', () => {
  const borrowingService = new BorrowingCapacityFormulaService();
  const notaryService = new NotaryFeesRulesService();
  const service = new ProjectFormulaService(borrowingService, notaryService);

  const baseInput = {
    annualHouseholdIncome: 54000, // 4500€/mois
    monthlyCurrentDebtPayments: 200,
    annualRatePercent: 3.5,
    durationMonths: 240,
    maxDebtRatioPercent: 35,
    downPayment: 15000,
    propertyType: 'OLD' as PropertyType,
  };

  it('should compute borrowing capacity and total budget correctly', () => {
    const result = service.execute(baseInput);

    expect(result.borrowingCapacity).toBeGreaterThan(0);
    // totalBudget = borrowingCapacity + downPayment - notaryFees
    // notaryFees ≈ 7.8% of (borrowingCapacity + downPayment) > downPayment for OLD property
    // → totalBudget < borrowingCapacity + downPayment
    expect(result.totalBudget).toBeLessThan(result.borrowingCapacity + baseInput.downPayment);
    expect(result.notaryFees).toBeGreaterThan(0);
    expect(result.monthlyPaymentCapacity).toBeGreaterThan(0);
    expect(result.monthlyCreditPayment).toBeGreaterThan(0);
  });

  it('should return positive monthly payment capacity', () => {
    const input = { ...baseInput, monthlyCurrentDebtPayments: 500 };
    const result = service.execute(input);

    expect(result.monthlyPaymentCapacity).toBeGreaterThan(0);
  });

  it('should apply correct notary fee rate for OLD property', () => {
    const inputOld = { ...baseInput, propertyType: 'OLD' as PropertyType };
    const inputNew = { ...baseInput, propertyType: 'NEW' as PropertyType };

    const resultOld = service.execute(inputOld);
    const resultNew = service.execute(inputNew);

    // OLD: 7.8% vs NEW: 2.8% → OLD should have higher notary fees
    expect(resultOld.notaryFees).toBeGreaterThan(resultNew.notaryFees);
  });

  it('should add 0.2% surcharge for Paris departments', () => {
    const inputParis = { ...baseInput, departmentCode: '75', propertyType: 'OLD' as PropertyType };
    const inputLyon = { ...baseInput, departmentCode: '69', propertyType: 'OLD' as PropertyType };

    const resultParis = service.execute(inputParis);
    const resultLyon = service.execute(inputLyon);

    expect(resultParis.notaryFees).toBeGreaterThan(resultLyon.notaryFees);
  });

  it('should set computedAt and computationVersion', () => {
    const result = service.execute(baseInput);

    expect(result.computedAt).toBeDefined();
    expect(result.computationVersion).toBe('1.0.0');
    expect(new Date(result.computedAt).toISOString()).toBe(result.computedAt);
  });

  it('should compute totalBudget = borrowingCapacity + downPayment - notaryFees', () => {
    const result = service.execute(baseInput);

    const expectedTotal = result.borrowingCapacity + baseInput.downPayment - result.notaryFees;
    expect(result.totalBudget).toBeCloseTo(expectedTotal, 2);
  });

  it('should return monthlyCreditPayment equal to monthlyPaymentCapacity when no other debts', () => {
    const input = { ...baseInput, monthlyCurrentDebtPayments: 0 };
    const result = service.execute(input);

    expect(result.monthlyCreditPayment).toBe(result.monthlyPaymentCapacity);
  });
});
