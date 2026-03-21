import { AddPropertyToListUseCase } from './add-property-to-list.use-case';
import { PropertyListRepository } from '../../../domain/property-list.repository';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';
import { PropertyTrackingStatus, PropertyType } from '../../../domain/property-list.types';

describe('AddPropertyToListUseCase', () => {
  it('adds property and triggers recompute', async () => {
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

    const useCase = new AddPropertyToListUseCase(
      repository,
      recomputeUseCase as RecomputePropertyListSimulationUseCase,
    );

    await useCase.execute('user-1', {
      id: 'prop-1',
      status: PropertyTrackingStatus.WANTED,
      propertyType: PropertyType.OLD,
      listingUrl: 'https://www.example.com/annonce/prop-1',
      price: 250000,
      addressOrSector: 'Lyon',
      propertyTaxAnnual: 1200,
      coOwnershipFeesAnnual: 1800,
      renovationWorkItems: [],
    });

    expect(repository.addProperty).toHaveBeenCalledTimes(1);
    expect(repository.addProperty).toHaveBeenCalledWith('user-1', {
      id: 'prop-1',
      status: PropertyTrackingStatus.WANTED,
      propertyType: PropertyType.OLD,
      listingUrl: 'https://www.example.com/annonce/prop-1',
      price: 250000,
      addressOrSector: 'Lyon',
      propertyTaxAnnual: 1200,
      coOwnershipFeesAnnual: 1800,
      renovationWorkItems: [],
    });
    expect(recomputeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(recomputeUseCase.execute).toHaveBeenCalledWith('user-1');
  });
});
