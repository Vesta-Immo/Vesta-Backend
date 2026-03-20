import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ComputeTargetBudgetRequestDto {
  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  borrowingCapacity!: number;

  @ApiProperty({ example: 30000 })
  @IsNumber()
  @Min(0)
  downPayment!: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  estimatedRenovationCosts!: number;
}
