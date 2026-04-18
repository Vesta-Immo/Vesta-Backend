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
 * Request DTO for computing PTZ amount
 * Updated for 2025-2026 regulations with property type and operation type
 */
export class ComputePtzRequestDto {
  @ApiProperty({ example: 25000000, description: 'Prix du logement en centimes (ex: 25000000 = 250 000€)' })
  @IsInt()
  @Min(0)
  propertyPrice!: number;

  @ApiProperty({ example: 'B1', enum: PtzZone, description: 'Zone géographique PTZ' })
  @IsEnum(PtzZone)
  propertyZone!: PtzZone;

  @ApiProperty({ example: 3, description: 'Nombre de personnes dans le foyer' })
  @IsInt()
  @Min(1)
  @Max(10)
  householdSize!: number;

  @ApiProperty({ example: 4500000, description: 'Revenu annuel du foyer en centimes (ex: 4500000 = 45 000€)' })
  @IsInt()
  @Min(0)
  annualIncome!: number;

  @ApiProperty({ example: true, description: 'Est-ce un primo-accédant ?' })
  @IsBoolean()
  isPrimoAccedant!: boolean;

  @ApiProperty({ example: 30, description: 'Pourcentage de travaux (optionnel, pour bien ancien)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  workPercentage?: number;

  @ApiProperty({ example: false, description: 'Avez-vous un prêt complémentaire ?', required: false })
  @IsOptional()
  @IsBoolean()
  hasComplementaryLoan?: boolean;

  @ApiProperty({ example: 'PAS', enum: ComplementaryLoanType, description: 'Type de prêt complémentaire', required: false })
  @IsOptional()
  @IsEnum(ComplementaryLoanType)
  complementaryLoanType?: ComplementaryLoanType;

  @ApiProperty({ example: false, description: "L'opération inclut-elle des dépendances (garage, parking, etc.)", required: false })
  @IsOptional()
  @IsBoolean()
  hasDependencies?: boolean;

  @ApiProperty({ example: 'OP-2024-001', description: 'Identifiant unique pour l\'unicité de l\'opération', required: false })
  @IsOptional()
  @IsString()
  operationId?: string;

  @ApiProperty({ example: 'DIVORCE_SEPARATION', enum: PrimoAccedantException, description: 'Exception à la primo-accédance', required: false })
  @IsOptional()
  @IsEnum(PrimoAccedantException)
  primoAccedantException?: PrimoAccedantException;

  @ApiProperty({ example: false, description: 'Bien ancien (nécessite des travaux)', required: false })
  @IsOptional()
  @IsBoolean()
  isOldProperty?: boolean;

  @ApiProperty({ example: 'COLLECTIF', enum: PropertyType, description: 'Type de bien (COLLECTIF ou MAISON_INDIVIDUELLE)', required: false })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({ example: 'NEUF', enum: OperationType, description: "Type d'opération (NEUF, ANCIEN_AVEC_TRAVAUX ou VENTE_HLM)", required: false })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({ example: 5000000, description: 'Montant des autres prêts en centimes (ex: 5000000 = 50 000€) - pour la règle de l\'appoint', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  otherLoansAmount?: number;
}
