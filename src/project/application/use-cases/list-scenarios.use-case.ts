// filepath: src/project/application/use-cases/list-scenarios.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { Scenario } from '../../domain/scenario.types';

@Injectable()
export class ListScenariosUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async execute(userId: string, projectId?: string): Promise<Scenario[]> {
    const resolvedProjectId = await this.resolveProjectId(userId, projectId);
    if (!resolvedProjectId) {
      return [];
    }

    return this.scenarioRepository.findAllByProjectId(resolvedProjectId);
  }

  private async resolveProjectId(userId: string, projectId?: string): Promise<string | null> {
    if (projectId) {
      const project = await this.projectRepository.findById(userId, projectId);
      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }
      return project.id;
    }

    const implicitProject = await this.projectRepository.findImplicitByUserId(userId);
    return implicitProject ? implicitProject.id : null;
  }
}
