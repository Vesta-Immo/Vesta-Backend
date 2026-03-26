// filepath: src/project/application/use-cases/update-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { ProjectFormulaService } from '../../domain/services/project-formula.service';
import { Scenario, ScenarioInput } from '../../domain/scenario.types';

export type UpdateScenarioCommand = {
  projectId: string;
  scenarioId: string;
  name?: string;
  inputParams?: Partial<ScenarioInput>;
};

@Injectable()
export class UpdateScenarioUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
    private readonly projectFormulaService: ProjectFormulaService,
  ) {}

  async execute(userId: string, command: UpdateScenarioCommand): Promise<Scenario> {
    const project = await this.projectRepository.findById(userId, command.projectId);
    if (!project) {
      throw new NotFoundException(`Project ${command.projectId} not found`);
    }

    const existing = await this.scenarioRepository.findById(command.projectId, command.scenarioId);
    if (!existing) {
      throw new NotFoundException(`Scenario ${command.scenarioId} not found`);
    }

    // Merge input params if provided
    const newInputParams =
      command.inputParams !== undefined
        ? { ...existing.inputParams, ...command.inputParams }
        : existing.inputParams;

    // Recompute if input params changed
    const outputResult =
      command.inputParams !== undefined
        ? this.projectFormulaService.execute(newInputParams)
        : existing.outputResult;

    const updated = await this.scenarioRepository.update(command.projectId, command.scenarioId, {
      name: command.name,
      inputParams: command.inputParams !== undefined ? newInputParams : undefined,
      outputResult,
      computedAt: command.inputParams !== undefined ? new Date() : existing.computedAt,
    });

    return updated;
  }
}
