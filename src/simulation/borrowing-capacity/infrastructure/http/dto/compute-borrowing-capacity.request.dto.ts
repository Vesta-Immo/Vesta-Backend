import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class ComputeBorrowingCapacityRequestDto {
  @ApiProperty({ example: 60000 })
  @IsNumber()
  @Min(0)
  annualHouseholdIncome!: number;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(0)
  monthlyDebtPayments!: number;

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

  @ApiProperty({ example: 35 })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxDebtRatioPercent!: number;
}
