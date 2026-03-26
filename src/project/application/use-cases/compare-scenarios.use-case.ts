// filepath: src/project/application/use-cases/compare-scenarios.use-case.ts
import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { SCENARIO_REPOSITORY, ScenarioRepository } from '../../domain/scenario.repository';
import { ScenarioComparatorService, ScenarioComparisonRow } from '../../domain/services/scenario-comparator.service';
import { Scenario } from '../../domain/scenario.types';

export interface CompareScenariosResult {
  scenarios: ScenarioComparisonRow[];
  insights: {
    bestMonthlyPayment: { scenarioId: string; value: number };
    highestBorrowingCapacity: { scenarioId: string; value: number };
    highestTotalBudget: { scenarioId: string; value: number };
  };
  deltas: Record<string, { borrowingCapacityDelta: number; monthlyPaymentDelta: number; totalBudgetDelta: number }>;
}

@Injectable()
export class CompareScenariosUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
    private readonly comparatorService: ScenarioComparatorService,
  ) {}

  async execute(userId: string, projectId: string, scenarioIds: string[]): Promise<CompareScenariosResult> {
    const project = await this.projectRepository.findById(userId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (scenarioIds.length < 2) {
      throw new ForbiddenException('At least 2 scenarios are required for comparison');
    }

    const scenarios = await this.scenarioRepository.findByIds(projectId, scenarioIds);

    if (scenarios.length !== scenarioIds.length) {
      const foundIds = new Set(scenarios.map((s) => s.id));
      const missing = scenarioIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Scenarios not found: ${missing.join(', ')}`);
    }

    const scenarios_ = scenarios as Scenario[];

    const comparisonRows = this.comparatorService.compare(scenarios_);
    const insights = this.comparatorService.getInsights(scenarios_);

    const baseline = scenarios_.find((s) => s.isBaseline);
    const deltas = baseline
      ? this.comparatorService.getDeltas(scenarios_, baseline.id)
      : {};

    return { scenarios: comparisonRows, insights, deltas };
  }
}
