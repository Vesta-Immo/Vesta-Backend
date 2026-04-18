import { Test, TestingModule } from '@nestjs/testing';
import { PtzRulesService } from './ptz-rules.service';
import { PtzZone, PropertyType, OperationType } from '../ptz.types';

describe('PtzRulesService', () => {
  let service: PtzRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PtzRulesService],
    }).compile();

    service = module.get<PtzRulesService>(PtzRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConditions', () => {
    it('should return PTZ conditions with all zones including A bis', () => {
      const conditions = service.getConditions();

      expect(conditions.plafonds).toBeDefined();
      expect(conditions.plafonds.length).toBeGreaterThan(0);
      expect(conditions.minWorkPercentage).toBe(25);
      expect(conditions.ptzRate).toBe(0);
      expect(conditions.maxDurationMonths).toBe(300);

      // Check that zone A bis is included
      const zoneABisPlafonds = conditions.plafonds.filter(p => p.zone === PtzZone.ZONE_A_BIS);
      expect(zoneABisPlafonds.length).toBe(6); // 6 household sizes
    });
  });

  describe('isPropertyPriceEligible', () => {
    it('should return true for property price below plafond', () => {
      const result = service.isPropertyPriceEligible(PtzZone.ZONE_B1, 10000000, 3); // 100 000€
      expect(result).toBe(true);
    });

    it('should return false for property price above plafond', () => {
      const result = service.isPropertyPriceEligible(PtzZone.ZONE_B1, 25000000, 3); // 250 000€ (plafond = 230 000€)
      expect(result).toBe(false);
    });

    it('should handle household size capping', () => {
      const result = service.isPropertyPriceEligible(PtzZone.ZONE_B1, 13000000, 10); // 130 000€ avec 10 personnes
      expect(result).toBe(true);
    });

    it('should return true for zone A bis with correct price', () => {
      const result = service.isPropertyPriceEligible(PtzZone.ZONE_A_BIS, 17500000, 1); // 175 000€
      expect(result).toBe(true);
    });
  });

  describe('isRfrEligible', () => {
    it('should return true for RFR below plafond', () => {
      const result = service.isRfrEligible(PtzZone.ZONE_B1, 5000000, 3); // 50 000€
      expect(result).toBe(true);
    });

    it('should return false for RFR above plafond', () => {
      const result = service.isRfrEligible(PtzZone.ZONE_B1, 7000000, 3); // 70 000€
      expect(result).toBe(false);
    });

    it('should return correct RFR plafond for zone A (2026 values)', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_A, 1)).toBe(4900000); // 49 000€
      expect(service.getMaxRfr(PtzZone.ZONE_A, 2)).toBe(7350000); // 73 500€ (CORRECTED)
      expect(service.getMaxRfr(PtzZone.ZONE_A, 3)).toBe(8820000); // 88 200€ (CORRECTED)
    });

    it('should return correct RFR plafond for zone A bis', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_A_BIS, 1)).toBe(4900000); // 49 000€ (same as zone A)
      expect(service.getMaxRfr(PtzZone.ZONE_A_BIS, 2)).toBe(7350000); // 73 500€ (same as zone A)
      expect(service.getMaxRfr(PtzZone.ZONE_A_BIS, 3)).toBe(8820000); // 88 200€ (same as zone A)
    });

    it('should return correct RFR plafond for zone B1 (2026 values)', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_B1, 1)).toBe(3450000); // 34 500€ (CORRECTED)
      expect(service.getMaxRfr(PtzZone.ZONE_B1, 2)).toBe(5175000); // 51 750€ (CORRECTED)
      expect(service.getMaxRfr(PtzZone.ZONE_B1, 3)).toBe(6210000); // 62 100€ (CORRECTED)
    });

    it('should return correct RFR plafond for zone B2 (2026 values)', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_B2, 1)).toBe(2850000); // 28 500€
      expect(service.getMaxRfr(PtzZone.ZONE_B2, 2)).toBe(4275000); // 42 750€
    });

    it('should return correct RFR plafond for zone C (2026 values)', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_C, 1)).toBe(2400000); // 24 000€
      expect(service.getMaxRfr(PtzZone.ZONE_C, 2)).toBe(3600000); // 36 000€
    });
  });

  describe('getMaxPropertyPrice', () => {
    it('should return correct plafond for zone A bis (2026 values)', () => {
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_A_BIS, 1)).toBe(17500000); // 175 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_A_BIS, 2)).toBe(24500000); // 245 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_A_BIS, 3)).toBe(29750000); // 297 500€
    });

    it('should return correct plafond for zone A (2026 values)', () => {
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_A, 1)).toBe(15000000); // 150 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_A, 2)).toBe(21000000); // 210 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_A, 3)).toBe(25500000); // 255 000€
    });

    it('should return correct plafond for zone B1 (2026 values)', () => {
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_B1, 1)).toBe(13500000); // 135 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_B1, 2)).toBe(18900000); // 189 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_B1, 3)).toBe(23000000); // 230 000€
    });

    it('should return correct plafond for zone B2 (2026 values)', () => {
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_B2, 1)).toBe(11000000); // 110 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_B2, 2)).toBe(15400000); // 154 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_B2, 3)).toBe(18700000); // 187 000€
    });

    it('should return correct plafond for zone C (2026 values)', () => {
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_C, 1)).toBe(10000000); // 100 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_C, 2)).toBe(14000000); // 140 000€
      expect(service.getMaxPropertyPrice(PtzZone.ZONE_C, 3)).toBe(17000000); // 170 000€
    });
  });

  describe('getMaxRfr', () => {
    it('should return correct RFR plafond for zone A (2026)', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_A, 1)).toBe(4900000); // 49 000€
      expect(service.getMaxRfr(PtzZone.ZONE_A, 3)).toBe(8820000); // 88 200€
    });

    it('should return correct RFR plafond for zone A bis', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_A_BIS, 1)).toBe(4900000); // 49 000€
      expect(service.getMaxRfr(PtzZone.ZONE_A_BIS, 3)).toBe(8820000); // 88 200€
    });

    it('should return correct RFR plafond for zone B1 (2026)', () => {
      expect(service.getMaxRfr(PtzZone.ZONE_B1, 1)).toBe(3450000); // 34 500€
      expect(service.getMaxRfr(PtzZone.ZONE_B1, 3)).toBe(6210000); // 62 100€
    });
  });

  describe('getLoanPercentageByTranche', () => {
    describe('Fixed percentages for 2026', () => {
      it('should return variable quotités for neuf in zones A/A bis/B1 based on RFR tranche', () => {
        // Zone A - Neuf: quotités vary by RFR tranche
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A, PropertyType.COLLECTIF, OperationType.NEUF, 1)).toBe(50); // Tranche 1: 50%
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A, PropertyType.COLLECTIF, OperationType.NEUF, 2)).toBe(40); // Tranche 2: 40%
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A, PropertyType.COLLECTIF, OperationType.NEUF, 3)).toBe(40); // Tranche 3: 40%
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A, PropertyType.COLLECTIF, OperationType.NEUF, 4)).toBe(20); // Tranche 4: 20%

        // Zone A bis - same as zone A
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A_BIS, PropertyType.COLLECTIF, OperationType.NEUF, 1)).toBe(50);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A_BIS, PropertyType.COLLECTIF, OperationType.NEUF, 2)).toBe(40);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A_BIS, PropertyType.COLLECTIF, OperationType.NEUF, 4)).toBe(20);

        // Zone B1 - same as zone A
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B1, PropertyType.COLLECTIF, OperationType.NEUF, 1)).toBe(50);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B1, PropertyType.COLLECTIF, OperationType.NEUF, 2)).toBe(40);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B1, PropertyType.COLLECTIF, OperationType.NEUF, 4)).toBe(20);
      });

      it('should return 40% for neuf in zones B2/C (fixed)', () => {
        // Zone B2 - Neuf: 40% fixed
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.NEUF, 1)).toBe(40);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.NEUF, 2)).toBe(40);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.NEUF, 3)).toBe(40);

        // Zone C - same as zone B2
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_C, PropertyType.COLLECTIF, OperationType.NEUF, 1)).toBe(40);
      });

      it('should return 40% for ancien avec travaux in zones B2/C (fixed)', () => {
        // Zone B2 - Old with work: 40% fixed (2026)
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.ANCIEN_AVEC_TRAVAUX, 1)).toBe(40);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.ANCIEN_AVEC_TRAVAUX, 2)).toBe(40);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.ANCIEN_AVEC_TRAVAUX, 3)).toBe(40);

        // Zone C - same as zone B2
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_C, PropertyType.COLLECTIF, OperationType.ANCIEN_AVEC_TRAVAUX, 1)).toBe(40);
      });

      it('should return 20% for Vente HLM (fixed, any zone)', () => {
        // Vente HLM: 20% fixed regardless of zone
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A, PropertyType.COLLECTIF, OperationType.VENTE_HLM, 1)).toBe(20);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B1, PropertyType.COLLECTIF, OperationType.VENTE_HLM, 1)).toBe(20);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B2, PropertyType.COLLECTIF, OperationType.VENTE_HLM, 1)).toBe(20);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_C, PropertyType.COLLECTIF, OperationType.VENTE_HLM, 1)).toBe(20);
      });

      it('should return 0% for ancien avec travaux in zone A (not eligible)', () => {
        // Ancien avec travaux is only eligible in zones B2/C
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_A, PropertyType.COLLECTIF, OperationType.ANCIEN_AVEC_TRAVAUX, 1)).toBe(0);
        expect(service.getLoanPercentageByTranche(PtzZone.ZONE_B1, PropertyType.COLLECTIF, OperationType.ANCIEN_AVEC_TRAVAUX, 1)).toBe(0);
      });
    });
  });

  describe('calculateWorkPercentage', () => {
    it('should calculate correct work percentage', () => {
      const result = service.calculateWorkPercentage(5000000, 20000000); // 50k travaux / 200k total
      expect(result).toBe(25);
    });

    it('should return 0 when total cost is 0', () => {
      const result = service.calculateWorkPercentage(5000000, 0);
      expect(result).toBe(0);
    });
  });

  describe('isOldPropertyWithWorkEligible', () => {
    it('should return true for work percentage >= 25%', () => {
      expect(service.isOldPropertyWithWorkEligible(25)).toBe(true);
      expect(service.isOldPropertyWithWorkEligible(30)).toBe(true);
    });

    it('should return false for work percentage < 25%', () => {
      expect(service.isOldPropertyWithWorkEligible(20)).toBe(false);
      expect(service.isOldPropertyWithWorkEligible(10)).toBe(false);
    });
  });

  describe('deferred periods (2026)', () => {
    it('should have correct deferred periods for 2026', () => {
      expect(service.deferredPeriods.deferred15Years).toBe(180); // 15 years for tranche 1 (2026)
      expect(service.deferredPeriods.deferred10Years).toBe(120); // 10 years for tranche 2
      expect(service.deferredPeriods.deferred5Years).toBe(60);   // 5 years for tranche 3
      expect(service.deferredPeriods.noDeferred).toBe(0);        // Not used in 2026
    });
  });

  describe('getAbsoluteAmountCeiling', () => {
    it('should return correct absolute ceiling for zone A', () => {
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A, 1)).toBe(18000000); // 180 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A, 2)).toBe(27000000); // 270 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A, 3)).toBe(32400000); // 324 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A, 6)).toBe(48600000); // 486 000€
    });

    it('should return correct absolute ceiling for zone A bis', () => {
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A_BIS, 1)).toBe(18000000); // 180 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A_BIS, 2)).toBe(27000000); // 270 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A_BIS, 6)).toBe(48600000); // 486 000€
    });

    it('should return correct absolute ceiling for zone B1', () => {
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B1, 1)).toBe(13500000); // 135 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B1, 2)).toBe(20300000); // 203 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B1, 3)).toBe(24300000); // 243 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B1, 6)).toBe(36500000); // 365 000€
    });

    it('should return correct absolute ceiling for zone B2', () => {
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B2, 1)).toBe(10800000); // 108 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B2, 2)).toBe(16200000); // 162 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_B2, 6)).toBe(29200000); // 292 000€
    });

    it('should return correct absolute ceiling for zone C', () => {
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_C, 1)).toBe(9700000);  // 97 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_C, 2)).toBe(14600000); // 146 000€
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_C, 6)).toBe(26200000); // 262 000€
    });

    it('should handle household size capping', () => {
      // Should use size 6 for household size > 6
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A, 10)).toBe(48600000);
      // Should use size 1 for household size < 1
      expect(service.getAbsoluteAmountCeiling(PtzZone.ZONE_A, 0)).toBe(18000000);
    });
  });

  describe('calculateEffectiveRfr (Bouclier rule)', () => {
    it('should return RFR when it is higher than cost/9', () => {
      // RFR = 50 000€, Cost = 300 000€, Cost/9 = 33 333€
      // Effective RFR = max(50 000, 33 333) = 50 000€
      const result = service.calculateEffectiveRfr(PtzZone.ZONE_A, 5000000, 2, 30000000);
      expect(result).toBe(5000000);
    });

    it('should return cost/9 when it is higher than RFR', () => {
      // RFR = 30 000€, Cost = 400 000€, Cost/9 = 44 444€
      // Effective RFR = max(30 000, 44 444) = 44 444€
      const result = service.calculateEffectiveRfr(PtzZone.ZONE_A, 3000000, 2, 40000000);
      expect(result).toBe(4444444); // rounded
    });

    it('should calculate effective RFR percentage with bouclier', () => {
      // Zone A, 2 persons: ceiling = 73,500€
      // RFR = 30 000€, Cost = 400 000€, Cost/9 = 44 444€
      // Effective RFR = 44 444€
      // Percentage = 44 444 / 73 500 = 60.4% -> rounded to 60%
      const result = service.calculateEffectiveRfrPercentage(PtzZone.ZONE_A, 3000000, 2, 40000000);
      expect(result).toBe(60);
    });
  });
});
