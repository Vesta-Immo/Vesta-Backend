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

  async execute(userId: string): Promise<PropertyListStateOutput> {
    return {
      financingSettings: await this.repository.getFinancingSettings(userId),
      properties: await this.repository.listProperties(userId),
      lastSimulation: await this.repository.getLastSimulation(userId),
    };
  }
}
