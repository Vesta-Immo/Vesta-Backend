import { ApiProperty } from '@nestjs/swagger';
import {
  DebtRatioLevel,
  PropertyTrackingStatus,
  PropertyType,
} from '../../../domain/property-list.types';

class PropertySimulationResultResponseDto {
  @ApiProperty({ example: 'prop-1' })
  id!: string;

  @ApiProperty({ enum: PropertyTrackingStatus, example: PropertyTrackingStatus.WANTED })
  status!: PropertyTrackingStatus;

  @ApiProperty({ enum: PropertyType, example: PropertyType.OLD })
  propertyType!: PropertyType;

  @ApiProperty({ example: '75', required: false })
  departmentCode?: string;

  @ApiProperty({ example: 'Lyon 7e - Gerland' })
  addressOrSector!: string;

  @ApiProperty({ example: 250000 })
  price!: number;

  @ApiProperty({ example: 20000 })
  notaryFees!: number;

  @ApiProperty({ example: 22000 })
  totalRenovationBudget!: number;

  @ApiProperty({ example: 262000 })
  requiredLoanAmount!: number;

  @ApiProperty({ example: 1259.92 })
  monthlyCreditPayment!: number;

  @ApiProperty({ example: 1509.92 })
  monthlyPaymentWithCharges!: number;

  @ApiProperty({ example: 33.45 })
  debtRatioPercent!: number;

  @ApiProperty({ enum: DebtRatioLevel, example: DebtRatioLevel.OK })
  debtRatioLevel!: DebtRatioLevel;
}

export class ComputePropertyListSimulationResponseDto {
  @ApiProperty({ example: 3.6 })
  annualRatePercent!: number;

  @ApiProperty({ example: 300 })
  durationMonths!: number;

  @ApiProperty({ example: 10000 })
  downPayment!: number;

  @ApiProperty({ example: 72000 })
  annualHouseholdIncome!: number;

  @ApiProperty({ example: 500 })
  monthlyCurrentDebtPayments!: number;

  @ApiProperty({ type: [PropertySimulationResultResponseDto] })
  results!: PropertySimulationResultResponseDto[];
}
