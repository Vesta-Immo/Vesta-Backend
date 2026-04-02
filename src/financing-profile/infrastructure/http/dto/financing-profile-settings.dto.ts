// filepath: src/financing-profile/infrastructure/http/dto/financing-profile-settings.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PropertyType } from '../../../../simulation/notary-fees/domain/notary-fees.types';

/**
 * DTO pour les paramètres financiers d'un profil.
 * Représente les données dénormalisées du scénario source.
 */
export class FinancingProfileSettingsDto {
  @ApiProperty({
    description: 'Revenus annuels nets du ménage',
    example: 60000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  annualHouseholdIncome!: number;

  @ApiProperty({
    description: 'Charges de crédits existantes par mois',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthlyCurrentDebtPayments!: number;

  @ApiProperty({
    description: "Taux d'intérêt annuel (ex: 3.5 pour 3.5%)",
    example: 3.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  annualRatePercent!: number;

  @ApiProperty({
    description: 'Durée du crédit en mois (ex: 240 pour 20 ans)',
    example: 240,
    minimum: 12,
    maximum: 480,
  })
  @IsNumber()
  @Min(12)
  @Max(480)
  durationMonths!: number;

  @ApiProperty({
    description: "Taux d'endettement maximum (ex: 35 pour 35%)",
    example: 35,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxDebtRatioPercent!: number;

  @ApiProperty({
    description: 'Apport personnel disponible',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  downPayment!: number;

  @ApiProperty({
    description: 'Type de bien immobilier',
    enum: PropertyType,
    example: PropertyType.OLD,
  })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiPropertyOptional({
    description: 'Code département (pour majoration Paris)',
    example: '75',
  })
  @IsString()
  @IsOptional()
  departmentCode?: string;
}
