import { ApiProperty } from '@nestjs/swagger';

export class ComputeBorrowingCapacityResponseDto {
  @ApiProperty({ example: 1450 })
  monthlyPaymentCapacity!: number;

  @ApiProperty({ example: 268500 })
  borrowingCapacity!: number;
}
