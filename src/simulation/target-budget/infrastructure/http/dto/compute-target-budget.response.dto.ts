import { ApiProperty } from '@nestjs/swagger';

export class ComputeTargetBudgetResponseDto {
  @ApiProperty({ example: 265000 })
  targetBudget!: number;
}
