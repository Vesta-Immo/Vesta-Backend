import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompareScenariosUseCase } from './compare-scenarios.use-case';
import { ProjectRepository } from '../../domain/project.repository';
import { ScenarioRepository } from '../../domain/scenario.repository';
import { ScenarioComparatorService } from '../../domain/services/scenario-comparator.service';
import { Scenario } from '../../domain/scenario.types';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';

describe('CompareScenariosUseCase', () => {
  const mockProjectRepository = { findById: jest.fn() };
  const mockScenarioRepository = { findByIds: jest.fn() };

  const comparatorService = new ScenarioComparatorService();
  const useCase = new CompareScenariosUseCase(
    mockProjectRepository as unknown as ProjectRepository,
    mockScenarioRepository as unknown as ScenarioRepository,
    comparatorService,
  );

  const makeScenario = (id: string, isBaseline = false): Scenario => ({
    id,
    projectId: 'proj-1',
    name: `Scenario ${id}`,
    inputParams: {
      annualHouseholdIncome: 54000,
      monthlyCurrentDebtPayments: 200,
      annualRatePercent: 3.5,
      durationMonths: 240,
      maxDebtRatioPercent: 35,
      downPayment: 15000,
      propertyType: PropertyType.OLD,
    },
    outputResult: {
      monthlyPaymentCapacity: 1450,
      borrowingCapacity: 280000,
      notaryFees: 23000,
      totalBudget: 272000,
      monthlyCreditPayment: 1450,
      computedAt: '2026-03-25T10:00:00.000Z',
      computationVersion: '1.0.0',
    },
    isBaseline,
    computedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if project does not exist', async () => {
    mockProjectRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'proj-1', ['sc-1', 'sc-2']),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if fewer than 2 scenarios', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1' });

    await expect(
      useCase.execute('user-1', 'proj-1', ['sc-1']),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if any scenario is missing', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1' });
    mockScenarioRepository.findByIds.mockResolvedValue([makeScenario('sc-1')]);

    await expect(
      useCase.execute('user-1', 'proj-1', ['sc-1', 'non-existent']),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return comparison with insights and deltas', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1' });
    mockScenarioRepository.findByIds.mockResolvedValue([
      makeScenario('sc-baseline', true),
      makeScenario('sc-2'),
    ]);

    const result = await useCase.execute('user-1', 'proj-1', ['sc-baseline', 'sc-2']);

    expect(result.scenarios).toHaveLength(2);
    expect(result.insights.bestMonthlyPayment).toBeDefined();
    expect(result.insights.highestBorrowingCapacity).toBeDefined();
    expect(result.insights.highestTotalBudget).toBeDefined();
    expect(result.deltas['sc-2']).toBeDefined();
  });

  it('should return empty deltas when no baseline', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1' });
    mockScenarioRepository.findByIds.mockResolvedValue([
      makeScenario('sc-1', false),
      makeScenario('sc-2', false),
    ]);

    const result = await useCase.execute('user-1', 'proj-1', ['sc-1', 'sc-2']);

    expect(result.deltas).toEqual({});
  });
});
