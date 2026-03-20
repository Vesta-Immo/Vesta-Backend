export enum PropertyTrackingStatus {
  WANTED = 'wanted',
  VISITED = 'visited',
}

export enum PropertyType {
  NEW = 'NEW',
  OLD = 'OLD',
}

export interface RenovationWorkItemInput {
  name: string;
  details?: string;
  cost: number;
}

export interface PropertyItemInput {
  id: string;
  status: PropertyTrackingStatus;
  propertyType: PropertyType;
  departmentCode?: string;
  price: number;
  addressOrSector: string;
  propertyTaxAnnual: number;
  coOwnershipFeesAnnual: number;
  renovationWorkItems: RenovationWorkItemInput[];
}

export interface PropertyItemSimulationInput extends PropertyItemInput {
  notaryFees: number;
}

export interface PropertyListSimulationInput {
  annualRatePercent: number;
  durationMonths: number;
  downPayment: number;
  annualHouseholdIncome: number;
  monthlyCurrentDebtPayments: number;
  properties: PropertyItemSimulationInput[];
}

export interface PropertyListFinancingSettings {
  annualRatePercent: number;
  durationMonths: number;
  downPayment: number;
  annualHouseholdIncome: number;
  monthlyCurrentDebtPayments: number;
}

export enum DebtRatioLevel {
  LOW = 'LOW',
  OK = 'OK',
  HIGH = 'HIGH',
}

export interface PropertySimulationResult {
  id: string;
  status: PropertyTrackingStatus;
  propertyType: PropertyType;
  departmentCode?: string;
  addressOrSector: string;
  price: number;
  notaryFees: number;
  totalRenovationBudget: number;
  requiredLoanAmount: number;
  monthlyCreditPayment: number;
  monthlyPaymentWithCharges: number;
  debtRatioPercent: number;
  debtRatioLevel: DebtRatioLevel;
}

export interface PropertyListSimulationOutput {
  annualRatePercent: number;
  durationMonths: number;
  downPayment: number;
  annualHouseholdIncome: number;
  monthlyCurrentDebtPayments: number;
  results: PropertySimulationResult[];
}

export interface PropertyListStateOutput {
  financingSettings: PropertyListFinancingSettings | null;
  properties: PropertyItemInput[];
  lastSimulation: PropertyListSimulationOutput | null;
}
