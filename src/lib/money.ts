import Decimal from 'decimal.js'

import type { DecimalString } from './money-format'

export { formatEth, isValidDecimalString, type DecimalString } from './money-format'

/**
 * Monetary arithmetic. ETH amounts travel as decimal strings end-to-end; every operation goes
 * through decimal.js so 0.1 + 0.2 never becomes 0.30000000000000004. Only modules that compute
 * (mocks, cart, checkout, realtime reconciliation) import this file; display-only components
 * import `money-format` and stay out of the decimal.js chunk.
 */
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP })

const ETH_SCALE = 6

export function eth(value: DecimalString | number): Decimal {
  return new Decimal(value)
}

export function toEthString(value: Decimal | DecimalString | number): DecimalString {
  return new Decimal(value).toFixed(ETH_SCALE).replace(/\.?0+$/, '') || '0'
}

export function addEth(...values: Array<DecimalString | number>): DecimalString {
  return toEthString(values.reduce<Decimal>((acc, v) => acc.plus(v), new Decimal(0)))
}

export function subEth(a: DecimalString | number, b: DecimalString | number): DecimalString {
  return toEthString(new Decimal(a).minus(b))
}

export function mulEth(a: DecimalString | number, b: DecimalString | number): DecimalString {
  return toEthString(new Decimal(a).times(b))
}

export function percentOf(value: DecimalString | number, percent: number): DecimalString {
  return toEthString(new Decimal(value).times(percent).div(100))
}

export function maxEth(a: DecimalString | number, b: DecimalString | number): DecimalString {
  return toEthString(Decimal.max(a, b))
}

export function compareEth(a: DecimalString | number, b: DecimalString | number): number {
  return new Decimal(a).comparedTo(b)
}

export function isZeroEth(value: DecimalString | number): boolean {
  return new Decimal(value).isZero()
}
