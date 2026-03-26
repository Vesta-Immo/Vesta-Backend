import { NotFoundException } from '@nestjs/common';
import { CreateScenarioUseCase } from './create-scenario.use-case';
import { ProjectRepository } from '../../domain/project.repository';
import { ScenarioRepository } from '../../domain/scenario.repository';
import { ProjectFormulaService } from '../../domain/services/project-formula.service';
import { ScenarioInput } from '../../domain/scenario.types';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';

describe('CreateScenarioUseCase', () => {
  const mockProjectRepository = {
    findById: jest.fn(),
    create: jest.fn(),
    findAllByProjectId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockScenarioRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAllByProjectId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIds: jest.fn(),
    setBaseline: jest.fn(),
  };

  const mockFormulaService = {
    execute: jest.fn(),
  };

  const useCase = new CreateScenarioUseCase(
    mockProjectRepository as unknown as ProjectRepository,
    mockScenarioRepository as unknown as ScenarioRepository,
    mockFormulaService as unknown as ProjectFormulaService,
  );

  const validInput: ScenarioInput = {
    annualHouseholdIncome: 54000,
    monthlyCurrentDebtPayments: 200,
    annualRatePercent: 3.5,
    durationMonths: 240,
    maxDebtRatioPercent: 35,
    downPayment: 15000,
    propertyType: PropertyType.OLD,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if project does not exist', async () => {
    mockProjectRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', { projectId: 'proj-1', name: 'Test', inputParams: validInput }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create scenario with computed output', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1', userId: 'user-1', name: 'Test', location: null, createdAt: new Date(), updatedAt: new Date() });
    mockScenarioRepository.findAllByProjectId.mockResolvedValue([]);
    mockScenarioRepository.create.mockResolvedValue({
      id: 'sc-1',
      projectId: 'proj-1',
      name: 'Test',
      inputParams: validInput,
      outputResult: null,
      isBaseline: false,
      computedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockScenarioRepository.update.mockResolvedValue({
      id: 'sc-1',
      projectId: 'proj-1',
      name: 'Test',
      inputParams: validInput,
      outputResult: { monthlyPaymentCapacity: 1450, borrowingCapacity: 280000, notaryFees: 23000, totalBudget: 272000, monthlyCreditPayment: 1450, computedAt: '2026-03-25T10:00:00.000Z', computationVersion: '1.0.0' },
      isBaseline: true,
      computedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockFormulaService.execute.mockReturnValue({
      monthlyPaymentCapacity: 1450,
      borrowingCapacity: 280000,
      notaryFees: 23000,
      totalBudget: 272000,
      monthlyCreditPayment: 1450,
      computedAt: '2026-03-25T10:00:00.000Z',
      computationVersion: '1.0.0',
    });

    const result = await useCase.execute('user-1', { projectId: 'proj-1', name: 'Test', inputParams: validInput });

    expect(result.isBaseline).toBe(true);
    expect(result.outputResult).not.toBeNull();
    expect(mockFormulaService.execute).toHaveBeenCalledWith(validInput);
  });

  it('should set first scenario as baseline', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1', userId: 'user-1', name: 'Test', location: null, createdAt: new Date(), updatedAt: new Date() });
    mockScenarioRepository.findAllByProjectId.mockResolvedValue([]); // No existing scenarios
    mockScenarioRepository.create.mockResolvedValue({ id: 'sc-1', projectId: 'proj-1', name: 'Test', inputParams: validInput, outputResult: null, isBaseline: false, computedAt: null, createdAt: new Date(), updatedAt: new Date() });
    mockScenarioRepository.update.mockResolvedValue({ id: 'sc-1', projectId: 'proj-1', name: 'Test', inputParams: validInput, outputResult: { monthlyPaymentCapacity: 1450, borrowingCapacity: 280000, notaryFees: 23000, totalBudget: 272000, monthlyCreditPayment: 1450, computedAt: '2026-03-25T10:00:00.000Z', computationVersion: '1.0.0' }, isBaseline: true, computedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    mockFormulaService.execute.mockReturnValue({ monthlyPaymentCapacity: 1450, borrowingCapacity: 280000, notaryFees: 23000, totalBudget: 272000, monthlyCreditPayment: 1450, computedAt: '2026-03-25T10:00:00.000Z', computationVersion: '1.0.0' });

    const result = await useCase.execute('user-1', { projectId: 'proj-1', name: 'Test', inputParams: validInput });

    expect(result.isBaseline).toBe(true);
  });

  it('should not set baseline if project already has scenarios', async () => {
    mockProjectRepository.findById.mockResolvedValue({ id: 'proj-1', userId: 'user-1', name: 'Test', location: null, createdAt: new Date(), updatedAt: new Date() });
    mockScenarioRepository.findAllByProjectId.mockResolvedValue([{ id: 'existing-sc' }]);
    mockScenarioRepository.create.mockResolvedValue({ id: 'sc-2', projectId: 'proj-1', name: 'Test 2', inputParams: validInput, outputResult: null, isBaseline: false, computedAt: null, createdAt: new Date(), updatedAt: new Date() });
    mockScenarioRepository.update.mockResolvedValue({ id: 'sc-2', projectId: 'proj-1', name: 'Test 2', inputParams: validInput, outputResult: { monthlyPaymentCapacity: 1450, borrowingCapacity: 280000, notaryFees: 23000, totalBudget: 272000, monthlyCreditPayment: 1450, computedAt: '2026-03-25T10:00:00.000Z', computationVersion: '1.0.0' }, isBaseline: false, computedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    mockFormulaService.execute.mockReturnValue({ monthlyPaymentCapacity: 1450, borrowingCapacity: 280000, notaryFees: 23000, totalBudget: 272000, monthlyCreditPayment: 1450, computedAt: '2026-03-25T10:00:00.000Z', computationVersion: '1.0.0' });

    const result = await useCase.execute('user-1', { projectId: 'proj-1', name: 'Test 2', inputParams: validInput });

    expect(result.isBaseline).toBe(false);
  });
});
