import Decimal from 'decimal.js';

export class Money {
  private constructor(private readonly value: Decimal) {}

  static from(value: Decimal.Value): Money {
    const decimal = new Decimal(value);
    if (decimal.isNegative()) {
      throw new Error('Money cannot be negative');
    }
    return new Money(decimal);
  }

  add(other: Money): Money {
    return new Money(this.value.add(other.value));
  }

  subtract(other: Money): Money {
    const result = this.value.sub(other.value);
    if (result.isNegative()) {
      throw new Error('Money result cannot be negative');
    }
    return new Money(result);
  }

  toNumber(): number {
    return this.value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  }
}
