import Decimal from 'decimal.js';

export class Percentage {
  private constructor(private readonly value: Decimal) {}

  static fromPercent(value: Decimal.Value): Percentage {
    const decimal = new Decimal(value);

    if (decimal.lessThan(0) || decimal.greaterThan(100)) {
      throw new Error('Percentage must be between 0 and 100');
    }

    return new Percentage(decimal.div(100));
  }

  toDecimal(): Decimal {
    return this.value;
  }
}
