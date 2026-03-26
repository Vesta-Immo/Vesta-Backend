// filepath: src/project/infrastructure/http/scenario.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';
import { CurrentUserId } from '../../../core/security/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '../../../core/security/guards/supabase-auth.guard';
import { CreateScenarioRequestDto } from './dto/create-scenario.request.dto';
import { UpdateScenarioRequestDto } from './dto/update-scenario.request.dto';
import { ScenarioResponseDto } from './dto/scenario.response.dto';
import { CopyScenarioResponseDto } from './dto/copy-scenario.response.dto';
import { CreateScenarioUseCase } from '../../application/use-cases/create-scenario.use-case';
import { ListScenariosUseCase } from '../../application/use-cases/list-scenarios.use-case';
import { GetScenarioUseCase } from '../../application/use-cases/get-scenario.use-case';
import { UpdateScenarioUseCase } from '../../application/use-cases/update-scenario.use-case';
import { DeleteScenarioUseCase } from '../../application/use-cases/delete-scenario.use-case';
import { CopyScenarioUseCase } from '../../application/use-cases/copy-scenario.use-case';
import { ComputeScenarioUseCase } from '../../application/use-cases/compute-scenario.use-case';
import { CompareScenariosUseCase } from '../../application/use-cases/compare-scenarios.use-case';

@ApiTags('scenarios')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('projects/:projectId/scenarios')
export class ScenarioController {
  constructor(
    private readonly createScenarioUseCase: CreateScenarioUseCase,
    private readonly listScenariosUseCase: ListScenariosUseCase,
    private readonly getScenarioUseCase: GetScenarioUseCase,
    private readonly updateScenarioUseCase: UpdateScenarioUseCase,
    private readonly deleteScenarioUseCase: DeleteScenarioUseCase,
    private readonly copyScenarioUseCase: CopyScenarioUseCase,
    private readonly computeScenarioUseCase: ComputeScenarioUseCase,
    private readonly compareScenariosUseCase: CompareScenariosUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createScenario(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Body() request: CreateScenarioRequestDto,
  ): Promise<ScenarioResponseDto> {
    const scenario = await this.createScenarioUseCase.execute(userId, {
      projectId,
      name: request.name,
      inputParams: {
        annualHouseholdIncome: request.annualHouseholdIncome,
        monthlyCurrentDebtPayments: request.monthlyCurrentDebtPayments,
        annualRatePercent: request.annualRatePercent,
        durationMonths: request.durationMonths,
        maxDebtRatioPercent: request.maxDebtRatioPercent,
        downPayment: request.downPayment,
        propertyType: request.propertyType as PropertyType,
        departmentCode: request.departmentCode,
      },
    });
    return this.toResponse(scenario);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listScenarios(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
  ): Promise<ScenarioResponseDto[]> {
    const scenarios = await this.listScenariosUseCase.execute(userId, projectId);
    return scenarios.map(this.toResponse);
  }

  @Get('compare')
  @HttpCode(HttpStatus.OK)
  async compareScenarios(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Query('ids') ids: string = '',
  ): Promise<unknown> {
    // Support both ',' and ';' as separators
    const rawIds = ids.includes(',') ? ids.split(',') : ids.split(';');
    const scenarioIds = rawIds.filter(Boolean);
    return this.compareScenariosUseCase.execute(userId, projectId, scenarioIds);
  }

  @Get(':scenarioId')
  @HttpCode(HttpStatus.OK)
  async getScenario(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('scenarioId') scenarioId: string,
  ): Promise<ScenarioResponseDto> {
    const scenario = await this.getScenarioUseCase.execute(userId, projectId, scenarioId);
    return this.toResponse(scenario);
  }

  @Patch(':scenarioId')
  @HttpCode(HttpStatus.OK)
  async updateScenario(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('scenarioId') scenarioId: string,
    @Body() request: UpdateScenarioRequestDto,
  ): Promise<ScenarioResponseDto> {
    const inputParams =
      request.annualHouseholdIncome !== undefined ||
      request.monthlyCurrentDebtPayments !== undefined ||
      request.annualRatePercent !== undefined ||
      request.durationMonths !== undefined ||
      request.maxDebtRatioPercent !== undefined ||
      request.downPayment !== undefined ||
      request.propertyType !== undefined ||
      request.departmentCode !== undefined
        ? {
            annualHouseholdIncome: request.annualHouseholdIncome,
            monthlyCurrentDebtPayments: request.monthlyCurrentDebtPayments,
            annualRatePercent: request.annualRatePercent,
            durationMonths: request.durationMonths,
            maxDebtRatioPercent: request.maxDebtRatioPercent,
            downPayment: request.downPayment,
            propertyType: request.propertyType as PropertyType,
            departmentCode: request.departmentCode,
          }
        : undefined;

    const scenario = await this.updateScenarioUseCase.execute(userId, {
      projectId,
      scenarioId,
      name: request.name,
      inputParams,
    });
    return this.toResponse(scenario);
  }

  @Delete(':scenarioId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScenario(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('scenarioId') scenarioId: string,
  ): Promise<void> {
    await this.deleteScenarioUseCase.execute(userId, projectId, scenarioId);
  }

  @Post(':scenarioId/copy')
  @HttpCode(HttpStatus.CREATED)
  async copyScenario(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('scenarioId') scenarioId: string,
    @Body() body: { name?: string } = {},
  ): Promise<CopyScenarioResponseDto> {
    const scenario = await this.copyScenarioUseCase.execute(userId, {
      projectId,
      scenarioId,
      name: body.name,
    });
    return {
      id: scenario.id,
      name: scenario.name,
      outputResult: null,
      isBaseline: false,
      createdAt: scenario.createdAt.toISOString(),
    };
  }

  @Post(':scenarioId/compute')
  @HttpCode(HttpStatus.OK)
  async computeScenario(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('scenarioId') scenarioId: string,
  ): Promise<ScenarioResponseDto> {
    const scenario = await this.computeScenarioUseCase.execute(userId, projectId, scenarioId);
    return this.toResponse(scenario);
  }

  private toResponse(scenario: {
    id: string;
    projectId: string;
    name: string;
    inputParams: {
      annualHouseholdIncome: number;
      monthlyCurrentDebtPayments: number;
      annualRatePercent: number;
      durationMonths: number;
      maxDebtRatioPercent: number;
      downPayment: number;
      propertyType: 'NEW' | 'OLD';
      departmentCode?: string;
    };
    outputResult: {
      monthlyPaymentCapacity: number;
      borrowingCapacity: number;
      notaryFees: number;
      totalBudget: number;
      monthlyCreditPayment: number;
      computedAt: string;
      computationVersion: string;
    } | null;
    isBaseline: boolean;
    computedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ScenarioResponseDto {
    return {
      id: scenario.id,
      projectId: scenario.projectId,
      name: scenario.name,
      inputParams: {
        annualHouseholdIncome: scenario.inputParams.annualHouseholdIncome,
        monthlyCurrentDebtPayments: scenario.inputParams.monthlyCurrentDebtPayments,
        annualRatePercent: scenario.inputParams.annualRatePercent,
        durationMonths: scenario.inputParams.durationMonths,
        maxDebtRatioPercent: scenario.inputParams.maxDebtRatioPercent,
        downPayment: scenario.inputParams.downPayment,
        propertyType: scenario.inputParams.propertyType,
        departmentCode: scenario.inputParams.departmentCode,
      },
      outputResult: scenario.outputResult
        ? {
            monthlyPaymentCapacity: scenario.outputResult.monthlyPaymentCapacity,
            borrowingCapacity: scenario.outputResult.borrowingCapacity,
            notaryFees: scenario.outputResult.notaryFees,
            totalBudget: scenario.outputResult.totalBudget,
            monthlyCreditPayment: scenario.outputResult.monthlyCreditPayment,
            computedAt: scenario.outputResult.computedAt,
            computationVersion: scenario.outputResult.computationVersion,
          }
        : null,
      isBaseline: scenario.isBaseline,
      computedAt: scenario.computedAt?.toISOString() ?? null,
      createdAt: scenario.createdAt.toISOString(),
      updatedAt: scenario.updatedAt.toISOString(),
    };
  }
}
