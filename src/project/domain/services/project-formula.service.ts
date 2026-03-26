// filepath: src/project/domain/services/project-formula.service.ts
import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { BorrowingCapacityFormulaService } from '../../../simulation/borrowing-capacity/domain/services/borrowing-capacity-formula.service';
import { NotaryFeesRulesService } from '../../../simulation/notary-fees/domain/services/notary-fees-rules.service';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';
import { ScenarioInput, ScenarioOutput } from '../scenario.types';
import { roundCurrency } from '../../../shared-kernel/rounding-policy';

export const PROJECT_FORMULA_SERVICE = Symbol('PROJECT_FORMULA_SERVICE');

@Injectable()
export class ProjectFormulaService {
  constructor(
    private readonly borrowingCapacityService: BorrowingCapacityFormulaService,
    private readonly notaryFeesService: NotaryFeesRulesService,
  ) {}

  execute(input: ScenarioInput): ScenarioOutput {
    // 1. Capacité d'emprunt
    const borrowingResult = this.borrowingCapacityService.compute({
      annualHouseholdIncome: input.annualHouseholdIncome,
      monthlyDebtPayments: input.monthlyCurrentDebtPayments,
      annualRatePercent: input.annualRatePercent,
      durationMonths: input.durationMonths,
      maxDebtRatioPercent: input.maxDebtRatioPercent,
    });

    // 2. Frais de notaire estimés
    // On estime le prix du bien = borrowingCapacity + downPayment
    // (le prix du bien correspond à ce que l'utilisateur peut financer)
    const estimatedPropertyPrice = borrowingResult.borrowingCapacity + input.downPayment;

    const notaryResult = this.notaryFeesService.compute({
      propertyPrice: estimatedPropertyPrice,
      propertyType: input.propertyType as PropertyType,
      departmentCode: input.departmentCode,
    });

    // 3. Budget total = emprunt + apport - frais de notaire
    const totalBudget = roundCurrency(
      new Decimal(borrowingResult.borrowingCapacity)
        .plus(input.downPayment)
        .minus(notaryResult.notaryFees),
    ).toNumber();

    // 4. Mensualité crédit ≈ capacité de remboursement mensuel
    const monthlyCreditPayment = borrowingResult.monthlyPaymentCapacity;

    return {
      monthlyPaymentCapacity: borrowingResult.monthlyPaymentCapacity,
      borrowingCapacity: borrowingResult.borrowingCapacity,
      notaryFees: notaryResult.notaryFees,
      totalBudget,
      monthlyCreditPayment,
      computedAt: new Date().toISOString(),
      computationVersion: '1.0.0',
    };
  }
}
