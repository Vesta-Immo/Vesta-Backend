// filepath: src/project/domain/scenario.types.ts

import { PropertyType } from '../../simulation/notary-fees/domain/notary-fees.types';

/**
 * Scenario input parameters.
 * Represents the complete financial configuration of a simulation.
 */
export interface ScenarioInput {
  // --- Financial situation ---
  annualHouseholdIncome: number; // Net annual household income
  monthlyCurrentDebtPayments: number; // Existing monthly debt payments

  // --- Credit ---
  annualRatePercent: number; // Annual interest rate (e.g., 3.5)
  durationMonths: number; // Duration in months (e.g., 240 for 20 years)
  maxDebtRatioPercent: number; // Max debt ratio (e.g., 35)

  // --- Down payment ---
  downPayment: number; // Available personal down payment

  // --- Notary fees ---
  propertyType: PropertyType; // Property type (affects fees)
  departmentCode?: string; // Department code (for Paris surcharge)
}

/**
 * Calculated scenario result.
 * Null if the scenario has not been calculated yet.
 */
export interface ScenarioOutput {
  // --- Borrowing capacity ---
  monthlyPaymentCapacity: number; // Monthly repayment capacity
  borrowingCapacity: number; // Borrowable amount

  // --- Global budget ---
  notaryFees: number; // Estimated notary fees
  totalBudget: number; // Total available budget

  // --- Monthly payment ---
  monthlyCreditPayment: number; // Credit monthly payment

  // --- Computation metadata ---
  computedAt: string; // ISO timestamp of calculation
  computationVersion: string; // Calculation rules version
}

export interface Scenario {
  id: string;
  projectId: string;
  name: string;
  inputParams: ScenarioInput;
  outputResult: ScenarioOutput | null;
  isBaseline: boolean;
  computedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
