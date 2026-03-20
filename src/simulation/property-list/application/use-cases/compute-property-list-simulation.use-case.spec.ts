import { BadRequestException } from '@nestjs/common';
import { ComputePropertyListSimulationUseCase } from './compute-property-list-simulation.use-case';
import { RecomputePropertyListSimulationUseCase } from './recompute-property-list-simulation.use-case';
import {
  DebtRatioLevel,
  PropertyTrackingStatus,
  PropertyType,
} from '../../domain/property-list.types';

describe('ComputePropertyListSimulationUseCase', () => {
  it('throws when financing settings are missing', () => {
    const recomputeUseCase: Pick<RecomputePropertyListSimulationUseCase, 'execute'> = {
      execute: jest.fn().mockReturnValue(null),
    };

    const useCase = new ComputePropertyListSimulationUseCase(
      recomputeUseCase as RecomputePropertyListSimulationUseCase,
    );

    expect(() => useCase.execute()).toThrow(BadRequestException);
  });

  it('computes from persisted settings and properties', () => {
    const recomputeUseCase: Pick<RecomputePropertyListSimulationUseCase, 'execute'> = {
      execute: jest.fn().mockReturnValue({
        annualRatePercent: 3.6,
        durationMonths: 300,
        downPayment: 10000,
        annualHouseholdIncome: 72000,
        monthlyCurrentDebtPayments: 500,
        results: [
          {
            id: 'prop-1',
            status: PropertyTrackingStatus.VISITED,
            propertyType: PropertyType.OLD,
            departmentCode: '69',
            addressOrSector: 'Lyon 7e - Gerland',
            price: 250000,
            notaryFees: 19500,
            totalRenovationBudget: 20000,
            requiredLoanAmount: 279500,
            monthlyCreditPayment: 1475,
            monthlyPaymentWithCharges: 1725,
            debtRatioPercent: 32.92,
            debtRatioLevel: DebtRatioLevel.OK,
          },
        ],
      }),
    };

    const useCase = new ComputePropertyListSimulationUseCase(
      recomputeUseCase as RecomputePropertyListSimulationUseCase,
    );

    const result = useCase.execute();

    expect(result.results).toHaveLength(1);
    expect(result.results[0].notaryFees).toBe(19500);
    expect(result.results[0].requiredLoanAmount).toBe(279500);
    expect(result.results[0].debtRatioLevel).toBe(DebtRatioLevel.OK);
    expect(result.results[0].monthlyPaymentWithCharges).toBeGreaterThan(
      result.results[0].monthlyCreditPayment,
    );
  });
});
