/**
 * Display helpers for ETH amounts. Pure string handling: no decimal library is needed to
 * format, so components such as cards keep this out of the heavy arithmetic module.
 */
export type DecimalString = string

const ETH_SCALE = 6
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/

export function isValidDecimalString(value: unknown): value is DecimalString {
  return typeof value === 'string' && DECIMAL_PATTERN.test(value)
}

/** Formats for display, e.g. "0,125 ETH". Trailing zeros are trimmed, at most 6 decimals. */
export function formatEth(value: DecimalString | number, options?: { withUnit?: boolean }): string {
  const withUnit = options?.withUnit ?? true
  const raw = typeof value === 'number' ? value.toFixed(ETH_SCALE) : value
  const [intRaw = '0', fracRaw = ''] = raw.split('.')
  const fraction = fracRaw.slice(0, ETH_SCALE).replace(/0+$/, '')
  const intFormatted = new Intl.NumberFormat('pt-BR').format(Number(intRaw || '0'))
  const number = fraction ? `${intFormatted},${fraction}` : intFormatted
  return withUnit ? `${number} ETH` : number
}
