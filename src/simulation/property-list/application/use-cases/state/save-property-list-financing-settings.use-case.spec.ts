import { SavePropertyListFinancingSettingsUseCase } from './save-property-list-financing-settings.use-case';
import { PropertyListRepository } from '../../../domain/property-list.repository';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';

describe('SavePropertyListFinancingSettingsUseCase', () => {
  it('saves settings and triggers recompute', async () => {
    const repository: PropertyListRepository = {
      saveFinancingSettings: jest.fn().mockResolvedValue(undefined),
      getFinancingSettings: jest.fn().mockResolvedValue(null),
      addProperty: jest.fn().mockResolvedValue(undefined),
      listProperties: jest.fn().mockResolvedValue([]),
      removeProperty: jest.fn().mockResolvedValue(false),
      saveLastSimulation: jest.fn().mockResolvedValue(undefined),
      getLastSimulation: jest.fn().mockResolvedValue(null),
    };

    const recomputeUseCase: Pick<RecomputePropertyListSimulationUseCase, 'execute'> = {
      execute: jest.fn().mockResolvedValue(null),
    };

    const useCase = new SavePropertyListFinancingSettingsUseCase(
      repository,
      recomputeUseCase as RecomputePropertyListSimulationUseCase,
    );

    await useCase.execute('user-1', {
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });

    expect(repository.saveFinancingSettings).toHaveBeenCalledTimes(1);
    expect(repository.saveFinancingSettings).toHaveBeenCalledWith('user-1', {
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });
    expect(recomputeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(recomputeUseCase.execute).toHaveBeenCalledWith('user-1');
  });
});
