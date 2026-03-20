import Decimal from 'decimal.js';
import {
  BorrowingCapacityInput,
  BorrowingCapacityOutput,
} from '../borrowing-capacity.types';
import { roundCurrency } from '../../../../shared-kernel/rounding-policy';

export class BorrowingCapacityFormulaService {
  compute(command: BorrowingCapacityInput): BorrowingCapacityOutput {
    const monthlyIncome = new Decimal(command.annualHouseholdIncome).div(12);
    const monthlyDebtPayments = new Decimal(command.monthlyDebtPayments);
    const maxDebtRatio = new Decimal(command.maxDebtRatioPercent).div(100);

    const monthlyPaymentCapacity = Decimal.max(
      0,
      monthlyIncome.mul(maxDebtRatio).sub(monthlyDebtPayments),
    );

    const monthlyRate = new Decimal(command.annualRatePercent)
      .div(100)
      .div(12);

    const duration = new Decimal(command.durationMonths);

    const borrowingCapacity = monthlyRate.eq(0)
      ? monthlyPaymentCapacity.mul(duration)
      : monthlyPaymentCapacity.mul(
          monthlyRate.add(1).pow(duration).sub(1).div(
            monthlyRate.mul(monthlyRate.add(1).pow(duration)),
          ),
        );

    return {
      monthlyPaymentCapacity: roundCurrency(monthlyPaymentCapacity).toNumber(),
      borrowingCapacity: roundCurrency(borrowingCapacity).toNumber(),
    };
  }
}
