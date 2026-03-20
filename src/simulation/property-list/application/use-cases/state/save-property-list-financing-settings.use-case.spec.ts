import { SavePropertyListFinancingSettingsUseCase } from './save-property-list-financing-settings.use-case';
import { PropertyListRepository } from '../../../domain/property-list.repository';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';

describe('SavePropertyListFinancingSettingsUseCase', () => {
  it('saves settings and triggers recompute', () => {
    const repository: PropertyListRepository = {
      saveFinancingSettings: jest.fn(),
      getFinancingSettings: jest.fn(),
      addProperty: jest.fn(),
      listProperties: jest.fn(),
      removeProperty: jest.fn(),
      saveLastSimulation: jest.fn(),
      getLastSimulation: jest.fn(),
    };

    const recomputeUseCase: Pick<RecomputePropertyListSimulationUseCase, 'execute'> = {
      execute: jest.fn(),
    };

    const useCase = new SavePropertyListFinancingSettingsUseCase(
      repository,
      recomputeUseCase as RecomputePropertyListSimulationUseCase,
    );

    useCase.execute({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });

    expect(repository.saveFinancingSettings).toHaveBeenCalledTimes(1);
    expect(recomputeUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
