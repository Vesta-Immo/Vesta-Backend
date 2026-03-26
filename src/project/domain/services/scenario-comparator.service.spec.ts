import { ScenarioComparatorService } from './scenario-comparator.service';
import { Scenario } from '../scenario.types';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';

describe('ScenarioComparatorService', () => {
  const service = new ScenarioComparatorService();

  const makeScenario = (overrides: Partial<Scenario> = {}): Scenario => ({
    id: 'sc-1',
    projectId: 'proj-1',
    name: 'Scenario 1',
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
    isBaseline: false,
    computedAt: new Date('2026-03-25T10:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('compare', () => {
    it('should map scenario to comparison row', () => {
      const scenario = makeScenario({ id: 'sc-1', name: '20 ans 3.5%' });
      const rows = service.compare([scenario]);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual({
        scenarioId: 'sc-1',
        scenarioName: '20 ans 3.5%',
        isBaseline: false,
        annualHouseholdIncome: 54000,
        durationMonths: 240,
        annualRatePercent: 3.5,
        downPayment: 15000,
        borrowingCapacity: 280000,
        monthlyPaymentCapacity: 1450,
        monthlyCreditPayment: 1450,
        totalBudget: 272000,
        notaryFees: 23000,
      });
    });

    it('should mark baseline scenario', () => {
      const baseline = makeScenario({ id: 'sc-baseline', isBaseline: true });
      const rows = service.compare([baseline]);

      expect(rows[0].isBaseline).toBe(true);
    });
  });

  describe('getInsights', () => {
    it('should identify scenario with lowest monthly payment', () => {
      const sc1 = makeScenario({ id: 'sc-1', outputResult: { monthlyCreditPayment: 1450, borrowingCapacity: 280000, totalBudget: 272000, notaryFees: 23000, monthlyPaymentCapacity: 1450, computedAt: '', computationVersion: '1.0.0' } });
      const sc2 = makeScenario({ id: 'sc-2', outputResult: { monthlyCreditPayment: 1200, borrowingCapacity: 250000, totalBudget: 242000, notaryFees: 23000, monthlyPaymentCapacity: 1200, computedAt: '', computationVersion: '1.0.0' } });

      const insights = service.getInsights([sc1, sc2]);

      expect(insights.bestMonthlyPayment.scenarioId).toBe('sc-2');
      expect(insights.bestMonthlyPayment.value).toBe(1200);
    });

    it('should identify scenario with highest borrowing capacity', () => {
      const sc1 = makeScenario({ id: 'sc-1', outputResult: { monthlyCreditPayment: 1450, borrowingCapacity: 280000, totalBudget: 272000, notaryFees: 23000, monthlyPaymentCapacity: 1450, computedAt: '', computationVersion: '1.0.0' } });
      const sc2 = makeScenario({ id: 'sc-2', outputResult: { monthlyCreditPayment: 1200, borrowingCapacity: 310000, totalBudget: 302000, notaryFees: 23000, monthlyPaymentCapacity: 1200, computedAt: '', computationVersion: '1.0.0' } });

      const insights = service.getInsights([sc1, sc2]);

      expect(insights.highestBorrowingCapacity.scenarioId).toBe('sc-2');
      expect(insights.highestBorrowingCapacity.value).toBe(310000);
    });

    it('should identify scenario with highest total budget', () => {
      const sc1 = makeScenario({ id: 'sc-1', outputResult: { monthlyCreditPayment: 1450, borrowingCapacity: 280000, totalBudget: 272000, notaryFees: 23000, monthlyPaymentCapacity: 1450, computedAt: '', computationVersion: '1.0.0' } });
      const sc2 = makeScenario({ id: 'sc-2', outputResult: { monthlyCreditPayment: 1200, borrowingCapacity: 250000, totalBudget: 242000, notaryFees: 23000, monthlyPaymentCapacity: 1200, computedAt: '', computationVersion: '1.0.0' } });

      const insights = service.getInsights([sc1, sc2]);

      expect(insights.highestTotalBudget.scenarioId).toBe('sc-1');
      expect(insights.highestTotalBudget.value).toBe(272000);
    });

    it('should throw if no scenarios with results', () => {
      const scNoResult = makeScenario({ outputResult: null });

      expect(() => service.getInsights([scNoResult])).toThrow('No scenarios with results');
    });
  });

  describe('getDeltas', () => {
    it('should compute delta vs baseline correctly', () => {
      const baseline = makeScenario({
        id: 'sc-baseline',
        isBaseline: true,
        outputResult: {
          monthlyCreditPayment: 1450,
          borrowingCapacity: 280000,
          totalBudget: 272000,
          notaryFees: 23000,
          monthlyPaymentCapacity: 1450,
          computedAt: '',
          computationVersion: '1.0.0',
        },
      });
      const sc2 = makeScenario({
        id: 'sc-2',
        outputResult: {
          monthlyCreditPayment: 1200,
          borrowingCapacity: 310000,
          totalBudget: 302000,
          notaryFees: 23000,
          monthlyPaymentCapacity: 1200,
          computedAt: '',
          computationVersion: '1.0.0',
        },
      });

      const deltas = service.getDeltas([baseline, sc2], 'sc-baseline');

      expect(deltas['sc-2']).toEqual({
        borrowingCapacityDelta: 30000,
        monthlyPaymentDelta: -250,
        totalBudgetDelta: 30000,
      });
    });

    it('should throw if baseline not found', () => {
      const sc = makeScenario({ isBaseline: false });

      expect(() => service.getDeltas([sc], 'non-existent')).toThrow('No baseline scenario found');
    });
  });
});
