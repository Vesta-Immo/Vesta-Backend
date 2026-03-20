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

  execute(command: SavePropertyListFinancingSettingsCommand): void {
    this.repository.saveFinancingSettings(command);
    this.recomputeUseCase.execute();
  }
}
