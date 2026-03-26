// filepath: src/project/infrastructure/repositories/prisma-scenario.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { Scenario, ScenarioInput, ScenarioOutput } from '../../domain/scenario.types';
import { ScenarioRepository } from '../../domain/scenario.repository';

@Injectable()
export class PrismaScenarioRepository implements ScenarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, name: string, inputParams: ScenarioInput): Promise<Scenario> {
    const scenario = await this.prisma.scenario.create({
      data: { projectId, name, inputParams: inputParams as any },
    });
    return this.mapToDomain(scenario);
  }

  async findById(projectId: string, scenarioId: string): Promise<Scenario | null> {
    const scenario = await this.prisma.scenario.findFirst({
      where: { id: scenarioId, projectId },
    });
    return scenario ? this.mapToDomain(scenario) : null;
  }

  async findAllByProjectId(projectId: string): Promise<Scenario[]> {
    const scenarios = await this.prisma.scenario.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    return scenarios.map(this.mapToDomain);
  }

  async findByIds(projectId: string, scenarioIds: string[]): Promise<Scenario[]> {
    const scenarios = await this.prisma.scenario.findMany({
      where: { projectId, id: { in: scenarioIds } },
    });
    return scenarios.map(this.mapToDomain);
  }

  async update(
    projectId: string,
    scenarioId: string,
    data: {
      name?: string;
      inputParams?: ScenarioInput;
      outputResult?: ScenarioOutput | null;
      isBaseline?: boolean;
      computedAt?: Date | null;
    },
  ): Promise<Scenario> {
    const scenario = await this.prisma.scenario.update({
      where: { id: scenarioId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.inputParams !== undefined && { inputParams: data.inputParams as any }),
        ...(data.outputResult !== undefined && { outputResult: data.outputResult as any }),
        ...(data.isBaseline !== undefined && { isBaseline: data.isBaseline }),
        ...(data.computedAt !== undefined && { computedAt: data.computedAt }),
      },
    });
    return this.mapToDomain(scenario);
  }

  async delete(projectId: string, scenarioId: string): Promise<void> {
    await this.prisma.scenario.delete({ where: { id: scenarioId } });
  }

  async setBaseline(projectId: string, scenarioId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.scenario.updateMany({
        where: { projectId, isBaseline: true },
        data: { isBaseline: false },
      }),
      this.prisma.scenario.update({
        where: { id: scenarioId },
        data: { isBaseline: true },
      }),
    ]);
  }

  private mapToDomain(scenario: {
    id: string;
    projectId: string;
    name: string;
    inputParams: unknown;
    outputResult: unknown;
    isBaseline: boolean;
    computedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Scenario {
    return {
      id: scenario.id,
      projectId: scenario.projectId,
      name: scenario.name,
      inputParams: scenario.inputParams as ScenarioInput,
      outputResult: scenario.outputResult as ScenarioOutput | null,
      isBaseline: scenario.isBaseline,
      computedAt: scenario.computedAt,
      createdAt: scenario.createdAt,
      updatedAt: scenario.updatedAt,
    };
  }
}
