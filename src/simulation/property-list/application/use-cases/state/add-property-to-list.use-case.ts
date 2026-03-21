import { Inject, Injectable } from '@nestjs/common';
import {
  PROPERTY_LIST_REPOSITORY,
  PropertyListRepository,
} from '../../../domain/property-list.repository';
import { PropertyItemInput } from '../../../domain/property-list.types';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';

export type AddPropertyToListCommand = PropertyItemInput;

@Injectable()
export class AddPropertyToListUseCase {
  constructor(
    @Inject(PROPERTY_LIST_REPOSITORY)
    private readonly repository: PropertyListRepository,
    private readonly recomputeUseCase: RecomputePropertyListSimulationUseCase,
  ) {}

  async execute(userId: string, command: AddPropertyToListCommand): Promise<void> {
    await this.repository.addProperty(userId, command);
    await this.recomputeUseCase.execute(userId);
  }
}
