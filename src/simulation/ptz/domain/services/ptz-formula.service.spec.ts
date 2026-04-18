import { Test, TestingModule } from '@nestjs/testing';
import { PtzFormulaService } from './ptz-formula.service';
import { PtzRulesService } from './ptz-rules.service';
import { PtzZone, PropertyType, OperationType, RfrTranche } from '../ptz.types';

describe('PtzFormulaService', () => {
  let service: PtzFormulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PtzFormulaService,
        PtzRulesService,
      ],
    }).compile();

    service = module.get<PtzFormulaService>(PtzFormulaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('computePtzAmount', () => {
    describe('Collectif neuf', () => {
      it('should compute PTZ amount for zone B1 collectif neuf with 40% financing (tranche 2)', () => {
        // Zone B1, 3 persons: RFR ceiling = 62,100€ (6210000 cents)
        // RFR% = 30,000 / 62,100 = ~48% -> tranche 2 (45-60%) -> 40%
        const result = service.computePtzAmount({
          propertyPrice: 20000000, // 200 000€
          propertyZone: PtzZone.ZONE_B1,
          householdSize: 3,
          annualIncome: 3000000, // 30 000€
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.NEUF,
        });

        // Zone B1, 3 persons ceiling = 230,000€, so real price used
        // 200 000€ × 40% = 80 000€
        expect(result.maxPtzAmount).toBe(8000000);
        expect(result.ptzRate).toBe(0);
        expect(result.loanPercentage).toBe(40);
      });

      it('should compute PTZ amount with variable percentage based on RFR tranche (2026)', () => {
        // Zone B1, 3 persons - RFR ceiling = 62,100€
        // Tranche 1 (≤45%): 50%
        const result1 = service.computePtzAmount({
          propertyPrice: 20000000, // 200 000€
          propertyZone: PtzZone.ZONE_B1,
          householdSize: 3,
          annualIncome: 3000000, // 30 000€ - ~48% -> tranche 2
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.NEUF,
        });

        // Tranche 2 (45-60%): 40%
        expect(result1.loanPercentage).toBe(40);

        // Very low income -> tranche 1 (≤45%)
        const result2 = service.computePtzAmount({
          propertyPrice: 20000000, // 200 000€
          propertyZone: PtzZone.ZONE_B1,
          householdSize: 3,
          annualIncome: 2000000, // 20 000€ - ~32% -> tranche 1
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.NEUF,
        });
        expect(result2.loanPercentage).toBe(50);
      });

      it('should apply price ceiling correctly', () => {
        // Zone B1, 1 person: price ceiling = 135,000€, RFR ceiling = 34,500€
        // RFR% = 20,000 / 34,500 = ~58% -> tranche 2 (45-60%) -> 40%
        const result = service.computePtzAmount({
          propertyPrice: 20000000, // 200 000€ - exceeds ceiling
          propertyZone: PtzZone.ZONE_B1,
          householdSize: 1,
          annualIncome: 2000000, // 20 000€
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.NEUF,
        });

        // Price capped at 135 000€ × 40% = 54 000€
        expect(result.maxPtzAmount).toBe(5400000);
      });

      it('should compute PTZ amount for zone B2 collectif neuf with 40% financing (fixed)', () => {
        // Zone B2, 1 person: Fixed 40% for neuf in B2/C
        const result = service.computePtzAmount({
          propertyPrice: 10000000, // 100 000€
          propertyZone: PtzZone.ZONE_B2,
          householdSize: 1,
          annualIncome: 1500000, // 15 000€
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.NEUF,
        });

        // 100 000€ × 40% = 40 000€
        expect(result.maxPtzAmount).toBe(4000000);
        expect(result.loanPercentage).toBe(40);
      });

      it('should compute PTZ amount for zone A bis collectif neuf with 50% financing', () => {
        // Zone A bis, 1 person
        const result = service.computePtzAmount({
          propertyPrice: 15000000, // 150 000€
          propertyZone: PtzZone.ZONE_A_BIS,
          householdSize: 1,
          annualIncome: 2000000, // 20 000€
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.NEUF,
        });

        // Price ceiling A bis, 1 person = 175,000€, so real price used
        // 150 000€ × 50% = 75 000€
        expect(result.maxPtzAmount).toBe(7500000);
        expect(result.loanPercentage).toBe(50);
      });
    });

    describe('Vente HLM', () => {
      it('should compute PTZ amount for Vente HLM with 20% financing (fixed)', () => {
        // Vente HLM: fixed 20% regardless of zone
        const result = service.computePtzAmount({
          propertyPrice: 15000000, // 150 000€
          propertyZone: PtzZone.ZONE_B1,
          householdSize: 2,
          annualIncome: 3000000, // 30 000€
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.VENTE_HLM,
        });

        // 150 000€ × 20% = 30 000€
        expect(result.maxPtzAmount).toBe(3000000);
        expect(result.loanPercentage).toBe(20);
      });
    });

    describe('Ancien avec travaux', () => {
      it('should compute PTZ amount for zone B2 ancien avec travaux with 40% financing (fixed 2026)', () => {
        // Zone B2, 1 person: Fixed 40% for ancien avec travaux (2026)
        const result = service.computePtzAmount({
          propertyPrice: 10000000, // 100 000€
          propertyZone: PtzZone.ZONE_B2,
          householdSize: 1,
          annualIncome: 1500000, // 15 000€
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.ANCIEN_AVEC_TRAVAUX,
        });

        // 100 000€ × 40% = 40 000€
        expect(result.maxPtzAmount).toBe(4000000);
        expect(result.loanPercentage).toBe(40);
      });

      it('should return 0% for zone A ancien avec travaux (not eligible)', () => {
        // Ancien avec travaux is only eligible in zones B2/C
        const result = service.computePtzAmount({
          propertyPrice: 15000000, // 150 000€
          propertyZone: PtzZone.ZONE_A,
          householdSize: 1,
          annualIncome: 2000000,
          propertyType: PropertyType.COLLECTIF,
          operationType: OperationType.ANCIEN_AVEC_TRAVAUX,
        });

        // Ancien avec travaux is not eligible in zone A
        expect(result.maxPtzAmount).toBe(0);
        expect(result.loanPercentage).toBe(0);
      });
    });
  });

  describe('computeMonthlyPayment', () => {
    it('should compute correct monthly payment', () => {
      const result = service.computeMonthlyPayment(12000000, 300); // 120 000€ sur 25 ans
      expect(result).toBe(40000); // 400€ par mois
    });

    it('should return 0 for zero duration', () => {
      const result = service.computeMonthlyPayment(12000000, 0);
      expect(result).toBe(0);
    });
  });

  describe('getOptimalDuration', () => {
    it('should return correct durations per tranche (2026 Guide)', () => {
      // PTZ Guide 2026 durations:
      // Tranche 1: 25 years total, 15 years deferred
      // Tranche 2: 22 years total, 10 years deferred
      // Tranche 3: 20 years total, 5 years deferred

      // Zone A, 1 person: RFR ceiling = 49,000€ (4900000 cents)
      
      // Tranche 1 (RFR ≤ 45%): 25 years total, 15 years deferred (180 months)
      const lowRfrResult = service.getOptimalDuration(PtzZone.ZONE_A, 2000000, 1); // ~41% of 49,000€
      expect(lowRfrResult.totalDurationMonths).toBe(300); // 25 years
      expect(lowRfrResult.deferredPeriodMonths).toBe(180); // 15 years
      expect(lowRfrResult.repaymentPeriodMonths).toBe(120); // 10 years
      expect(lowRfrResult.rfrTranche).toBe(RfrTranche.TRANCHE_1);

      // Tranche 2 (45% < RFR): 22 years total, 10 years deferred (120 months)
      const mediumRfrResult = service.getOptimalDuration(PtzZone.ZONE_A, 2700000, 1); // ~55% of 49,000€
      expect(mediumRfrResult.totalDurationMonths).toBe(264); // 22 years
      expect(mediumRfrResult.deferredPeriodMonths).toBe(120); // 10 years
      expect(mediumRfrResult.repaymentPeriodMonths).toBe(144); // 12 years
      expect(mediumRfrResult.rfrTranche).toBe(RfrTranche.TRANCHE_2);

      // Tranche 3: 20 years total, 5 years deferred (60 months)
      const highRfrResult = service.getOptimalDuration(PtzZone.ZONE_A, 3500000, 1); // ~71% of 49,000€
      expect(highRfrResult.totalDurationMonths).toBe(240); // 20 years
      expect(highRfrResult.deferredPeriodMonths).toBe(60); // 5 years
      expect(highRfrResult.repaymentPeriodMonths).toBe(180); // 15 years
      expect(highRfrResult.rfrTranche).toBe(RfrTranche.TRANCHE_3);
    });

    it('should handle very high RFR as tranche 4 (>75%)', () => {
      // Very high RFR (>75%) should be tranche 4
      const veryHighRfrResult = service.getOptimalDuration(PtzZone.ZONE_A, 4500000, 1); // ~92% of 49,000€
      expect(veryHighRfrResult.totalDurationMonths).toBe(240); // 20 years (tranche 4)
      expect(veryHighRfrResult.deferredPeriodMonths).toBe(0); // no deferred period
      expect(veryHighRfrResult.rfrTranche).toBe(RfrTranche.TRANCHE_4);
    });

    it('should calculate correct RFR percentage for different zones', () => {
      // Zone A, 1 person: RFR ceiling = 49,000€ (2026)
      const zoneAResult = service.getOptimalDuration(PtzZone.ZONE_A, 2450000, 1); // 50% of ceiling
      expect(zoneAResult.rfrPercentage).toBe(50);

      // Zone B1, 2 persons: RFR ceiling = 51,750€ (2026)
      const zoneB1Result = service.getOptimalDuration(PtzZone.ZONE_B1, 2587500, 2); // 50% of ceiling
      expect(zoneB1Result.rfrPercentage).toBe(50);
    });
  });
});
