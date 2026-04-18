import { Injectable } from '@nestjs/common';
import {
  PtzZone,
  PtzEligibilityInput,
  PtzEligibilityResult,
  PtzAmountInput,
  PrimoAccedantException,
  PropertyType,
  OperationType,
} from '../ptz.types';
import { PtzRulesService } from './ptz-rules.service';
import { PtzFormulaService } from './ptz-formula.service';

/**
 * PTZ eligibility service
 * Verifies all PTZ eligibility conditions
 *
 * Official sources:
 * - https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 * - https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
 */
@Injectable()
export class PtzEligibilityService {
  constructor(
    private readonly rulesService: PtzRulesService,
    private readonly formulaService: PtzFormulaService,
  ) {}

  /**
   * Checks complete PTZ eligibility for a project
   *
   * Conditions checked:
   * 1. First-time buyer status (with possible exceptions)
   * 2. RFR ceiling
   * 3. Complementary loan (required)
   * 4. Work for old properties (if applicable)
   * 5. PTZ uniqueness per operation
   *
   * Note: The property price ceiling is NOT an eligibility criterion.
   * It is a CALCULATION ceiling: if the property costs more, the borrower remains
   * eligible for PTZ, but the amount is calculated on the ceiling (via Math.min in ptz-formula.service.ts).
   */
  checkEligibility(input: PtzEligibilityInput): PtzEligibilityResult {
    const reasons: string[] = [];

    // 1. Check first-time buyer condition (with exceptions)
    const hasException = input.primoAccedantException !== undefined;
    if (!input.isPrimoAccedant && !hasException) {
      reasons.push('Vous devez être primo-accédant (ne pas avoir été propriétaire de votre résidence principale dans les 2 dernières années)');
    }

    // 2. Check RFR ceiling
    if (!this.rulesService.isRfrEligible(input.propertyZone, input.annualIncome, input.householdSize)) {
      const maxRfr = this.rulesService.getMaxRfr(input.propertyZone, input.householdSize);
      reasons.push(`Votre RFR (${input.annualIncome / 100}€) dépasse le plafond PTZ pour la zone ${input.propertyZone} (${maxRfr / 100}€)`);
    }

    // 4. Check complementary loan condition
    // PTZ must be requested in addition to at least one other loan
    if (!this.rulesService.hasComplementaryLoan(input.hasComplementaryLoan ?? false)) {
      reasons.push('Le PTZ doit être demandé en complément d\'au moins un autre prêt (PAS, conventionné, classique, PEL, ou prêt complémentaire)');
    }

    // 5. Check work condition for old properties
    // Old properties with work are only eligible in zones B2 and C
    if (input.workPercentage !== undefined && input.workPercentage > 0) {
      if (!this.rulesService.isOldPropertyWithWorkEligible(input.workPercentage)) {
        reasons.push(`Pour un bien ancien, les travaux doivent représenter au moins ${this.rulesService.minWorkPercentage}% du coût total (actuellement ${input.workPercentage}%)`);
      }
      // Check if ancien avec travaux is in eligible zone (B2 or C only)
      const effectiveOperationType = input.isOldProperty === true ? OperationType.ANCIEN_AVEC_TRAVAUX : OperationType.NEUF;
      if (effectiveOperationType === OperationType.ANCIEN_AVEC_TRAVAUX) {
        if (input.propertyZone !== PtzZone.ZONE_B2 && input.propertyZone !== PtzZone.ZONE_C) {
          reasons.push('Pour un bien ancien avec travaux, seules les zones B2 et C sont éligibles au PTZ');
        }
      }
    }

    // 6. Check PTZ uniqueness per operation
    // Only one PTZ can be granted per real estate operation
    // This check requires a database query via the repository
    // For now, we assume it's checked upstream if operationId is provided

    // If not eligible, return the reasons
    if (reasons.length > 0) {
      return {
        isEligible: false,
        reasons,
      };
    }

    // Calculate PTZ amount if eligible
    const amountInput: PtzAmountInput = {
      propertyPrice: input.propertyPrice,
      propertyZone: input.propertyZone,
      householdSize: input.householdSize,
      annualIncome: input.annualIncome,
      workPercentage: input.workPercentage,
      propertyType: input.propertyType ?? PropertyType.COLLECTIF,
      operationType: input.isOldProperty === true ? OperationType.ANCIEN_AVEC_TRAVAUX : OperationType.NEUF,
    };

    const amountResult = this.formulaService.computePtzAmount(amountInput);
    const durationInfo = this.formulaService.getOptimalDuration(
      input.propertyZone,
      input.annualIncome,
      input.householdSize,
    );

    return {
      isEligible: true,
      reasons: [],
      maxPtzAmount: amountResult.maxPtzAmount,
      ptzRate: amountResult.ptzRate,
      ptzDuration: durationInfo.totalDurationMonths,
      durationInfo,
    };
  }

  /**
   * Only checks the first-time buyer condition
   * @param isPrimoAccedant true if the user is a first-time buyer
   * @param exception exception to first-time buyer rule (optional)
   * @returns true if the condition is met
   */
  isPrimoAccedant(isPrimoAccedant: boolean, exception?: PrimoAccedantException): boolean {
    if (isPrimoAccedant) {
      return true;
    }
    // Check if an exception applies
    return exception !== undefined;
  }

  /**
   * Checks if a first-time buyer exception is valid
   *
   * Valid exceptions:
   * - Divorced or legally separated person
   * - Victim of a natural or technological disaster
   * - Holder of a disability card
   *
   * @param exception The exception to check
   * @returns true if the exception is valid
   */
  isValidPrimoAccedantException(exception: PrimoAccedantException | undefined): boolean {
    if (!exception) {
      return false;
    }
    return Object.values(PrimoAccedantException).includes(exception);
  }

  /**
   * Determines the PTZ zone of a department
   * This method can be extended with a complete mapping
   * @param departmentCode The department code (e.g., "75", "33")
   * @returns The corresponding PTZ zone
   */
  getZoneFromDepartmentCode(departmentCode: string): PtzZone {
    // Simplified mapping - to be completed with real codes
    const zoneAMapping = ['75', '92', '93', '94', '06', '13'];
    const zoneB1Mapping = ['33', '34', '38', '44', '59', '69', '74', '31', '35', '49'];
    const zoneB2Mapping = ['01', '02', '03', '04', '05', '07', '08', '09', '10', '11'];

    if (zoneAMapping.includes(departmentCode)) {
      return PtzZone.ZONE_A;
    }
    if (zoneB1Mapping.includes(departmentCode)) {
      return PtzZone.ZONE_B1;
    }
    if (zoneB2Mapping.includes(departmentCode)) {
      return PtzZone.ZONE_B2;
    }
    return PtzZone.ZONE_C; // Default
  }
}
