import { Injectable } from '@nestjs/common';
import { PtzZone, PtzPlafond, PtzConditions, PropertyType, OperationType } from '../ptz.types';

/**
 * Service containing PTZ business rules 2025-2026
 *
 * Official sources:
 * - https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 * - https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
 *
 * Main rules (2025-2026):
 * - PTZ finances up to 40-50% of property price in zones A/A bis and B1 (collectif neuf)
 * - PTZ finances up to 30-40% of property price in zones B2 and C (collectif neuf)
 * - Percentages vary based on RFR tranches and property type
 * - Maximum duration: 20-25 years depending on zone and property type
 * - Rate: 0% (zero-interest loan)
 * - PTZ must be requested with at least one other loan (PAS, conventional, classic, PEL, complementary)
 * - One PTZ per real estate operation
 * - PTZ can finance simultaneous purchase of dependencies (garage, parking, cellar)
 */
@Injectable()
export class PtzRulesService {
  // Property price ceilings by zone and household size (in cents)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966/2_0?idFicheParent=F10871
  // Updated for 2026 PTZ guide
  // These ceilings are CALCULATION ceilings, NOT eligibility criteria.
  // If property price exceeds ceiling, borrower remains eligible but PTZ is calculated on the ceiling.
  private readonly plafondsPrix: Record<PtzZone, Record<number, number>> = {
    [PtzZone.ZONE_A_BIS]: {
      1: 17500000, // 175 000 € - 1 person
      2: 24500000, // 245 000 € - 2 persons
      3: 29750000, // 297 500 € - 3 persons
      4: 29750000, // 297 500 € - 4 persons (same as 3)
      5: 29750000, // 297 500 € - 5 persons (same as 3)
      6: 29750000, // 297 500 € - 6 persons and more (same as 3)
    },
    [PtzZone.ZONE_A]: {
      1: 15000000, // 150 000 € - 1 person
      2: 21000000, // 210 000 € - 2 persons
      3: 25500000, // 255 000 € - 3 persons
      4: 30000000, // 300 000 € - 4 persons
      5: 34500000, // 345 000 € - 5 persons
      6: 34500000, // 345 000 € - 6 persons and more (same as 5)
    },
    [PtzZone.ZONE_B1]: {
      1: 13500000, // 135 000 € - 1 person
      2: 18900000, // 189 000 € - 2 persons
      3: 23000000, // 230 000 € - 3 persons
      4: 27000000, // 270 000 € - 4 persons
      5: 31100000, // 311 000 € - 5 persons
      6: 31100000, // 311 000 € - 6 persons and more (same as 5)
    },
    [PtzZone.ZONE_B2]: {
      1: 11000000, // 110 000 € - 1 person
      2: 15400000, // 154 000 € - 2 persons
      3: 18700000, // 187 000 € - 3 persons
      4: 22000000, // 220 000 € - 4 persons
      5: 25300000, // 253 000 € - 5 persons
      6: 25300000, // 253 000 € - 6 persons and more (same as 5)
    },
    [PtzZone.ZONE_C]: {
      1: 10000000, // 100 000 € - 1 person
      2: 14000000, // 140 000 € - 2 persons
      3: 17000000, // 170 000 € - 3 persons
      4: 20000000, // 200 000 € - 4 persons
      5: 23000000, // 230 000 € - 5 persons
      6: 23000000, // 230 000 € - 6 persons and more (same as 5)
    },
  };

  // RFR (Reference Fiscal Income) ceilings by zone and household size (in cents)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966/2_0?idFicheParent=F10871
  // RFR N-2 is used to verify eligibility
  // Updated for 2026 - PTZ Guide
  private readonly plafondsRfr: Record<PtzZone, Record<number, number>> = {
    [PtzZone.ZONE_A]: {
      1: 4900000, // 49 000 € - 1 person
      2: 7350000, // 73 500 € - 2 persons (CORRECTED)
      3: 8820000, // 88 200 € - 3 persons (CORRECTED)
      4: 10290000, // 102 900 € - 4 persons
      5: 11760000, // 117 600 € - 5 persons
      6: 13230000, // 132 300 € - 6 persons and more (+14 700€)
    },
    [PtzZone.ZONE_A_BIS]: {
      1: 4900000, // 49 000 € - 1 person (same as zone A)
      2: 7350000, // 73 500 € - 2 persons (same as zone A)
      3: 8820000, // 88 200 € - 3 persons (same as zone A)
      4: 10290000, // 102 900 € - 4 persons (same as zone A)
      5: 11760000, // 117 600 € - 5 persons (same as zone A)
      6: 13230000, // 132 300 € - 6 persons and more (same as zone A)
    },
    [PtzZone.ZONE_B1]: {
      1: 3450000, // 34 500 € - 1 person (CORRECTED from 41 000€)
      2: 5175000, // 51 750 € - 2 persons (CORRECTED from 57 000€)
      3: 6210000, // 62 100 € - 3 persons (CORRECTED from 69 000€)
      4: 7245000, // 72 450 € - 4 persons
      5: 8280000, // 82 800 € - 5 persons
      6: 9315000, // 93 150 € - 6 persons and more (+10 350€)
    },
    [PtzZone.ZONE_B2]: {
      1: 2850000, // 28 500 € - 1 person
      2: 4275000, // 42 750 € - 2 persons
      3: 5130000, // 51 300 € - 3 persons
      4: 5985000, // 59 850 € - 4 persons
      5: 6840000, // 68 400 € - 5 persons
      6: 7695000, // 76 950 € - 6 persons and more (+8 550€)
    },
    [PtzZone.ZONE_C]: {
      1: 2400000, // 24 000 € - 1 person
      2: 3600000, // 36 000 € - 2 persons
      3: 4320000, // 43 200 € - 3 persons
      4: 5040000, // 50 400 € - 4 persons
      5: 5760000, // 57 600 € - 5 persons
      6: 6480000, // 64 800 € - 6 persons and more (+7 200€)
    },
  };

  // Absolute PTZ amount ceilings by zone and household size (in cents)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
  // These are maximum absolute amounts that the PTZ cannot exceed, regardless of property price.
  // Applied to: Logements collectifs neufs, Ancien avec travaux, Vente HLM, Maisons individuelles neuves
  // Since April 2025, same ceilings apply to maisons individuelles neuves.
  private readonly absoluteAmountCeilings: Record<PtzZone, Record<number, number>> = {
    [PtzZone.ZONE_A]: {
      1: 18000000, // 180 000 € - 1 person
      2: 27000000, // 270 000 € - 2 persons
      3: 32400000, // 324 000 € - 3 persons
      4: 37800000, // 378 000 € - 4 persons
      5: 43200000, // 432 000 € - 5 persons
      6: 48600000, // 486 000 € - 6 persons and more
    },
    [PtzZone.ZONE_A_BIS]: {
      1: 18000000, // 180 000 € - 1 person (same as zone A)
      2: 27000000, // 270 000 € - 2 persons (same as zone A)
      3: 32400000, // 324 000 € - 3 persons (same as zone A)
      4: 37800000, // 378 000 € - 4 persons (same as zone A)
      5: 43200000, // 432 000 € - 5 persons (same as zone A)
      6: 48600000, // 486 000 € - 6 persons and more (same as zone A)
    },
    [PtzZone.ZONE_B1]: {
      1: 13500000, // 135 000 € - 1 person
      2: 20300000, // 203 000 € - 2 persons
      3: 24300000, // 243 000 € - 3 persons
      4: 28400000, // 284 000 € - 4 persons
      5: 32400000, // 324 000 € - 5 persons
      6: 36500000, // 365 000 € - 6 persons and more
    },
    [PtzZone.ZONE_B2]: {
      1: 10800000, // 108 000 € - 1 person
      2: 16200000, // 162 000 € - 2 persons
      3: 19400000, // 194 000 € - 3 persons
      4: 22700000, // 227 000 € - 4 persons
      5: 25900000, // 259 000 € - 5 persons
      6: 29200000, // 292 000 € - 6 persons and more
    },
    [PtzZone.ZONE_C]: {
      1: 9700000,  // 97 000 € - 1 person
      2: 14600000, // 146 000 € - 2 persons
      3: 17500000, // 175 000 € - 3 persons
      4: 20400000, // 204 000 € - 4 persons
      5: 23300000, // 233 000 € - 5 persons
      6: 26200000, // 262 000 € - 6 persons and more
    },
  };

  // Base PTZ financing percentage by zone
  // Note: Actual percentages vary based on RFR tranches and property type
  // This is the maximum percentage for tranche 1 (RFR ≤ 45%)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
  private readonly loanPercentages: Record<PtzZone, number> = {
    [PtzZone.ZONE_A]: 50, // 50% max in zone A (collectif neuf, tranche 1)
    [PtzZone.ZONE_A_BIS]: 50, // 50% max in zone A bis (collectif neuf, tranche 1)
    [PtzZone.ZONE_B1]: 50, // 50% max in zone B1 (collectif neuf, tranche 1)
    [PtzZone.ZONE_B2]: 40, // 40% max in zone B2 (collectif neuf, tranche 1)
    [PtzZone.ZONE_C]: 40, // 40% max in zone C (collectif neuf, tranche 1)
  };

  // Minimum work percentage for old properties
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
  // For old properties, work must represent at least 25% of total cost
  readonly minWorkPercentage = 25; // 25% minimum work for old properties

  // PTZ rate: 0% (zero-interest loan)
  readonly ptzRate = 0; // 0% - zero rate (in basis points)

  // Maximum PTZ duration: 25 years (300 months)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
  // Maximum duration is 25 years for all eligible properties (new and old)
  readonly maxDurationMonths = 300; // 25 years maximum for all properties

  // Absolute PTZ ceiling for tranche 4 (>75%)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
  readonly maxPtzAmountTranche4 = 4500000; // 45,000€ in cents

  // RFR thresholds for determining deferred period duration (as % of ceiling)
  // Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
  // Updated for 2025-2026:
  // RFR ≤ 45%: deferred period of 10 years
  // 45% < RFR ≤ 60%: deferred period of 8 years
  // 60% < RFR ≤ 75%: deferred period of 5 years
  // RFR > 75%: no deferred period
  readonly rfrThresholds = {
    threshold45: 45, // 45% of ceiling
    threshold60: 60, // 60% of ceiling
    threshold75: 75, // 75% of ceiling
  };

  // Deferred periods in months (updated for 2026 - PTZ Guide)
  // Tranche 1 (Q1): 15 years deferred
  // Tranche 2 (Q2): 10 years deferred
  // Tranche 3 (Q3): 5 years deferred
  readonly deferredPeriods = {
    deferred15Years: 180, // 15 years deferred (Tranche 1)
    deferred10Years: 120, // 10 years deferred (Tranche 2)
    deferred5Years: 60,   // 5 years deferred (Tranche 3)
    noDeferred: 0,        // No deferred (not used in 2026)
  };

  /**
   * Get the loan percentage based on operation type and RFR tranche (2026)
   *
   * Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
   * PTZ Guide 2026 - Quotités for NEUF in zones A/A_bis/B1 vary by RFR tranche:
   * - Tranche 1 (≤45%): 50%
   * - Tranche 2 (45-60%): 40%
   * - Tranche 3 (60-75%): 40%
   * - Tranche 4 (>75%): 20%
   *
   * Fixed percentages:
   * - NEUF (zones B2, C): 40% (fixed)
   * - ANCIEN_AVEC_TRAVAUX (zones B2, C): 40% (fixed)
   * - VENTE_HLM: 20% (fixed, any zone)
   *
   * Note: Maisons individuelles are no longer eligible in zones A/A_bis/B1 as of 2026.
   * In zones B2/C, maisons individuelles are only eligible under specific conditions
   * (bail réel solidaire) which we treat as equivalent to NEUF with 50% or 40%.
   *
   * @param zone The property zone
   * @param propertyType The property type (COLLECTIF or MAISON_INDIVIDUELLE)
   * @param operationType The operation type (NEUF, ANCIEN_AVEC_TRAVAUX, or VENTE_HLM)
   * @param rfrTranche The RFR tranche (1-4)
   * @returns The loan percentage (0%, 20%, 40%, or 50%)
   */
  getLoanPercentageByTranche(
    zone: PtzZone,
    propertyType: PropertyType,
    operationType: OperationType,
    rfrTranche?: number, // kept for backward compatibility
  ): number {
    // Vente HLM: fixed 20% regardless of zone
    if (operationType === OperationType.VENTE_HLM) {
      return 20;
    }

    // Ancien avec travaux: fixed 40% (only eligible in zones B2/C)
    if (operationType === OperationType.ANCIEN_AVEC_TRAVAUX) {
      if (zone === PtzZone.ZONE_B2 || zone === PtzZone.ZONE_C) {
        return 40;
      }
      return 0; // Not eligible in other zones
    }

    // Neuf - Variable percentages by zone group and RFR tranche
    if (operationType === OperationType.NEUF) {
      // Zones A/A bis/B1: quotités vary by RFR tranche
      if (zone === PtzZone.ZONE_A || zone === PtzZone.ZONE_A_BIS || zone === PtzZone.ZONE_B1) {
        switch (rfrTranche) {
          case 1: return 50; // Tranche 1 (≤45%): 50%
          case 2: return 40; // Tranche 2 (45-60%): 40%
          case 3: return 40; // Tranche 3 (60-75%): 40%
          case 4: return 20; // Tranche 4 (>75%): 20%
          default: return 50;
        }
      }
      // Zones B2/C: 40% fixed
      if (zone === PtzZone.ZONE_B2 || zone === PtzZone.ZONE_C) {
        return 40;
      }
    }

    // Default fallback
    return 40;
  }

  /**
   * Récupère les conditions PTZ actuelles
   * @returns Les conditions complètes du PTZ avec tous les plafonds
   */
  getConditions(): PtzConditions {
    const plafonds: PtzPlafond[] = [];

    for (const zone of Object.values(PtzZone)) {
      for (let householdSize = 1; householdSize <= 6; householdSize++) {
        plafonds.push({
          zone,
          householdSize,
          maxPropertyPrice: this.getMaxPropertyPrice(zone, householdSize),
          maxLoanPercentage: this.getLoanPercentage(zone),
          maxRfr: this.getMaxRfr(zone, householdSize),
        });
      }
    }

    return {
      plafonds,
      minWorkPercentage: this.minWorkPercentage,
      ptzRate: this.ptzRate,
      maxDurationMonths: this.maxDurationMonths,
    };
  }

  /**
   * Vérifie si le prix du logement respecte le plafond PTZ
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param propertyPrice Le prix du logement en centimes
   * @param householdSize La taille du foyer (nombre de personnes)
   * @returns true si le prix est inférieur ou égal au plafond
   */
  isPropertyPriceEligible(zone: PtzZone, propertyPrice: number, householdSize: number): boolean {
    const maxPrice = this.getMaxPropertyPrice(zone, householdSize);
    return propertyPrice <= maxPrice;
  }

  /**
   * Vérifie si le RFR (Revenu Fiscal de Référence) respecte le plafond PTZ
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param annualIncome Le RFR N-2 en centimes
   * @param householdSize La taille du foyer (nombre de personnes)
   * @returns true si le RFR est inférieur ou égal au plafond
   */
  isRfrEligible(zone: PtzZone, annualIncome: number, householdSize: number): boolean {
    const maxRfr = this.getMaxRfr(zone, householdSize);
    return annualIncome <= maxRfr;
  }

  /**
   * Récupère le prix maximum du logement pour une zone et une taille de foyer
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param householdSize La taille du foyer (nombre de personnes)
   * @returns Le plafond de prix en centimes
   */
  getMaxPropertyPrice(zone: PtzZone, householdSize: number): number {
    // Cap household size between 1 and 6
    const cappedSize = Math.min(Math.max(householdSize, 1), 6);
    return this.plafondsPrix[zone][cappedSize] ?? this.plafondsPrix[zone][6];
  }

  /**
   * Récupère le plafond absolu du montant PTZ pour une zone et une taille de foyer
   *
   * Source: https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
   *
   * Ce plafond absolu s'applique APRÈS le calcul de la quotité.
   * La formule complète devient : min(prix_plafonné × quotité, plafond_absolu)
   *
   * S'applique à :
   * - Logements collectifs neufs
   * - Ancien avec travaux
   * - Vente HLM
   * - Maisons individuelles neuves (depuis avril 2025)
   *
   * @param zone La zone géographique du logement (A, A_bis, B1, B2, C)
   * @param householdSize La taille du foyer (nombre de personnes)
   * @returns Le plafond absolu du montant PTZ en centimes
   */
  getAbsoluteAmountCeiling(zone: PtzZone, householdSize: number): number {
    // Cap household size between 1 and 6
    const cappedSize = Math.min(Math.max(householdSize, 1), 6);
    return this.absoluteAmountCeilings[zone][cappedSize] ?? this.absoluteAmountCeilings[zone][6];
  }

  /**
   * Récupère le RFR maximum pour une zone et une taille de foyer
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param householdSize La taille du foyer (nombre de personnes)
   * @returns Le plafond de RFR en centimes
   */
  getMaxRfr(zone: PtzZone, householdSize: number): number {
    // Cap household size between 1 and 6
    const cappedSize = Math.min(Math.max(householdSize, 1), 6);
    return this.plafondsRfr[zone][cappedSize] ?? this.plafondsRfr[zone][6];
  }

  /**
   * Calcule le RFR effectif selon la règle du bouclier
   * Règle: RFR_effectif = max(RFR_total, cout_operation / 9)
   *
   * Source: PTZ Guide 2026
   *
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param annualIncome Le RFR N-2 en centimes
   * @param householdSize La taille du foyer (nombre de personnes)
   * @param operationCost Le coût total de l'opération en centimes
   * @returns Le RFR effectif en centimes (après application du bouclier)
   */
  calculateEffectiveRfr(
    zone: PtzZone,
    annualIncome: number,
    householdSize: number,
    operationCost: number,
  ): number {
    // Règle du bouclier: max(RFR_total, cout_operation / 9)
    const shieldValue = Math.round(operationCost / 9);
    const effectiveRfr = Math.max(annualIncome, shieldValue);
    return effectiveRfr;
  }

  /**
   * Calcule le pourcentage du RFR par rapport au plafond
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param annualIncome Le RFR N-2 en centimes
   * @param householdSize La taille du foyer (nombre de personnes)
   * @returns Le pourcentage du RFR par rapport au plafond (0-100)
   */
  calculateRfrPercentage(zone: PtzZone, annualIncome: number, householdSize: number): number {
    const maxRfr = this.getMaxRfr(zone, householdSize);
    if (maxRfr === 0) return 0;
    return Math.round((annualIncome / maxRfr) * 100);
  }

  /**
   * Calcule le pourcentage du RFR effectif (avec bouclier) par rapport au plafond
   * Cette méthode applique la règle du bouclier avant de calculer le pourcentage
   *
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @param annualIncome Le RFR N-2 en centimes
   * @param householdSize La taille du foyer (nombre de personnes)
   * @param operationCost Le coût total de l'opération en centimes
   * @returns Le pourcentage du RFR effectif par rapport au plafond (0-100)
   */
  calculateEffectiveRfrPercentage(
    zone: PtzZone,
    annualIncome: number,
    householdSize: number,
    operationCost: number,
  ): number {
    const effectiveRfr = this.calculateEffectiveRfr(zone, annualIncome, householdSize, operationCost);
    return this.calculateRfrPercentage(zone, effectiveRfr, householdSize);
  }

  /**
   * Récupère le pourcentage de financement PTZ applicable selon la zone
   * 
   * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
   * 
   * Le pourcentage de financement est le même pour :
   * - Le logement neuf
   * - L'ancien avec travaux (≥25% du coût total)
   * 
   * @param zone La zone géographique du logement (A, B1, B2, C)
   * @returns Le pourcentage de financement (30 ou 40)
   */
  getLoanPercentage(zone: PtzZone): number {
    return this.loanPercentages[zone] ?? 40;
  }

  /**
   * Calcule le pourcentage de travaux pour un bien ancien
   * @param workCost Le coût des travaux en centimes
   * @param totalCost Le coût total (acquisition + travaux) en centimes
   * @returns Le pourcentage de travaux (0-100)
   */
  calculateWorkPercentage(workCost: number, totalCost: number): number {
    if (totalCost === 0) return 0;
    return Math.round((workCost / totalCost) * 100);
  }

  /**
   * Vérifie si un bien ancien avec travaux est éligible
   * @param workPercentage Le pourcentage de travaux dans le coût total
   * @returns true si le pourcentage de travaux est ≥ 25%
   */
  isOldPropertyWithWorkEligible(workPercentage: number): boolean {
    return workPercentage >= this.minWorkPercentage;
  }

  /**
   * Vérifie si le PTZ est demandé en complément d'au moins un autre prêt
   * 
   * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
   * 
   * Le PTZ doit être demandé en complément d'au moins un autre prêt :
   * - PAS (Prêt d'Accession Sociale)
   * - Prêt conventionné
   * - Prêt classique
   * - PEL (Prêt Épargne Logement)
   * - Prêt complémentaire
   * 
   * @param hasComplementaryLoan true si un prêt complémentaire est présent
   * @returns true si la condition est respectée
   */
  hasComplementaryLoan(hasComplementaryLoan: boolean): boolean {
    return hasComplementaryLoan === true;
  }

  /**
   * Vérifie si une exception à la primo-accédance s'applique
   * 
   * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
   * 
   * Exceptions à la condition de primo-accédance :
   * - Personne divorcée ou séparée de corps
   * - Victime d'une catastrophe naturelle ou technologique
   * - Titulaire de la carte d'invalidité
   * 
   * @param hasException true si une exception s'applique
   * @returns true si une exception permet de contourner la condition de primo-accédance
   */
  hasPrimoAccedantException(hasException: boolean): boolean {
    return hasException === true;
  }

  /**
   * Vérifie si l'opération concerne l'achat de dépendances
   * 
   * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
   * 
   * Le PTZ peut financer l'achat simultané de dépendances :
   * - Garage
   * - Place de parking
   * - Cave
   * 
   * Ces dépendances doivent être achetées en même temps que le logement principal.
   * 
   * @param hasDependencies true si l'opération inclut des dépendances
   * @returns true si la condition est respectée
   */
  hasDependencies(hasDependencies: boolean): boolean {
    return hasDependencies === true;
  }

  /**
   * Vérifie l'unicité du PTZ par opération
   * 
   * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
   * 
   * Un seul PTZ peut être accordé par opération immobilière.
   * 
   * @param hasExistingPtz true si un PTZ existe déjà pour cette opération
   * @returns true si aucun PTZ n'existe pour cette opération
   */
  isUniqueOperation(hasExistingPtz: boolean): boolean {
    return hasExistingPtz === false;
  }
}
