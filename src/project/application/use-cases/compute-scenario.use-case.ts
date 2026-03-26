// filepath: src/project/application/use-cases/compute-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { ProjectFormulaService } from '../../domain/services/project-formula.service';
import { Scenario } from '../../domain/scenario.types';

@Injectable()
export class ComputeScenarioUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
    private readonly projectFormulaService: ProjectFormulaService,
  ) {}

  async execute(userId: string, projectId: string, scenarioId: string): Promise<Scenario> {
    const project = await this.projectRepository.findById(userId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const existing = await this.scenarioRepository.findById(projectId, scenarioId);
    if (!existing) {
      throw new NotFoundException(`Scenario ${scenarioId} not found`);
    }

    // Recompute without persisting new inputParams (read-only compute)
    const outputResult = this.projectFormulaService.execute(existing.inputParams);

    // Persist the new result and timestamp
    return this.scenarioRepository.update(projectId, scenarioId, {
      outputResult,
      computedAt: new Date(),
    });
  }
}
