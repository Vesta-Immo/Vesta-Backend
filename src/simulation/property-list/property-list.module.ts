import { Module } from '@nestjs/common';
import { ComputePropertyListSimulationUseCase } from './application/use-cases/compute-property-list-simulation.use-case';
import { PropertyListFormulaService } from './domain/services/property-list-formula.service';
import { PropertyListController } from './infrastructure/http/property-list.controller';
import { InMemoryPropertyListRepository } from './infrastructure/repositories/in-memory-property-list.repository';
import { PROPERTY_LIST_REPOSITORY } from './domain/property-list.repository';
import { SavePropertyListFinancingSettingsUseCase } from './application/use-cases/state/save-property-list-financing-settings.use-case';
import { AddPropertyToListUseCase } from './application/use-cases/state/add-property-to-list.use-case';
import { GetPropertyListStateUseCase } from './application/use-cases/state/get-property-list-state.use-case';
import { RemovePropertyFromListUseCase } from './application/use-cases/state/remove-property-from-list.use-case';
import { NotaryFeesModule } from '../notary-fees/notary-fees.module';
import { RecomputePropertyListSimulationUseCase } from './application/use-cases/recompute-property-list-simulation.use-case';

@Module({
  imports: [NotaryFeesModule],
  controllers: [PropertyListController],
  providers: [
    PropertyListFormulaService,
    {
      provide: PROPERTY_LIST_REPOSITORY,
      useClass: InMemoryPropertyListRepository,
    },
    ComputePropertyListSimulationUseCase,
    RecomputePropertyListSimulationUseCase,
    SavePropertyListFinancingSettingsUseCase,
    AddPropertyToListUseCase,
    GetPropertyListStateUseCase,
    RemovePropertyFromListUseCase,
  ],
})
export class PropertyListModule {}
