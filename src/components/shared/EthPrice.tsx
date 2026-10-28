import { formatEth, type DecimalString } from '@/lib/money-format'
import { cn } from '@/lib/utils'

interface EthPriceProps {
  value: DecimalString
  className?: string
  /** Renders the previous price next to the current one (Figma: "1.99 ETH 2.29 ETH", brass). */
  previous?: DecimalString
}

export function EthPrice({ value, previous, className }: EthPriceProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-3 tabular-nums', className)}>
      <span>{formatEth(value)}</span>
      {previous && previous !== value ? (
        <s
          className="font-normal text-brass no-underline"
          aria-label={`antes ${formatEth(previous)}`}
        >
          {formatEth(previous)}
        </s>
      ) : null}
    </span>
  )
}
