export interface BorrowingCapacityInput {
  annualHouseholdIncome: number;
  monthlyDebtPayments: number;
  annualRatePercent: number;
  durationMonths: number;
  maxDebtRatioPercent: number;
}

export interface BorrowingCapacityOutput {
  monthlyPaymentCapacity: number;
  borrowingCapacity: number;
}
