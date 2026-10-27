import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Package } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EthPrice } from '@/components/shared/EthPrice'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks'
import { ordersListQuery } from '@/features/orders/queries'
import { formatDateTime } from '@/lib/format'
import type { Order } from '@/types/api'

export const Route = createFileRoute('/account/orders')({
  component: OrdersPage,
})

const STATUS_BADGE: Record<
  Order['status'],
  { label: string; variant: 'warning' | 'success' | 'destructive' }
> = {
  pending: { label: 'Pendente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'success' },
  rejected: { label: 'Recusado', variant: 'destructive' },
}

function OrdersPage() {
  const { userId } = useSession()
  const orders = useQuery({ ...ordersListQuery(userId ?? ''), enabled: Boolean(userId) })

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        as="h1"
        title="Pedidos"
        description="Histórico das compras simuladas desta conta."
      />
      {orders.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando pedidos">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.isError ? (
        <ErrorState
          error={orders.error}
          onRetry={() => void orders.refetch()}
          retrying={orders.isFetching}
        />
      ) : orders.data.items.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="Nenhum pedido ainda"
          description="Suas compras aparecerão aqui com status e recibo."
          action={
            <Button asChild>
              <Link to="/" hash="catalogo">
                Explorar catálogo
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3" data-testid="orders-list">
          {orders.data.items.map((order) => (
            <li key={order.id}>
              <Link
                to="/orders/$orderId"
                params={{ orderId: order.id }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors outline-none hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="order-row"
                data-status={order.status}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                  <span className="text-sm font-medium">
                    {order.items.length} item(ns) · {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_BADGE[order.status].variant}>
                    {STATUS_BADGE[order.status].label}
                  </Badge>
                  <EthPrice
                    value={order.totalEth}
                    className="text-sm font-semibold text-text-accent"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
