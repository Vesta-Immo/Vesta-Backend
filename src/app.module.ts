import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CoreModule, SimulationModule],
})
export class AppModule {}
