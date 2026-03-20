export interface TargetBudgetInput {
  borrowingCapacity: number;
  downPayment: number;
  estimatedRenovationCosts: number;
}

export interface TargetBudgetOutput {
  targetBudget: number;
}
