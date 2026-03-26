// filepath: src/project/infrastructure/http/dto/scenario.response.dto.ts
export class ScenarioInputResponseDto {
  annualHouseholdIncome!: number;
  monthlyCurrentDebtPayments!: number;
  annualRatePercent!: number;
  durationMonths!: number;
  maxDebtRatioPercent!: number;
  downPayment!: number;
  propertyType!: 'NEW' | 'OLD';
  departmentCode?: string;
}

export class ScenarioOutputResponseDto {
  monthlyPaymentCapacity!: number;
  borrowingCapacity!: number;
  notaryFees!: number;
  totalBudget!: number;
  monthlyCreditPayment!: number;
  computedAt!: string;
  computationVersion!: string;
}

export class ScenarioResponseDto {
  id!: string;
  projectId!: string;
  name!: string;
  inputParams!: ScenarioInputResponseDto;
  outputResult!: ScenarioOutputResponseDto | null;
  isBaseline!: boolean;
  computedAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
}
