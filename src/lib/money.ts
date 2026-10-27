import Decimal from 'decimal.js'

/**
 * Monetary helpers. ETH amounts travel as decimal strings end-to-end; arithmetic goes
 * through decimal.js so 0.1 + 0.2 never becomes 0.30000000000000004.
 */
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP })

export type DecimalString = string

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

/** Formats for display, e.g. "0,125 ETH". Trailing zeros are trimmed, at most 6 decimals. */
export function formatEth(value: DecimalString | number, options?: { withUnit?: boolean }): string {
  const withUnit = options?.withUnit ?? true
  const decimal = new Decimal(value)
  const fixed = decimal.toFixed(ETH_SCALE)
  const [intPart = '0', fracPart = ''] = fixed.split('.')
  const trimmedFrac = fracPart.replace(/0+$/, '')
  const intFormatted = new Intl.NumberFormat('pt-BR').format(Number(intPart))
  const number = trimmedFrac ? `${intFormatted},${trimmedFrac}` : intFormatted
  return withUnit ? `${number} ETH` : number
}

export function isValidDecimalString(value: unknown): value is DecimalString {
  if (typeof value !== 'string') return false
  return /^\d+(\.\d+)?$/.test(value)
}
