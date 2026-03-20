import { Inject, Injectable } from '@nestjs/common';
import {
  PROPERTY_LIST_REPOSITORY,
  PropertyListRepository,
} from '../../../domain/property-list.repository';
import { PropertyListStateOutput } from '../../../domain/property-list.types';

@Injectable()
export class GetPropertyListStateUseCase {
  constructor(
    @Inject(PROPERTY_LIST_REPOSITORY)
    private readonly repository: PropertyListRepository,
  ) {}

  execute(): PropertyListStateOutput {
    return {
      financingSettings: this.repository.getFinancingSettings(),
      properties: this.repository.listProperties(),
      lastSimulation: this.repository.getLastSimulation(),
    };
  }
}
