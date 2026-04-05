import { Module } from '@nestjs/common';
import { BorrowingCapacityModule } from './borrowing-capacity/borrowing-capacity.module';
import { NotaryFeesModule } from './notary-fees/notary-fees.module';
import { PropertyListModule } from './property-list/property-list.module';
import { PrixImmoModule } from './prix-immo/prix-immo.module';
import { TargetBudgetModule } from './target-budget/target-budget.module';

@Module({
  imports: [
    BorrowingCapacityModule,
    TargetBudgetModule,
    NotaryFeesModule,
    PropertyListModule,
    PrixImmoModule,
  ],
})
export class SimulationModule {}
