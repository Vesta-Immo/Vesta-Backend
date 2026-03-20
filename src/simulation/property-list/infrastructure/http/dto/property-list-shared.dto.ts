import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  Matches,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PropertyTrackingStatus, PropertyType } from '../../../domain/property-list.types';

export class FinancingSettingsDto {
  @ApiProperty({ example: 3.6 })
  @IsNumber()
  @Min(0)
  @Max(30)
  annualRatePercent!: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(12)
  @Max(480)
  durationMonths!: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  downPayment!: number;

  @ApiProperty({ example: 72000 })
  @IsNumber()
  @Min(0)
  annualHouseholdIncome!: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  monthlyCurrentDebtPayments!: number;
}

export class RenovationWorkItemDto {
  @ApiProperty({ example: 'Kitchen' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Cabinets, painting and floor' })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  cost!: number;
}

export class PropertyItemDto {
  @ApiProperty({ example: 'prop-1' })
  @IsString()
  id!: string;

  @ApiProperty({ enum: PropertyTrackingStatus, example: PropertyTrackingStatus.VISITED })
  @IsEnum(PropertyTrackingStatus)
  status!: PropertyTrackingStatus;

  @ApiProperty({ enum: PropertyType, example: PropertyType.OLD })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiPropertyOptional({ example: 'https://www.example.com/annonce/abc123' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  listingUrl?: string;

  @ApiPropertyOptional({ example: '75' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^([0-9]{2}|2A|2B|97[1-6])$/)
  departmentCode?: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Lyon 7e - Gerland' })
  @IsString()
  addressOrSector!: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  propertyTaxAnnual!: number;

  @ApiProperty({ example: 1800 })
  @IsNumber()
  @Min(0)
  coOwnershipFeesAnnual!: number;

  @ApiProperty({ type: [RenovationWorkItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RenovationWorkItemDto)
  renovationWorkItems!: RenovationWorkItemDto[];
}
