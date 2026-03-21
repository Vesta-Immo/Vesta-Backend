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

  async execute(userId: string, propertyId: string): Promise<void> {
    const removed = await this.repository.removeProperty(userId, propertyId);
    if (!removed) {
      throw new NotFoundException(`Property with id '${propertyId}' was not found`);
    }

    await this.recomputeUseCase.execute(userId);
  }
}
