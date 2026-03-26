// filepath: src/project/application/use-cases/delete-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';

@Injectable()
export class DeleteScenarioUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async execute(userId: string, projectId: string, scenarioId: string): Promise<void> {
    const project = await this.projectRepository.findById(userId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const existing = await this.scenarioRepository.findById(projectId, scenarioId);
    if (!existing) {
      throw new NotFoundException(`Scenario ${scenarioId} not found`);
    }

    await this.scenarioRepository.delete(projectId, scenarioId);
  }
}
