import { EthPrice } from '@/components/shared/EthPrice'
import { Skeleton } from '@/components/ui/skeleton'
import { NETWORKS } from '@/mocks/fixtures/networks'
import { cn } from '@/lib/utils'
import type { Quote } from '@/types/api'

interface QuoteSummaryProps {
  quote: Quote | undefined
  loading?: boolean
  /** Dim the numbers while a fresh quote is being fetched. */
  refreshing?: boolean
  className?: string
}

/**
 * Figma "Resumo da carteira" lines: Subtotal / Desconto do lançamento / Taxa de rede (16px,
 * values right-aligned), the "Taxa estimada" caption in text-accent, a hairline and the
 * Total row (bold label, 18px bold text-accent value). Values come straight from the API.
 */
export function QuoteSummary({ quote, loading, refreshing, className }: QuoteSummaryProps) {
  if (loading || !quote) {
    return (
      <div
        className={cn('flex flex-col gap-3', className)}
        aria-busy="true"
        aria-label="Calculando valores"
        data-testid="quote-skeleton"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
        <div className="flex justify-between border-t border-primary/60 pt-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    )
  }

  return (
    <dl
      className={cn('flex flex-col gap-3 text-base', refreshing && 'opacity-70', className)}
      data-testid="quote-summary"
      aria-busy={refreshing || undefined}
    >
      <div className="flex items-baseline justify-between gap-4">
        <dt>Subtotal</dt>
        <dd data-testid="quote-subtotal">
          <EthPrice value={quote.subtotalEth} />
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt>Desconto{quote.coupon ? ` (${quote.coupon.code})` : ' do lançamento'}</dt>
        <dd className={quote.coupon ? 'text-success' : ''} data-testid="quote-discount">
          {quote.coupon ? '−' : '(-) '}
          <EthPrice value={quote.discountEth} />
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt>Taxa de rede</dt>
        <dd data-testid="quote-fee">
          <EthPrice value={quote.networkFeeEth} />
        </dd>
      </div>
      <div className="-mt-2 flex justify-end text-xs text-text-accent">
        <dt className="sr-only">Observação sobre a taxa</dt>
        <dd>Taxa estimada · {NETWORKS[quote.network].label}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-primary/60 pt-3">
        <dt className="font-bold">Total</dt>
        <dd data-testid="quote-total">
          <EthPrice value={quote.totalEth} className="text-lg font-bold text-text-accent" />
        </dd>
      </div>
    </dl>
  )
}
