import Decimal from 'decimal.js';
import { NotaryFeesInput, NotaryFeesOutput, PropertyType } from '../notary-fees.types';
import { roundCurrency } from '../../../../shared-kernel/rounding-policy';

export class NotaryFeesRulesService {
  compute(command: NotaryFeesInput): NotaryFeesOutput {
    const baseRate =
      command.propertyType === PropertyType.OLD
        ? new Decimal(0.078)
        : new Decimal(0.028);
    const surchargeDepartments = new Set(['75', '92', '93', '94']);
    const surcharge =
      command.propertyType === PropertyType.OLD &&
      command.departmentCode &&
      surchargeDepartments.has(command.departmentCode)
        ? new Decimal(0.002)
        : new Decimal(0);

    const appliedRate = baseRate.add(surcharge);
    const notaryFees = new Decimal(command.propertyPrice).mul(appliedRate);

    return {
      notaryFees: roundCurrency(notaryFees).toNumber(),
      appliedRatePercent: appliedRate.mul(100).toDecimalPlaces(2).toNumber(),
    };
  }
}
