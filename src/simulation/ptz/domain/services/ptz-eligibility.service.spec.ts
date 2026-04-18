import { Test, TestingModule } from '@nestjs/testing';
import { PtzEligibilityService } from './ptz-eligibility.service';
import { PtzRulesService } from './ptz-rules.service';
import { PtzFormulaService } from './ptz-formula.service';
import { PtzZone, PropertyType, OperationType, RfrTranche } from '../ptz.types';

describe('PtzEligibilityService', () => {
  let service: PtzEligibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PtzEligibilityService,
        PtzRulesService,
        PtzFormulaService,
      ],
    }).compile();

    service = module.get<PtzEligibilityService>(PtzEligibilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkEligibility', () => {
    it('should return eligible for valid primo-accedant request', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000, // 100 000€ - dans les plafonds B1 pour 3 personnes
        propertyZone: PtzZone.ZONE_B1,
        householdSize: 3,
        isPrimoAccedant: true,
        annualIncome: 3000000, // 30 000€ - dans les plafonds RFR B1 pour 3 personnes (69 000€)
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      expect(result.isEligible).toBe(true);
      expect(result.reasons).toEqual([]);
      expect(result.maxPtzAmount).toBeDefined();
      expect(result.maxPtzAmount).toBeGreaterThan(0);
    });

    it('should return not eligible for non primo-accedant', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_B1,
        householdSize: 3,
        isPrimoAccedant: false,
        annualIncome: 3000000,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContainEqual(
        expect.stringContaining('primo-accédant'),
      );
    });

    it('should return eligible even when property price exceeds plafond (plafond is a calculation ceiling, not eligibility)', () => {
      const result = service.checkEligibility({
        propertyPrice: 200000000, // 2 000 000€ - bien au-dessus du plafond
        propertyZone: PtzZone.ZONE_B1,
        householdSize: 3,
        isPrimoAccedant: true,
        annualIncome: 3000000,
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      // The price ceiling is a calculation ceiling, not an eligibility ceiling
      // The borrower remains eligible, but the PTZ is calculated on the ceiling
      expect(result.isEligible).toBe(true);
      expect(result.maxPtzAmount).toBeDefined();
      expect(result.maxPtzAmount).toBeGreaterThan(0);
    });

    it('should return not eligible for RFR above plafond', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_B1,
        householdSize: 3,
        isPrimoAccedant: true,
        annualIncome: 100000000, // 1 000 000€ - bien au-dessus du plafond
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContainEqual(
        expect.stringContaining('RFR'),
      );
    });

    it('should return not eligible for old property with insufficient work', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_B2,
        householdSize: 3,
        isPrimoAccedant: true,
        annualIncome: 3000000,
        workPercentage: 15, // < 25%
        isOldProperty: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.ANCIEN_AVEC_TRAVAUX,
        hasComplementaryLoan: true,
      });

      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContainEqual(
        expect.stringContaining('travaux'),
      );
    });

    it('should return eligible for old property with sufficient work in zone B2', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_B2,
        householdSize: 3,
        isPrimoAccedant: true,
        annualIncome: 3000000,
        workPercentage: 30, // >= 25%
        isOldProperty: true,
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.ANCIEN_AVEC_TRAVAUX,
      });

      expect(result.isEligible).toBe(true);
    });

    it('should return not eligible for old property in zone A (only B2/C eligible)', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_A,
        householdSize: 3,
        isPrimoAccedant: true,
        annualIncome: 3000000,
        workPercentage: 30, // >= 25%
        isOldProperty: true,
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.ANCIEN_AVEC_TRAVAUX,
      });

      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContainEqual(
        expect.stringContaining('zones B2 et C'),
      );
    });

    it('should return eligible for zone A bis', () => {
      const result = service.checkEligibility({
        propertyPrice: 20000000, // 200 000€ - dans les plafonds A bis pour 2 personnes
        propertyZone: PtzZone.ZONE_A_BIS,
        householdSize: 2,
        isPrimoAccedant: true,
        annualIncome: 4000000, // 40 000€ < 59 000€ (plafond zone A bis, 2 personnes)
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      expect(result.isEligible).toBe(true);
      expect(result.maxPtzAmount).toBeGreaterThan(0);
    });

    it('should return eligible with correct duration for tranche 1 (300 months) in all zones', () => {
      // PTZ 2026: Durée de 25 ans (300 mois) uniquement pour la tranche 1
      // Pour être en tranche 1 (≤45%), le revenu doit être ≤ 45% du plafond RFR
      // Zone C, 1 personne : 24 000€ × 45% = 10 800€ → on utilise 10 000€
      const resultZoneA = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_A,
        householdSize: 1,
        isPrimoAccedant: true,
        annualIncome: 1000000, // 10 000€ → ~20% du plafond zone A (49 000€) → tranche 1
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      const resultZoneABis = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_A_BIS,
        householdSize: 1,
        isPrimoAccedant: true,
        annualIncome: 1000000, // 10 000€ → ~20% du plafond zone A bis (49 000€) → tranche 1
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      const resultZoneB2 = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_B2,
        householdSize: 1,
        isPrimoAccedant: true,
        annualIncome: 1000000, // 10 000€ → ~35% du plafond zone B2 (28 500€) → tranche 1
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      const resultZoneC = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_C,
        householdSize: 1,
        isPrimoAccedant: true,
        annualIncome: 1000000, // 10 000€ → ~42% du plafond zone C (24 000€) → tranche 1
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      // Vérifier que tous sont éligibles avant de vérifier la durée
      expect(resultZoneA.isEligible).toBe(true);
      expect(resultZoneABis.isEligible).toBe(true);
      expect(resultZoneB2.isEligible).toBe(true);
      expect(resultZoneC.isEligible).toBe(true);

      // Tranche 1 = 25 ans (300 mois)
      expect(resultZoneA.ptzDuration).toBe(300);
      expect(resultZoneABis.ptzDuration).toBe(300);
      expect(resultZoneB2.ptzDuration).toBe(300);
      expect(resultZoneC.ptzDuration).toBe(300);
    });

    it('should return correct duration info with RFR tranche (2026 values)', () => {
      const result = service.checkEligibility({
        propertyPrice: 10000000,
        propertyZone: PtzZone.ZONE_A,
        householdSize: 1,
        isPrimoAccedant: true,
        annualIncome: 1500000, // ~31% - tranche 1
        hasComplementaryLoan: true,
        propertyType: PropertyType.COLLECTIF,
        operationType: OperationType.NEUF,
      });

      expect(result.isEligible).toBe(true);
      expect(result.durationInfo).toBeDefined();
      expect(result.durationInfo?.rfrTranche).toBe(RfrTranche.TRANCHE_1);
      expect(result.durationInfo?.deferredPeriodMonths).toBe(180); // 15 years for tranche 1 (2026)
    });
  });

  describe('isPrimoAccedant', () => {
    it('should return true for primo-accedant', () => {
      expect(service.isPrimoAccedant(true)).toBe(true);
    });

    it('should return false for non primo-accedant', () => {
      expect(service.isPrimoAccedant(false)).toBe(false);
    });
  });

  describe('getZoneFromDepartmentCode', () => {
    it('should return ZONE_A for Paris department', () => {
      expect(service.getZoneFromDepartmentCode('75')).toBe(PtzZone.ZONE_A);
    });

    it('should return ZONE_A for Hauts-de-Seine', () => {
      expect(service.getZoneFromDepartmentCode('92')).toBe(PtzZone.ZONE_A);
    });

    it('should return ZONE_B1 for Gironde', () => {
      expect(service.getZoneFromDepartmentCode('33')).toBe(PtzZone.ZONE_B1);
    });

    it('should return ZONE_C for unknown department', () => {
      expect(service.getZoneFromDepartmentCode('99')).toBe(PtzZone.ZONE_C);
    });
  });
});
