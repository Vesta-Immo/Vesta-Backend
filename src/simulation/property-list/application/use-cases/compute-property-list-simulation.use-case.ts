import { BadRequestException, Injectable } from '@nestjs/common';
import { PropertyListSimulationOutput } from '../../domain/property-list.types';
import { RecomputePropertyListSimulationUseCase } from './recompute-property-list-simulation.use-case';

export type ComputePropertyListSimulationResult = PropertyListSimulationOutput;

@Injectable()
export class ComputePropertyListSimulationUseCase {
  constructor(
    private readonly recomputeUseCase: RecomputePropertyListSimulationUseCase,
  ) {}

  execute(): ComputePropertyListSimulationResult {
    const simulation = this.recomputeUseCase.execute();
    if (!simulation) {
      throw new BadRequestException(
        'Financing settings must be configured before computing the property list simulation',
      );
    }

    return simulation;
  }
}
