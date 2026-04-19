import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../../core/security/guards/api-key.guard';
import { CheckPtzEligibilityUseCase } from '../../application/use-cases/check-ptz-eligibility.use-case';
import { ComputePtzAmountUseCase } from '../../application/use-cases/compute-ptz-amount.use-case';
import { GetPtzConditionsUseCase } from '../../application/use-cases/get-ptz-conditions.use-case';
import { CheckPtzEligibilityRequestDto } from './dto/check-eligibility.request.dto';
import { CheckPtzEligibilityResponseDto } from './dto/check-eligibility.response.dto';
import { ComputePtzRequestDto } from './dto/compute-ptz.request.dto';
import { ComputePtzResponseDto } from './dto/compute-ptz.response.dto';
import { GetPtzConditionsResponseDto } from './dto/get-ptz-conditions.response.dto';

/**
 * Controller PTZ - Prêt à Taux Zéro
 *
 * Endpoints pour vérifier l'éligibilité et calculer le montant PTZ
 */
@ApiTags('ptz')
@UseGuards(ApiKeyGuard)
@Controller('ptz')
export class PtzController {
  constructor(
    private readonly checkEligibilityUseCase: CheckPtzEligibilityUseCase,
    private readonly computeAmountUseCase: ComputePtzAmountUseCase,
    private readonly getConditionsUseCase: GetPtzConditionsUseCase,
  ) {}

  /**
   * Vérifie l'éligibilité PTZ d'un utilisateur
   *
   * @param request - Données d'entrée pour la vérification
   * @returns Résultat de l'éligibilité avec les raisons le cas échéant
   */
  @Post('check-eligibility')
  @HttpCode(HttpStatus.OK)
  async checkEligibility(
    @Body() request: CheckPtzEligibilityRequestDto,
  ): Promise<CheckPtzEligibilityResponseDto> {
    const result = await this.checkEligibilityUseCase.execute({
      propertyPrice: request.propertyPrice,
      propertyZone: request.propertyZone,
      householdSize: request.householdSize,
      isPrimoAccedant: request.isPrimoAccedant,
      annualIncome: request.annualIncome,
      workPercentage: request.workPercentage,
      hasComplementaryLoan: request.hasComplementaryLoan,
      complementaryLoanType: request.complementaryLoanType,
      hasDependencies: request.hasDependencies,
      operationId: request.operationId,
      primoAccedantException: request.primoAccedantException,
      isOldProperty: request.isOldProperty,
      propertyType: request.propertyType,
      operationType: request.operationType,
      otherLoansAmount: request.otherLoansAmount,
    });

    return {
      isEligible: result.isEligible,
      reasons: result.reasons,
      maxPtzAmount: result.maxPtzAmount !== undefined ? result.maxPtzAmount / 100 : undefined, // Convert cents to euros
      ptzRate: result.ptzRate,
      ptzDuration: result.ptzDuration,
      durationInfo: result.durationInfo,
    };
  }

  /**
   * Calcule le montant PTZ éligible
   *
   * @param request - Données du projet pour le calcul
   * @returns Montant PTZ calculé avec les conditions appliquées
   */
  @Post('compute')
  @HttpCode(HttpStatus.OK)
  async compute(
    @Body() request: ComputePtzRequestDto,
  ): Promise<ComputePtzResponseDto> {
    const result = await this.computeAmountUseCase.execute({
      propertyPrice: request.propertyPrice,
      propertyZone: request.propertyZone,
      householdSize: request.householdSize,
      isPrimoAccedant: request.isPrimoAccedant,
      annualIncome: request.annualIncome,
      workPercentage: request.workPercentage,
      hasComplementaryLoan: request.hasComplementaryLoan,
      complementaryLoanType: request.complementaryLoanType,
      hasDependencies: request.hasDependencies,
      operationId: request.operationId,
      primoAccedantException: request.primoAccedantException,
      isOldProperty: request.isOldProperty,
      propertyType: request.propertyType,
      operationType: request.operationType,
      otherLoansAmount: request.otherLoansAmount,
    });

    return {
      isEligible: result.isEligible,
      reasons: result.reasons,
      maxPtzAmount: result.maxPtzAmount / 100, // Convert cents to euros
      ptzRate: result.ptzRate,
      ptzDuration: result.ptzDuration,
      loanPercentage: result.loanPercentage,
      durationInfo: result.durationInfo,
    };
  }

  /**
   * Récupère les conditions et plafonds PTZ actuels
   * Route publique - ne nécessite pas d'authentification
   *
   * @returns Configuration complète des conditions PTZ
   */
  @Get('conditions')
  @HttpCode(HttpStatus.OK)
  getConditions(): GetPtzConditionsResponseDto {
    return this.getConditionsUseCase.execute();
  }
}
