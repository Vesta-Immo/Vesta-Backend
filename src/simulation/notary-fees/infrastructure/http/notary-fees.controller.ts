import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../../core/security/guards/api-key.guard';
import { ComputeNotaryFeesUseCase } from '../../application/use-cases/compute-notary-fees.use-case';
import { ComputeNotaryFeesRequestDto } from './dto/compute-notary-fees.request.dto';
import { ComputeNotaryFeesResponseDto } from './dto/compute-notary-fees.response.dto';

@ApiTags('simulations')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('simulations/notary-fees')
export class NotaryFeesController {
  constructor(private readonly useCase: ComputeNotaryFeesUseCase) {}

  @Post('compute')
  @HttpCode(HttpStatus.OK)
  compute(
    @Body() request: ComputeNotaryFeesRequestDto,
  ): ComputeNotaryFeesResponseDto {
    return this.useCase.execute(request);
  }
}
