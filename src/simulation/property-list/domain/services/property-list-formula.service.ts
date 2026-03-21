import Decimal from 'decimal.js';
import { roundCurrency } from '../../../../shared-kernel/rounding-policy';
import {
  DebtRatioLevel,
  PropertyItemSimulationInput,
  PropertyListSimulationInput,
  PropertyListSimulationOutput,
} from '../property-list.types';

export class PropertyListFormulaService {
  compute(command: PropertyListSimulationInput): PropertyListSimulationOutput {
    const results = command.properties.map((property) =>
      this.computeForProperty(
        property,
        command.downPayment,
        command.annualRatePercent,
        command.durationMonths,
        command.annualHouseholdIncome,
        command.monthlyCurrentDebtPayments,
      ),
    );

    return {
      annualRatePercent: command.annualRatePercent,
      durationMonths: command.durationMonths,
      downPayment: command.downPayment,
      annualHouseholdIncome: command.annualHouseholdIncome,
      monthlyCurrentDebtPayments: command.monthlyCurrentDebtPayments,
      results,
    };
  }

  private computeForProperty(
    property: PropertyItemSimulationInput,
    downPayment: number,
    annualRatePercent: number,
    durationMonths: number,
    annualHouseholdIncome: number,
    monthlyCurrentDebtPayments: number,
  ) {
    const totalRenovationBudget = property.renovationWorkItems.reduce(
      (sum, item) => sum.add(item.cost),
      new Decimal(0),
    );

    const requiredLoanAmount = Decimal.max(
      0,
      new Decimal(property.price)
        .add(totalRenovationBudget)
        .add(property.notaryFees)
        .sub(downPayment),
    );

    const monthlyRate = new Decimal(annualRatePercent).div(100).div(12);
    const duration = new Decimal(durationMonths);

    const monthlyCreditPayment = monthlyRate.eq(0)
      ? requiredLoanAmount.div(duration)
      : requiredLoanAmount.mul(
          monthlyRate.mul(monthlyRate.add(1).pow(duration)).div(
            monthlyRate.add(1).pow(duration).sub(1),
          ),
        );

    const monthlyCharges = new Decimal(property.propertyTaxAnnual)
      .add(property.coOwnershipFeesAnnual)
      .div(12);

    const monthlyPaymentWithCharges = monthlyCreditPayment.add(monthlyCharges);

    const monthlyIncome = new Decimal(annualHouseholdIncome).div(12);
    const monthlyTotalDebtPayments = monthlyCreditPayment.add(
      monthlyCurrentDebtPayments,
    );
    const debtRatioPercent = monthlyIncome.eq(0)
      ? new Decimal(0)
      : monthlyTotalDebtPayments.div(monthlyIncome).mul(100);

    const debtRatioLevel = this.getDebtRatioLevel(debtRatioPercent);

    return {
      id: property.id,
      status: property.status,
      propertyType: property.propertyType,
      listingUrl: property.listingUrl,
      departmentCode: property.departmentCode,
      addressOrSector: property.addressOrSector,
      price: roundCurrency(new Decimal(property.price)).toNumber(),
      notaryFees: roundCurrency(new Decimal(property.notaryFees)).toNumber(),
      totalRenovationBudget: roundCurrency(totalRenovationBudget).toNumber(),
      requiredLoanAmount: roundCurrency(requiredLoanAmount).toNumber(),
      monthlyCreditPayment: roundCurrency(monthlyCreditPayment).toNumber(),
      monthlyPaymentWithCharges: roundCurrency(monthlyPaymentWithCharges).toNumber(),
      debtRatioPercent: roundCurrency(debtRatioPercent).toNumber(),
      debtRatioLevel,
    };
  }

  private getDebtRatioLevel(debtRatioPercent: Decimal): DebtRatioLevel {
    if (debtRatioPercent.lessThan(32)) {
      return DebtRatioLevel.LOW;
    }

    if (debtRatioPercent.lessThanOrEqualTo(35)) {
      return DebtRatioLevel.OK;
    }

    return DebtRatioLevel.HIGH;
  }
}
