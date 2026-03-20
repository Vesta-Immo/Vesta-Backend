import { AddPropertyToListUseCase } from './add-property-to-list.use-case';
import { PropertyListRepository } from '../../../domain/property-list.repository';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';
import { PropertyTrackingStatus, PropertyType } from '../../../domain/property-list.types';

describe('AddPropertyToListUseCase', () => {
  it('adds property and triggers recompute', () => {
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

    const useCase = new AddPropertyToListUseCase(
      repository,
      recomputeUseCase as RecomputePropertyListSimulationUseCase,
    );

    useCase.execute({
      id: 'prop-1',
      status: PropertyTrackingStatus.WANTED,
      propertyType: PropertyType.OLD,
      price: 250000,
      addressOrSector: 'Lyon',
      propertyTaxAnnual: 1200,
      coOwnershipFeesAnnual: 1800,
      renovationWorkItems: [],
    });

    expect(repository.addProperty).toHaveBeenCalledTimes(1);
    expect(recomputeUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
