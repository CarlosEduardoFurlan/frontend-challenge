import { formatEth, type DecimalString } from '@/lib/money'
import { cn } from '@/lib/utils'

interface EthPriceProps {
  value: DecimalString
  className?: string
  /** Renders a strike-through previous price next to the current one. */
  previous?: DecimalString
}

export function EthPrice({ value, previous, className }: EthPriceProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-2 tabular-nums', className)}>
      <span>{formatEth(value)}</span>
      {previous && previous !== value ? (
        <s className="text-xs text-muted-foreground" aria-label={`antes ${formatEth(previous)}`}>
          {formatEth(previous)}
        </s>
      ) : null}
    </span>
  )
}
