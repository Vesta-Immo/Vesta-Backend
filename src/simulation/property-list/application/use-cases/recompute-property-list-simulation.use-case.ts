import { Inject, Injectable } from '@nestjs/common';
import { ComputeNotaryFeesUseCase, PropertyType as NotaryPropertyType } from '../../../notary-fees/application/use-cases/compute-notary-fees.use-case';
import { PropertyListFormulaService } from '../../domain/services/property-list-formula.service';
import {
  PROPERTY_LIST_REPOSITORY,
  PropertyListRepository,
} from '../../domain/property-list.repository';
import {
  PropertyListSimulationOutput,
  PropertyType,
} from '../../domain/property-list.types';

@Injectable()
export class RecomputePropertyListSimulationUseCase {
  constructor(
    private readonly formulaService: PropertyListFormulaService,
    private readonly computeNotaryFeesUseCase: ComputeNotaryFeesUseCase,
    @Inject(PROPERTY_LIST_REPOSITORY)
    private readonly repository: PropertyListRepository,
  ) {}

  execute(): PropertyListSimulationOutput | null {
    const financingSettings = this.repository.getFinancingSettings();
    if (!financingSettings) {
      this.repository.saveLastSimulation(null);
      return null;
    }

    const propertiesWithNotaryFees = this.repository
      .listProperties()
      .map((property) => {
        const notaryFees = this.computeNotaryFeesUseCase.execute({
          propertyPrice: property.price,
          propertyType:
            property.propertyType === PropertyType.NEW
              ? NotaryPropertyType.NEW
              : NotaryPropertyType.OLD,
          departmentCode: property.departmentCode,
        }).notaryFees;

        return {
          ...property,
          notaryFees,
        };
      });

    const simulation = this.formulaService.compute({
      ...financingSettings,
      properties: propertiesWithNotaryFees,
    });

    this.repository.saveLastSimulation(simulation);
    return simulation;
  }
}
