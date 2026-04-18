import { Injectable } from '@nestjs/common';
import {
  PtzZone,
  PtzAmountInput,
  PtzAmountResult,
  PtzDurationInfo,
  PtzRepaymentPeriod,
  PtzRepaymentSchedule,
  RfrTranche,
  PropertyType,
  OperationType,
} from '../ptz.types';
import { PtzRulesService } from './ptz-rules.service';

/**
 * Service for PTZ formula calculations
 *
 * Official sources:
 * - https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 * - https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
 *
 * Calculation rules (2026):
 * - PTZ amount is the minimum of (price × percentage) and (ceiling × percentage)
 * - Percentages vary by RFR tranche for neuf in zones A/A_bis/B1:
 *   - Tranche 1 (≤45%): 50%, Tranche 2 (45-60%): 40%, Tranche 3 (60-75%): 40%, Tranche 4 (>75%): 20%
 * - Fixed percentages: 40% for B2/C ancien, 20% for Vente HLM
 * - Maximum duration: 20-25 years depending on RFR tranche
 * - Deferred period based on RFR tranche (PTZ Guide 2026):
 *   - Tranche 1 (Q1): 25 years total, 15 years deferred (180 months)
 *   - Tranche 2 (Q2): 22 years total, 10 years deferred (120 months)
 *   - Tranche 3 (Q3): 20 years total, 5 years deferred (60 months)
 *   - Tranche 4 (>75%): 20 years total, no deferred period (0 months)
 */
@Injectable()
export class PtzFormulaService {
  constructor(private readonly rulesService: PtzRulesService) {}

  /**
   * Computes the eligible PTZ amount
   * 
   * The PTZ amount is calculated as follows:
   * 1. Take the minimum between the property price and the zone ceiling
   * 2. Apply the financing percentage based on zone, property type, operation type, and RFR tranche
   * 
   * @param input Input data for calculation
   * @returns Calculation result with PTZ amount, rate, and duration
   */
  computePtzAmount(input: PtzAmountInput): PtzAmountResult {
    const { propertyPrice, propertyZone, householdSize, annualIncome, propertyType, operationType } = input;

    // Determine property type (default to COLLECTIF)
    const effectivePropertyType = propertyType ?? PropertyType.COLLECTIF;

    // Determine operation type - explicit operationType takes precedence
    let effectiveOperationType: OperationType;
    if (operationType !== undefined) {
      effectiveOperationType = operationType;
    } else if (input.isNewProperty === true) {
      effectiveOperationType = OperationType.NEUF;
    } else if (input.isOldProperty === true) {
      effectiveOperationType = OperationType.ANCIEN_AVEC_TRAVAUX;
    } else {
      effectiveOperationType = OperationType.NEUF; // Default to NEUF
    }

    // Calculate RFR percentage and determine tranche
    const rfrPercentage = this.rulesService.calculateRfrPercentage(propertyZone, annualIncome, householdSize);
    const rfrTranche = this.getRfrTranche(rfrPercentage);

    // Get the financing percentage based on zone, property type, operation type, and RFR tranche
    const loanPercentage = this.rulesService.getLoanPercentageByTranche(
      propertyZone,
      effectivePropertyType,
      effectiveOperationType,
      rfrTranche,
    );

    // Get the price ceiling for this zone and household size
    const maxPropertyPrice = this.rulesService.getMaxPropertyPrice(propertyZone, householdSize);

    // PTZ amount is based on the MINIMUM between actual price and ceiling
    // This ensures PTZ does not exceed regulatory limits
    const priceBase = Math.min(propertyPrice, maxPropertyPrice);
    const calculatedPtzAmount = Math.round((priceBase * loanPercentage) / 100);

    // Get the absolute amount ceiling for this zone and household size
    // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
    // The PTZ amount is capped by an absolute maximum amount that varies by zone and household size
    const absoluteAmountCeiling = this.rulesService.getAbsoluteAmountCeiling(propertyZone, householdSize);

    // Apply absolute ceiling: min(prix_plafonné × quotité, plafond_absolu)
    let maxPtzAmount = Math.min(calculatedPtzAmount, absoluteAmountCeiling);

    // Calculate duration and deferred period information
    const durationInfo = this.getOptimalDuration(propertyZone, annualIncome, householdSize);

    return {
      maxPtzAmount,
      ptzRate: this.rulesService.ptzRate,
      ptzDuration: durationInfo.totalDurationMonths,
      loanPercentage,
      durationInfo,
    };
  }

  /**
   * Determines the RFR tranche based on RFR percentage (2026 Guide)
   *
   * Tranches are now based on absolute income thresholds per zone, not just % of ceiling.
   * - Tranche 1: ≤ 45% - lowest incomes (longest deferred period)
   * - Tranche 2: 45% - 60% - middle incomes
   * - Tranche 3: 60% - 75% - higher incomes
   * - Tranche 4: > 75% - highest incomes (no deferred period)
   *
   * @param rfrPercentage The RFR as a percentage of the ceiling (0-100)
   * @returns The RFR tranche (1-4)
   */
  private getRfrTranche(rfrPercentage: number): number {
    if (rfrPercentage <= this.rulesService.rfrThresholds.threshold45) {
      return 1; // Tranche 1: ≤ 45% -> 25 years, 15 years deferred
    } else if (rfrPercentage <= this.rulesService.rfrThresholds.threshold60) {
      return 2; // Tranche 2: 45% - 60% -> 22 years, 10 years deferred
    } else if (rfrPercentage <= this.rulesService.rfrThresholds.threshold75) {
      return 3; // Tranche 3: 60% - 75% -> 20 years, 5 years deferred
    } else {
      return 4; // Tranche 4: > 75% -> 20 years, no deferred
    }
  }

  /**
   * Computes the monthly payment for a PTZ loan
   * 
   * @param ptzAmount The PTZ amount in cents
   * @param durationMonths The duration in months
   * @returns The monthly payment in cents
   */
  computeMonthlyPayment(ptzAmount: number, durationMonths: number): number {
    if (durationMonths === 0) return 0;
    return Math.round(ptzAmount / durationMonths);
  }

  /**
   * Determines PTZ duration and deferred period based on RFR (2026 Guide)
   *
   * Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
   * PTZ Guide 2026 - Updated durations:
   * - Tranche 1: 25 years total with 15 years deferred (180 months)
   * - Tranche 2: 22 years total with 10 years deferred (120 months)
   * - Tranche 3: 20 years total with 5 years deferred (60 months)
   * - Tranche 4: 20 years total with no deferred period (0 months)
   *
   * @param zone The property zone
   * @param annualIncome The RFR N-2 in cents
   * @param householdSize The household size (number of people)
   * @returns Complete information about duration and deferred period
   */
  getOptimalDuration(
    zone: PtzZone,
    annualIncome: number,
    householdSize: number,
  ): PtzDurationInfo {
    // Calculate RFR percentage relative to ceiling
    const rfrPercentage = this.rulesService.calculateRfrPercentage(zone, annualIncome, householdSize);

    // Determine RFR tranche (1-4)
    const rfrTranche = this.getRfrTranche(rfrPercentage);

    // Total duration and deferred period by tranche (2026 Guide)
    // Source: PTZ Guide 2026
    let totalDurationMonths: number;
    let deferredPeriodMonths: number;

    switch (rfrTranche) {
      case 1:
        // Tranche 1: 25 years total, 15 years deferred
        totalDurationMonths = 300; // 25 years
        deferredPeriodMonths = 180; // 15 years
        break;
      case 2:
        // Tranche 2: 22 years total, 10 years deferred
        totalDurationMonths = 264; // 22 years
        deferredPeriodMonths = 120; // 10 years
        break;
      case 3:
        // Tranche 3: 20 years total, 5 years deferred
        totalDurationMonths = 240; // 20 years
        deferredPeriodMonths = 60; // 5 years
        break;
      case 4:
      default:
        // Tranche 4: 20 years total, no deferred period
        totalDurationMonths = 240; // 20 years
        deferredPeriodMonths = 0; // no deferred
        break;
    }

    // Calculate repayment period
    const repaymentPeriodMonths = totalDurationMonths - deferredPeriodMonths;

    // Map numeric tranche to enum
    const rfrTrancheEnum = this.getRfrTrancheEnum(rfrTranche);

    return {
      totalDurationMonths,
      deferredPeriodMonths,
      repaymentPeriodMonths,
      rfrPercentage,
      rfrTranche: rfrTrancheEnum,
    };
  }

  /**
   * Maps numeric RFR tranche to enum
   * 
   * @param tranche The numeric tranche (1-4)
   * @returns The RFR tranche enum
   */
  private getRfrTrancheEnum(tranche: number): RfrTranche {
    switch (tranche) {
      case 1:
        return RfrTranche.TRANCHE_1;
      case 2:
        return RfrTranche.TRANCHE_2;
      case 3:
        return RfrTranche.TRANCHE_3;
      case 4:
      default:
        return RfrTranche.TRANCHE_4;
    }
  }
}
