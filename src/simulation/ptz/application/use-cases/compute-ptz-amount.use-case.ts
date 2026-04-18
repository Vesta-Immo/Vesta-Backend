import { Injectable } from '@nestjs/common';
import { PtzFormulaService } from '../../domain/services/ptz-formula.service';
import { PtzRulesService } from '../../domain/services/ptz-rules.service';
import { PtzEligibilityService } from '../../domain/services/ptz-eligibility.service';
import { PrismaPtzRepository } from '../../infrastructure/repositories/prisma-ptz.repository';
import { PtzAmountInput, PtzAmountResult, PtzZone, PtzDurationInfo, ComplementaryLoanType, PrimoAccedantException, PropertyType, OperationType } from '../../domain/ptz.types';

export interface ComputePtzAmountCommand {
  propertyPrice: number;
  propertyZone: PtzZone;
  householdSize: number;
  isPrimoAccedant: boolean;
  annualIncome: number;
  workPercentage?: number;
  isNewProperty?: boolean;
  hasComplementaryLoan?: boolean;
  complementaryLoanType?: ComplementaryLoanType;
  hasDependencies?: boolean;
  operationId?: string;
  primoAccedantException?: PrimoAccedantException;
  isOldProperty?: boolean;
  propertyType?: PropertyType;
  operationType?: OperationType;
  otherLoansAmount?: number; // Amount of other loans (for the matching rule)
}

export type ComputePtzAmountResult = Omit<PtzAmountResult, 'ptzDuration'> & {
  ptzDuration: number;
  durationInfo?: PtzDurationInfo;
  isEligible: boolean;
  reasons?: string[];
};

/**
 * Use case pour calculer le montant PTZ éligible
 */
@Injectable()
export class ComputePtzAmountUseCase {
  constructor(
    private readonly formulaService: PtzFormulaService,
    private readonly rulesService: PtzRulesService,
    private readonly eligibilityService: PtzEligibilityService,
    private readonly repository: PrismaPtzRepository,
  ) {}

  async execute(command: ComputePtzAmountCommand): Promise<ComputePtzAmountResult> {
    const { propertyPrice, propertyZone, householdSize, isPrimoAccedant, annualIncome, workPercentage, isNewProperty, otherLoansAmount } = command;

    // Only check RFR as eligibility criterion
    // Note: The price ceiling is a CALCULATION ceiling, not an eligibility criterion.
    // If the property exceeds the ceiling, the borrower remains eligible for PTZ,
    // but the amount is calculated on the ceiling (via Math.min in ptz-formula.service.ts).
    const isRfrEligible = this.rulesService.isRfrEligible(propertyZone, annualIncome, householdSize);

    if (!isRfrEligible) {
      const maxRfr = this.rulesService.getMaxRfr(propertyZone, householdSize);
      return {
        isEligible: false,
        reasons: [`RFR (${annualIncome / 100}€) supérieur au plafond (${maxRfr / 100}€)`],
        maxPtzAmount: 0,
        ptzRate: 0,
        ptzDuration: 0,
        loanPercentage: 0,
      };
    }

    // Calculate PTZ amount
    const amountInput: PtzAmountInput = {
      propertyPrice,
      propertyZone,
      householdSize,
      annualIncome,
      workPercentage,
      isNewProperty,
    };

    const amountResult = this.formulaService.computePtzAmount(amountInput);
    const durationInfo = this.formulaService.getOptimalDuration(
      propertyZone,
      annualIncome,
      householdSize,
    );

    const reasons: string[] = [];
    // Check if price exceeds ceiling to inform the user
    const isPriceOverCeiling = !this.rulesService.isPropertyPriceEligible(propertyZone, propertyPrice, householdSize);
    if (isPriceOverCeiling) {
      const maxPrice = this.rulesService.getMaxPropertyPrice(propertyZone, householdSize);
      reasons.push(`Prix du logement (${propertyPrice / 100}€) supérieur au plafond PTZ (${maxPrice / 100}€). Le montant du PTZ est calculé sur le plafond.`);
    }

    // Apply the matching rule: PTZ cannot exceed the amount of other loans
    let finalPtzAmount = amountResult.maxPtzAmount;
    if (otherLoansAmount !== undefined && otherLoansAmount > 0) {
      if (finalPtzAmount > otherLoansAmount) {
        finalPtzAmount = otherLoansAmount;
        reasons.push(`Le montant du PTZ a été limité au montant des autres prêts (${otherLoansAmount / 100}€) conformément à la règle de l'appoint.`);
      }
    }

    const result = {
      isEligible: true,
      ...amountResult,
      maxPtzAmount: finalPtzAmount,
      ptzDuration: durationInfo.totalDurationMonths,
      durationInfo,
      reasons,
    };

    // Save the simulation
    await this.repository.save(
      { propertyPrice, propertyZone, householdSize, isPrimoAccedant, annualIncome, workPercentage: workPercentage ?? 0 },
      {
        isEligible: result.isEligible,
        reasons: result.reasons ?? [],
        maxPtzAmount: result.maxPtzAmount,
        ptzRate: result.ptzRate,
        ptzDuration: result.durationInfo?.totalDurationMonths ?? result.ptzDuration,
      },
    );

    return result;
  }
}
