import { ApiProperty } from '@nestjs/swagger';

export class ComputeNotaryFeesResponseDto {
  @ApiProperty({ example: 21840 })
  notaryFees!: number;

  @ApiProperty({ example: 7.8 })
  appliedRatePercent!: number;
}
