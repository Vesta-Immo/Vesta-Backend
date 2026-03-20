export enum PropertyType {
  NEW = 'NEW',
  OLD = 'OLD',
}

export interface NotaryFeesInput {
  propertyPrice: number;
  propertyType: PropertyType;
  departmentCode?: string;
}

export interface NotaryFeesOutput {
  notaryFees: number;
  appliedRatePercent: number;
}
