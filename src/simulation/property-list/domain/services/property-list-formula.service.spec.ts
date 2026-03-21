import { PropertyListFormulaService } from './property-list-formula.service';
import {
  DebtRatioLevel,
  PropertyTrackingStatus,
  PropertyType,
} from '../property-list.types';

describe('PropertyListFormulaService', () => {
  const service = new PropertyListFormulaService();

  it('computes loan amount and monthly payments for each property', () => {
    const result = service.compute({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
      properties: [
        {
          id: 'prop-1',
          status: PropertyTrackingStatus.VISITED,
          propertyType: PropertyType.OLD,
          listingUrl: 'https://www.example.com/annonce/prop-1',
          departmentCode: '69',
          price: 250000,
          notaryFees: 19500,
          addressOrSector: 'Lyon 7e - Gerland',
          propertyTaxAnnual: 1200,
          coOwnershipFeesAnnual: 1800,
          renovationWorkItems: [
            {
              name: 'Kitchen',
              details: 'Cabinets and painting',
              cost: 15000,
            },
            {
              name: 'Bathroom',
              cost: 7000,
            },
          ],
        },
      ],
    });

    expect(result.results).toHaveLength(1);

    const property = result.results[0];
    expect(property.listingUrl).toBe('https://www.example.com/annonce/prop-1');
    expect(property.notaryFees).toBe(19500);
    expect(property.totalRenovationBudget).toBe(22000);
    expect(property.requiredLoanAmount).toBe(281500);
    expect(property.monthlyCreditPayment).toBeGreaterThan(1400);
    expect(property.monthlyPaymentWithCharges).toBeGreaterThan(
      property.monthlyCreditPayment,
    );
    // debtRatioPercent = (monthlyCreditPayment + monthlyCurrentDebtPayments) / monthlyIncome * 100
    // = (1400+ + 500) / 6000 * 100 ≈ 31.6%+
    expect(property.debtRatioPercent).toBeGreaterThan(30);
    expect(property.debtRatioLevel).toBe(DebtRatioLevel.OK);
  });

  it('uses zero floor when down payment exceeds total project cost', () => {
    const result = service.compute({
      annualRatePercent: 2.8,
      durationMonths: 240,
      downPayment: 50000,
      annualHouseholdIncome: 60000,
      monthlyCurrentDebtPayments: 200,
      properties: [
        {
          id: 'prop-2',
          status: PropertyTrackingStatus.WANTED,
          propertyType: PropertyType.NEW,
          price: 40000,
          notaryFees: 1000,
          addressOrSector: 'Rouen centre',
          propertyTaxAnnual: 900,
          coOwnershipFeesAnnual: 1500,
          renovationWorkItems: [
            {
              name: 'Flooring',
              cost: 5000,
            },
          ],
        },
      ],
    });

    expect(result.results[0].requiredLoanAmount).toBe(0);
    expect(result.results[0].monthlyCreditPayment).toBe(0);
    expect(result.results[0].monthlyPaymentWithCharges).toBe(200);
    // debtRatioPercent = (monthlyCreditPayment + monthlyCurrentDebtPayments) / monthlyIncome * 100
    // = (0 + 200) / 5000 * 100 = 4%
    expect(result.results[0].debtRatioPercent).toBe(4);
    expect(result.results[0].debtRatioLevel).toBe(DebtRatioLevel.LOW);
  });

  it('handles zero interest rate', () => {
    const result = service.compute({
      annualRatePercent: 0,
      durationMonths: 100,
      downPayment: 0,
      annualHouseholdIncome: 30000,
      monthlyCurrentDebtPayments: 1000,
      properties: [
        {
          id: 'prop-3',
          status: PropertyTrackingStatus.WANTED,
          propertyType: PropertyType.OLD,
          price: 100000,
          notaryFees: 8000,
          addressOrSector: 'Nantes',
          propertyTaxAnnual: 1200,
          coOwnershipFeesAnnual: 0,
          renovationWorkItems: [],
        },
      ],
    });

    expect(result.results[0].requiredLoanAmount).toBe(108000);
    expect(result.results[0].monthlyCreditPayment).toBe(1080);
    expect(result.results[0].monthlyPaymentWithCharges).toBe(1180);
    // debtRatioPercent = (monthlyCreditPayment + monthlyCurrentDebtPayments) / monthlyIncome * 100
    // = (1080 + 1000) / 2500 * 100 = 83.2%
    expect(result.results[0].debtRatioPercent).toBe(83.2);
    expect(result.results[0].debtRatioLevel).toBe(DebtRatioLevel.HIGH);
  });
});
