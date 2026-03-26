// filepath: src/project/domain/services/scenario-comparator.service.ts
import { Scenario } from '../scenario.types';

export interface ScenarioComparisonRow {
  scenarioId: string;
  scenarioName: string;
  isBaseline: boolean;
  // Inputs
  annualHouseholdIncome: number;
  durationMonths: number;
  annualRatePercent: number;
  downPayment: number;
  // Outputs
  borrowingCapacity: number;
  monthlyPaymentCapacity: number;
  monthlyCreditPayment: number;
  totalBudget: number;
  notaryFees: number;
}

export interface ScenarioDelta {
  borrowingCapacityDelta: number;
  monthlyPaymentDelta: number;
  totalBudgetDelta: number;
}

export interface ScenarioInsights {
  bestMonthlyPayment: { scenarioId: string; value: number };
  highestBorrowingCapacity: { scenarioId: string; value: number };
  highestTotalBudget: { scenarioId: string; value: number };
}

export class ScenarioComparatorService {
  compare(scenarios: Scenario[]): ScenarioComparisonRow[] {
    return scenarios.map((s) => ({
      scenarioId: s.id,
      scenarioName: s.name,
      isBaseline: s.isBaseline,
      annualHouseholdIncome: s.inputParams.annualHouseholdIncome,
      durationMonths: s.inputParams.durationMonths,
      annualRatePercent: s.inputParams.annualRatePercent,
      downPayment: s.inputParams.downPayment,
      borrowingCapacity: s.outputResult?.borrowingCapacity ?? 0,
      monthlyPaymentCapacity: s.outputResult?.monthlyPaymentCapacity ?? 0,
      monthlyCreditPayment: s.outputResult?.monthlyCreditPayment ?? 0,
      totalBudget: s.outputResult?.totalBudget ?? 0,
      notaryFees: s.outputResult?.notaryFees ?? 0,
    }));
  }

  getInsights(scenarios: Scenario[]): ScenarioInsights {
    const withResults = scenarios.filter((s) => s.outputResult !== null);

    if (withResults.length === 0) {
      throw new Error('No scenarios with results to compare');
    }

    const sortedByMonthly = [...withResults].sort(
      (a, b) =>
        (a.outputResult?.monthlyCreditPayment ?? 0) - (b.outputResult?.monthlyCreditPayment ?? 0),
    );

    const sortedByCapacity = [...withResults].sort(
      (a, b) =>
        (b.outputResult?.borrowingCapacity ?? 0) - (a.outputResult?.borrowingCapacity ?? 0),
    );

    const sortedByBudget = [...withResults].sort(
      (a, b) =>
        (b.outputResult?.totalBudget ?? 0) - (a.outputResult?.totalBudget ?? 0),
    );

    return {
      bestMonthlyPayment: {
        scenarioId: sortedByMonthly[0].id,
        value: sortedByMonthly[0].outputResult!.monthlyCreditPayment,
      },
      highestBorrowingCapacity: {
        scenarioId: sortedByCapacity[0].id,
        value: sortedByCapacity[0].outputResult!.borrowingCapacity,
      },
      highestTotalBudget: {
        scenarioId: sortedByBudget[0].id,
        value: sortedByBudget[0].outputResult!.totalBudget,
      },
    };
  }

  getDeltas(scenarios: Scenario[], baselineId: string): Record<string, ScenarioDelta> {
    const baseline = scenarios.find((s) => s.id === baselineId && s.isBaseline);
    if (!baseline?.outputResult) {
      throw new Error('No baseline scenario found');
    }

    const result: Record<string, ScenarioDelta> = {};

    for (const scenario of scenarios) {
      if (scenario.id === baselineId || !scenario.outputResult) continue;

      result[scenario.id] = {
        borrowingCapacityDelta:
          scenario.outputResult.borrowingCapacity - baseline.outputResult.borrowingCapacity,
        monthlyPaymentDelta:
          scenario.outputResult.monthlyCreditPayment - baseline.outputResult.monthlyCreditPayment,
        totalBudgetDelta: scenario.outputResult.totalBudget - baseline.outputResult.totalBudget,
      };
    }

    return result;
  }
}
