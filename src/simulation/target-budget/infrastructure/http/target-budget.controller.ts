import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../../core/security/guards/api-key.guard';
import { ComputeTargetBudgetUseCase } from '../../application/use-cases/compute-target-budget.use-case';
import { ComputeTargetBudgetRequestDto } from './dto/compute-target-budget.request.dto';
import { ComputeTargetBudgetResponseDto } from './dto/compute-target-budget.response.dto';

@ApiTags('simulations')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('simulations/target-budget')
export class TargetBudgetController {
  constructor(private readonly useCase: ComputeTargetBudgetUseCase) {}

  @Post('compute')
  @HttpCode(HttpStatus.OK)
  compute(
    @Body() request: ComputeTargetBudgetRequestDto,
  ): ComputeTargetBudgetResponseDto {
    return this.useCase.execute(request);
  }
}
