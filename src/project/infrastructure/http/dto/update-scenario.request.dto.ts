// filepath: src/project/infrastructure/http/dto/update-scenario.request.dto.ts
import { IsNumber, IsOptional, IsIn, IsString, Max, Min, MaxLength } from 'class-validator';

export class UpdateScenarioRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  annualHouseholdIncome?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyCurrentDebtPayments?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(20)
  annualRatePercent?: number;

  @IsNumber()
  @IsOptional()
  @Min(12)
  @Max(480)
  durationMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  maxDebtRatioPercent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  downPayment?: number;

  @IsIn(['NEW', 'OLD'])
  @IsOptional()
  propertyType?: 'NEW' | 'OLD';

  @IsString()
  @IsOptional()
  departmentCode?: string;
}
