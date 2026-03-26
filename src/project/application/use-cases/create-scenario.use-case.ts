// filepath: src/project/application/use-cases/create-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { ProjectFormulaService } from '../../domain/services/project-formula.service';
import { Scenario, ScenarioInput } from '../../domain/scenario.types';

export type CreateScenarioCommand = {
  projectId: string;
  name: string;
  inputParams: ScenarioInput;
};

@Injectable()
export class CreateScenarioUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
    private readonly projectFormulaService: ProjectFormulaService,
  ) {}

  async execute(userId: string, command: CreateScenarioCommand): Promise<Scenario> {
    // Verify project exists and belongs to user
    const project = await this.projectRepository.findById(userId, command.projectId);
    if (!project) {
      throw new NotFoundException(`Project ${command.projectId} not found`);
    }

    // Check if this is the first scenario in the project → becomes baseline
    const existingScenarios = await this.scenarioRepository.findAllByProjectId(command.projectId);
    const isBaseline = existingScenarios.length === 0;

    // Compute the result
    const outputResult = this.projectFormulaService.execute(command.inputParams);

    // Create the scenario
    const scenario = await this.scenarioRepository.create(
      command.projectId,
      command.name,
      command.inputParams,
    );

    // Update with computed result and baseline flag
    const updated = await this.scenarioRepository.update(
      command.projectId,
      scenario.id,
      {
        outputResult,
        isBaseline,
        computedAt: new Date(),
      },
    );

    return updated;
  }
}
