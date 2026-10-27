import { EthPrice } from '@/components/shared/EthPrice'
import { Skeleton } from '@/components/ui/skeleton'
import { NETWORKS } from '@/mocks/fixtures/networks'
import type { Quote } from '@/types/api'

interface QuoteSummaryProps {
  quote: Quote | undefined
  loading?: boolean
  /** Dim the numbers while a fresh quote is being fetched. */
  refreshing?: boolean
}

/** Subtotal, discount, fee and total exactly as returned by the pricing API. */
export function QuoteSummary({ quote, loading, refreshing }: QuoteSummaryProps) {
  if (loading || !quote) {
    return (
      <div
        className="flex flex-col gap-3"
        aria-busy="true"
        aria-label="Calculando valores"
        data-testid="quote-skeleton"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    )
  }

  return (
    <dl
      className={refreshing ? 'flex flex-col gap-3 opacity-70' : 'flex flex-col gap-3'}
      data-testid="quote-summary"
      aria-busy={refreshing || undefined}
    >
      <div className="flex justify-between text-sm">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd data-testid="quote-subtotal">
          <EthPrice value={quote.subtotalEth} />
        </dd>
      </div>
      <div className="flex justify-between text-sm">
        <dt className="text-muted-foreground">
          Desconto{quote.coupon ? ` (${quote.coupon.code})` : ''}
        </dt>
        <dd className={quote.coupon ? 'text-success' : ''} data-testid="quote-discount">
          {quote.coupon ? '−' : ''}
          <EthPrice value={quote.discountEth} />
        </dd>
      </div>
      <div className="flex justify-between text-sm">
        <dt className="text-muted-foreground">Taxa de rede ({NETWORKS[quote.network].label})</dt>
        <dd data-testid="quote-fee">
          <EthPrice value={quote.networkFeeEth} />
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <dt className="font-semibold">Total</dt>
        <dd data-testid="quote-total">
          <EthPrice value={quote.totalEth} className="text-xl font-semibold text-primary" />
        </dd>
      </div>
    </dl>
  )
}
