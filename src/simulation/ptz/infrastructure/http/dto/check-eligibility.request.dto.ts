import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { PtzZone, PropertyType, OperationType } from '../../../domain/ptz.types';

export enum ComplementaryLoanType {
  PAS = 'PAS',
  CONVENTIONNE = 'CONVENTIONNE',
  CLASSIQUE = 'CLASSIQUE',
  PEL = 'PEL',
  COMPLEMENTAIRE = 'COMPLEMENTAIRE'
}

export enum PrimoAccedantException {
  DIVORCE_SEPARATION = 'DIVORCE_SEPARATION',
  CATASTROPHE_NATURELLE = 'CATASTROPHE_NATURELLE',
  CARTE_INVALIDITE = 'CARTE_INVALIDITE',
  AAH = 'AAH',
  AEEH = 'AEEH'
}

/**
 * Request DTO for checking PTZ eligibility
 * Updated for 2025-2026 regulations with property type and operation type
 */
export class CheckPtzEligibilityRequestDto {
  @ApiProperty({ example: 25000000, description: 'Property price in cents (e.g., 25000000 = 250,000 EUR)' })
  @IsInt()
  @Min(0)
  propertyPrice!: number;

  @ApiProperty({ example: 'B1', enum: PtzZone, description: 'PTZ geographic zone' })
  @IsEnum(PtzZone)
  propertyZone!: PtzZone;

  @ApiProperty({ example: 3, description: 'Number of people in household' })
  @IsInt()
  @Min(1)
  @Max(10)
  householdSize!: number;

  @ApiProperty({ example: true, description: 'Is first-time buyer?' })
  @IsBoolean()
  isPrimoAccedant!: boolean;

  @ApiProperty({ example: 4500000, description: 'Annual household income in cents (e.g., 4500000 = 45,000 EUR)' })
  @IsInt()
  @Min(0)
  annualIncome!: number;

  @ApiProperty({ example: 30, description: 'Work percentage (optional, for old property)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  workPercentage?: number;

  @ApiProperty({ example: false, description: 'Has complementary loan', required: false })
  @IsOptional()
  @IsBoolean()
  hasComplementaryLoan?: boolean;

  @ApiProperty({ example: 'PAS', enum: ComplementaryLoanType, description: 'Type of complementary loan', required: false })
  @IsOptional()
  @IsEnum(ComplementaryLoanType)
  complementaryLoanType?: ComplementaryLoanType;

  @ApiProperty({ example: false, description: 'Operation includes dependencies (garage, parking, etc.)', required: false })
  @IsOptional()
  @IsBoolean()
  hasDependencies?: boolean;

  @ApiProperty({ example: 'OP-2024-001', description: 'Unique operation ID for uniqueness constraint', required: false })
  @IsOptional()
  @IsString()
  operationId?: string;

  @ApiProperty({ example: 'DIVORCE_SEPARATION', enum: PrimoAccedantException, description: 'Exception to first-time buyer rule', required: false })
  @IsOptional()
  @IsEnum(PrimoAccedantException)
  primoAccedantException?: PrimoAccedantException;

  @ApiProperty({ example: false, description: 'Is old property (requires work)', required: false })
  @IsOptional()
  @IsBoolean()
  isOldProperty?: boolean;

  @ApiProperty({ example: 'COLLECTIF', enum: PropertyType, description: 'Property type (COLLECTIF or MAISON_INDIVIDUELLE)', required: false })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({ example: 'NEUF', enum: OperationType, description: 'Operation type (NEUF, ANCIEN_AVEC_TRAVAUX or VENTE_HLM)', required: false })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({ example: 5000000, description: 'Amount of other loans in cents (e.g., 5000000 = 50,000 EUR) - for the complementarity rule', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  otherLoansAmount?: number;
}
