import type { DecimalString } from '@/lib/money'

export interface CouponSeed {
  code: string
  description: string
  type: 'percent' | 'fixed'
  value: DecimalString
  /** ISO date; `null` never expires. */
  expiresAt: string | null
  minSubtotalEth: DecimalString
}

export const COUPONS: CouponSeed[] = [
  {
    code: 'BEMVINDO10',
    description: '10% de desconto no subtotal',
    type: 'percent',
    value: '10',
    expiresAt: null,
    minSubtotalEth: '0',
  },
  {
    code: 'JUNGLE20',
    description: '20% de desconto para compras acima de 1 ETH',
    type: 'percent',
    value: '20',
    expiresAt: null,
    minSubtotalEth: '1',
  },
  {
    code: 'FIXO005',
    description: '0,05 ETH de desconto',
    type: 'fixed',
    value: '0.05',
    expiresAt: null,
    minSubtotalEth: '0.1',
  },
  {
    code: 'EXPIRADO',
    description: 'Cupom de campanha encerrada',
    type: 'percent',
    value: '30',
    expiresAt: '2026-01-01T00:00:00.000Z',
    minSubtotalEth: '0',
  },
]
