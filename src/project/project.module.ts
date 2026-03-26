// filepath: src/project/project.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { SecurityModule } from '../core/security/security.module';
import { BorrowingCapacityModule } from '../simulation/borrowing-capacity/borrowing-capacity.module';
import { NotaryFeesModule } from '../simulation/notary-fees/notary-fees.module';
import { ProjectController } from './infrastructure/http/project.controller';
import { ScenarioController } from './infrastructure/http/scenario.controller';
import { PROJECT_REPOSITORY } from './domain/project.repository';
import { SCENARIO_REPOSITORY } from './domain/scenario.repository';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository';
import { PrismaScenarioRepository } from './infrastructure/repositories/prisma-scenario.repository';
import { ProjectFormulaService } from './domain/services/project-formula.service';
import { ScenarioComparatorService } from './domain/services/scenario-comparator.service';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from './application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from './application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { CreateScenarioUseCase } from './application/use-cases/create-scenario.use-case';
import { ListScenariosUseCase } from './application/use-cases/list-scenarios.use-case';
import { GetScenarioUseCase } from './application/use-cases/get-scenario.use-case';
import { UpdateScenarioUseCase } from './application/use-cases/update-scenario.use-case';
import { DeleteScenarioUseCase } from './application/use-cases/delete-scenario.use-case';
import { CopyScenarioUseCase } from './application/use-cases/copy-scenario.use-case';
import { ComputeScenarioUseCase } from './application/use-cases/compute-scenario.use-case';
import { CompareScenariosUseCase } from './application/use-cases/compare-scenarios.use-case';

@Module({
  imports: [DatabaseModule, SecurityModule, BorrowingCapacityModule, NotaryFeesModule],
  controllers: [ProjectController, ScenarioController],
  providers: [
    // Repositories
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
    { provide: SCENARIO_REPOSITORY, useClass: PrismaScenarioRepository },
    PrismaProjectRepository,
    PrismaScenarioRepository,
    // Domain services
    ProjectFormulaService,
    ScenarioComparatorService,
    // Project use-cases
    CreateProjectUseCase,
    ListProjectsUseCase,
    GetProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    // Scenario use-cases
    CreateScenarioUseCase,
    ListScenariosUseCase,
    GetScenarioUseCase,
    UpdateScenarioUseCase,
    DeleteScenarioUseCase,
    CopyScenarioUseCase,
    ComputeScenarioUseCase,
    CompareScenariosUseCase,
  ],
})
export class ProjectModule {}
