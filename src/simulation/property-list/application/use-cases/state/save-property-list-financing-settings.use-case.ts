import { Inject, Injectable } from '@nestjs/common';
import {
  PROPERTY_LIST_REPOSITORY,
  PropertyListRepository,
} from '../../../domain/property-list.repository';
import { PropertyListFinancingSettings } from '../../../domain/property-list.types';
import { RecomputePropertyListSimulationUseCase } from '../recompute-property-list-simulation.use-case';

export type SavePropertyListFinancingSettingsCommand =
  PropertyListFinancingSettings;

@Injectable()
export class SavePropertyListFinancingSettingsUseCase {
  constructor(
    @Inject(PROPERTY_LIST_REPOSITORY)
    private readonly repository: PropertyListRepository,
    private readonly recomputeUseCase: RecomputePropertyListSimulationUseCase,
  ) {}

  async execute(userId: string, command: SavePropertyListFinancingSettingsCommand): Promise<void> {
    await this.repository.saveFinancingSettings(userId, command);
    await this.recomputeUseCase.execute(userId);
  }
}
