import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Matches, Min } from 'class-validator';
import { PropertyType } from '../../../application/use-cases/compute-notary-fees.use-case';

export class ComputeNotaryFeesRequestDto {
  @ApiProperty({ example: 280000 })
  @IsNumber()
  @Min(0)
  propertyPrice!: number;

  @ApiProperty({ enum: PropertyType, example: PropertyType.OLD })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiPropertyOptional({ example: '75' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^([0-9]{2}|2A|2B|97[1-6])$/)
  departmentCode?: string;
}
