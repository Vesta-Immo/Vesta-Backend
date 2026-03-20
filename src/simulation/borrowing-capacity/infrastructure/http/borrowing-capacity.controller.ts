import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../../core/security/guards/api-key.guard';
import { ComputeBorrowingCapacityUseCase } from '../../application/use-cases/compute-borrowing-capacity.use-case';
import { ComputeBorrowingCapacityRequestDto } from './dto/compute-borrowing-capacity.request.dto';
import { ComputeBorrowingCapacityResponseDto } from './dto/compute-borrowing-capacity.response.dto';

@ApiTags('simulations')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('simulations/borrowing-capacity')
export class BorrowingCapacityController {
  constructor(private readonly useCase: ComputeBorrowingCapacityUseCase) {}

  @Post('compute')
  @HttpCode(HttpStatus.OK)
  compute(
    @Body() request: ComputeBorrowingCapacityRequestDto,
  ): ComputeBorrowingCapacityResponseDto {
    return this.useCase.execute(request);
  }
}
