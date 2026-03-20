import Decimal from 'decimal.js';

export const roundCurrency = (value: Decimal): Decimal =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
