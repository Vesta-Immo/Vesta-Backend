import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PROPERTY_LIST_REPOSITORY,
  PropertyListRepository,
} from '../../../domain/property-list.repository';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';

@Injectable()
export class RemovePropertyFromListUseCase {
  constructor(
    @Inject(PROPERTY_LIST_REPOSITORY)
    private readonly repository: PropertyListRepository,
    private readonly recomputeUseCase: RecomputePropertyListSimulationUseCase,
  ) {}

  execute(propertyId: string): void {
    const removed = this.repository.removeProperty(propertyId);
    if (!removed) {
      throw new NotFoundException(`Property with id '${propertyId}' was not found`);
    }

    this.recomputeUseCase.execute();
  }
}
