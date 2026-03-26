// filepath: src/project/application/use-cases/get-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { Scenario } from '../../domain/scenario.types';

@Injectable()
export class GetScenarioUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async execute(userId: string, projectId: string, scenarioId: string): Promise<Scenario> {
    const project = await this.projectRepository.findById(userId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    const scenario = await this.scenarioRepository.findById(projectId, scenarioId);
    if (!scenario) {
      throw new NotFoundException(`Scenario ${scenarioId} not found`);
    }
    return scenario;
  }
}
