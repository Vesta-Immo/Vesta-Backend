// filepath: src/project/infrastructure/http/dto/create-scenario.request.dto.ts
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsIn, IsString, Max, Min, MaxLength } from 'class-validator';

export class CreateScenarioRequestDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsNumber()
  @Min(0)
  annualHouseholdIncome!: number;

  @IsNumber()
  @Min(0)
  monthlyCurrentDebtPayments!: number;

  @IsNumber()
  @Min(0.1)
  @Max(20)
  annualRatePercent!: number;

  @IsNumber()
  @Min(12)
  @Max(480)
  durationMonths!: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  maxDebtRatioPercent!: number;

  @IsNumber()
  @Min(0)
  downPayment!: number;

  @IsIn(['NEW', 'OLD'])
  propertyType!: 'NEW' | 'OLD';

  @IsString()
  @IsOptional()
  departmentCode?: string;
}
