// filepath: src/project/application/use-cases/create-scenario.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { ProjectFormulaService } from '../../domain/services/project-formula.service';
import { Scenario, ScenarioInput } from '../../domain/scenario.types';

export type CreateScenarioCommand = {
  projectId?: string;
  name: string;
  inputParams: ScenarioInput;
};

@Injectable()
export class CreateScenarioUseCase {
  private static readonly DEFAULT_IMPLICIT_PROJECT_NAME = 'Primary project';

  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
    private readonly projectFormulaService: ProjectFormulaService,
  ) {}

  async execute(userId: string, command: CreateScenarioCommand): Promise<Scenario> {
    const projectId = await this.resolveProjectId(userId, command.projectId);

    // Check if this is the first scenario in the project → becomes baseline
    const existingScenarios = await this.scenarioRepository.findAllByProjectId(projectId);
    const isBaseline = existingScenarios.length === 0;

    // Compute the result
    const outputResult = this.projectFormulaService.execute(command.inputParams);

    // Create the scenario
    const scenario = await this.scenarioRepository.create(
      projectId,
      command.name,
      command.inputParams,
    );

    // Update with computed result and baseline flag
    const updated = await this.scenarioRepository.update(
      projectId,
      scenario.id,
      {
        outputResult,
        isBaseline,
        computedAt: new Date(),
      },
    );

    return updated;
  }

  private async resolveProjectId(userId: string, projectId?: string): Promise<string> {
    if (projectId) {
      const project = await this.projectRepository.findById(userId, projectId);
      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }
      return project.id;
    }

    const implicitProject = await this.projectRepository.findImplicitByUserId(userId);
    if (implicitProject) {
      return implicitProject.id;
    }

    const createdImplicitProject = await this.projectRepository.createImplicit(
      userId,
      CreateScenarioUseCase.DEFAULT_IMPLICIT_PROJECT_NAME,
    );
    return createdImplicitProject.id;
  }
}
