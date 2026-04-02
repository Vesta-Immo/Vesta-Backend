import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { SimulationModule } from './simulation/simulation.module';
import { ProjectModule } from './project/project.module';
import { FinancingProfileModule } from './financing-profile/financing-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    SimulationModule,
    ProjectModule,
    FinancingProfileModule,
  ],
})
export class AppModule {}
