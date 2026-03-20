import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyTrackingStatus, PropertyType } from '../../../domain/property-list.types';
import { ComputePropertyListSimulationResponseDto } from './compute-property-list-simulation.response.dto';

class FinancingSettingsResponseDto {
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
}

class RenovationWorkItemResponseDto {
  @ApiProperty({ example: 'Kitchen' })
  name!: string;

  @ApiPropertyOptional({ example: 'Cabinets, painting and floor' })
  details?: string;

  @ApiProperty({ example: 15000 })
  cost!: number;
}

class PropertyItemStateResponseDto {
  @ApiProperty({ example: 'prop-1' })
  id!: string;

  @ApiProperty({ enum: PropertyTrackingStatus, example: PropertyTrackingStatus.WANTED })
  status!: PropertyTrackingStatus;

  @ApiProperty({ enum: PropertyType, example: PropertyType.OLD })
  propertyType!: PropertyType;

  @ApiPropertyOptional({ example: 'https://www.example.com/annonce/abc123' })
  listingUrl?: string;

  @ApiPropertyOptional({ example: '75' })
  departmentCode?: string;

  @ApiProperty({ example: 'Lyon 7e - Gerland' })
  addressOrSector!: string;

  @ApiProperty({ example: 250000 })
  price!: number;

  @ApiProperty({ example: 1200 })
  propertyTaxAnnual!: number;

  @ApiProperty({ example: 1800 })
  coOwnershipFeesAnnual!: number;

  @ApiProperty({ type: [RenovationWorkItemResponseDto] })
  renovationWorkItems!: RenovationWorkItemResponseDto[];
}

export class GetPropertyListStateResponseDto {
  @ApiPropertyOptional({ type: FinancingSettingsResponseDto })
  financingSettings!: FinancingSettingsResponseDto | null;

  @ApiProperty({ type: [PropertyItemStateResponseDto] })
  properties!: PropertyItemStateResponseDto[];

  @ApiPropertyOptional({ type: ComputePropertyListSimulationResponseDto })
  lastSimulation!: ComputePropertyListSimulationResponseDto | null;
}
