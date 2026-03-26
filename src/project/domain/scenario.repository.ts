// filepath: src/project/domain/scenario.repository.ts
import { Scenario, ScenarioInput, ScenarioOutput } from './scenario.types';

export const SCENARIO_REPOSITORY = Symbol('SCENARIO_REPOSITORY');

export interface ScenarioRepository {
  create(projectId: string, name: string, inputParams: ScenarioInput): Promise<Scenario>;
  findById(projectId: string, scenarioId: string): Promise<Scenario | null>;
  findAllByProjectId(projectId: string): Promise<Scenario[]>;
  findByIds(projectId: string, scenarioIds: string[]): Promise<Scenario[]>;
  update(
    projectId: string,
    scenarioId: string,
    data: { name?: string; inputParams?: ScenarioInput; outputResult?: ScenarioOutput | null; isBaseline?: boolean; computedAt?: Date | null },
  ): Promise<Scenario>;
  delete(projectId: string, scenarioId: string): Promise<void>;
  setBaseline(projectId: string, scenarioId: string): Promise<void>;
}
