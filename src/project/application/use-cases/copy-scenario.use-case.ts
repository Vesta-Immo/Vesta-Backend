// filepath: src/project/application/use-cases/copy-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { Scenario } from '../../domain/scenario.types';

export type CopyScenarioCommand = {
  projectId: string;
  scenarioId: string;
  name?: string;
};

@Injectable()
export class CopyScenarioUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async execute(userId: string, command: CopyScenarioCommand): Promise<Scenario> {
    const project = await this.projectRepository.findById(userId, command.projectId);
    if (!project) {
      throw new NotFoundException(`Project ${command.projectId} not found`);
    }

    const existing = await this.scenarioRepository.findById(command.projectId, command.scenarioId);
    if (!existing) {
      throw new NotFoundException(`Scenario ${command.scenarioId} not found`);
    }

    const newName = command.name ?? `Copie de ${existing.name}`;

    // Copy: same inputParams, no outputResult, not baseline
    return this.scenarioRepository.create(command.projectId, newName, existing.inputParams);
  }
}
