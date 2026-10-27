import { EthPrice } from '@/components/shared/EthPrice'
import { Badge } from '@/components/ui/badge'
import type { Quote, QuoteLine } from '@/types/api'

const STATUS_LABEL: Record<QuoteLine['status'], string | null> = {
  ok: null,
  price_changed: 'Preço atualizado',
  quantity_reduced: 'Quantidade reduzida',
  sold_out: 'Esgotado',
}

/** Items of the order exactly as priced by the API. */
export function QuoteLines({ quote }: { quote: Quote }) {
  return (
    <ul className="flex flex-col divide-y divide-border" data-testid="quote-lines">
      {quote.lines.map((line) => (
        <li
          key={line.cartItemId}
          className="flex items-center gap-3 py-3"
          data-testid="quote-line"
          data-status={line.status}
        >
          <img
            src={line.imageUrl.replace(/-1\.webp$/, '-1-sm.webp')}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-md object-cover"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{line.name}</p>
            <p className="text-xs text-muted-foreground">
              {line.editionName} · {line.quantity}×{' '}
              <EthPrice value={line.unitPriceEth} previous={line.previousUnitPriceEth} />
            </p>
            {STATUS_LABEL[line.status] ? (
              <Badge
                variant={line.status === 'sold_out' ? 'destructive' : 'warning'}
                className="mt-1"
              >
                {STATUS_LABEL[line.status]}
                {line.status === 'quantity_reduced'
                  ? ` (${line.requestedQuantity} → ${line.quantity})`
                  : ''}
              </Badge>
            ) : null}
          </div>
          <EthPrice value={line.lineTotalEth} className="text-sm font-semibold" />
        </li>
      ))}
    </ul>
  )
}
