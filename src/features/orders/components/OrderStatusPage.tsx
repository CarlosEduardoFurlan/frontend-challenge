import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Clock, ExternalLink, XCircle } from 'lucide-react'
import { useEffect } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EthPrice } from '@/components/shared/EthPrice'
import { Logo } from '@/components/shared/Logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, shortenAddress } from '@/lib/format'
import { NETWORKS } from '@/mocks/fixtures/networks'
import { isApiError } from '@/services/api/errors'
import type { Order } from '@/types/api'

import { orderQuery } from '../queries'

interface OrderStatusPageProps {
  userId: string
  orderId: string
}

export function OrderStatusPage({ userId, orderId }: OrderStatusPageProps) {
  const order = useQuery(orderQuery(userId, orderId))
  const queryClient = useQueryClient()
  const status = order.data?.status

  // A confirmed order consumed stock and cart quantities server-side: refresh those caches.
  useEffect(() => {
    if (status === 'confirmed') {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
    }
  }, [status, queryClient])

  if (order.isPending) {
    return (
      <div className="container-page py-10" aria-busy="true" aria-label="Carregando pedido">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <Skeleton className="mx-auto h-8 w-40" />
          <Skeleton className="mx-auto mt-4 h-6 w-64" />
          <Skeleton className="mt-8 h-40 w-full" />
        </div>
      </div>
    )
  }

  if (order.isError) {
    const notFound = isApiError(order.error) && order.error.status === 404
    return (
      <div className="container-page py-16">
        {notFound ? (
          <EmptyState
            title="Pedido não encontrado"
            description="Este pedido não existe ou pertence a outra conta."
            action={
              <Button asChild>
                <Link to="/account/orders">Meus pedidos</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            error={order.error}
            onRetry={() => void order.refetch()}
            retrying={order.isFetching}
          />
        )}
      </div>
    )
  }

  return <OrderReceipt order={order.data} />
}

const STATUS: Record<
  Order['status'],
  {
    label: string
    title: string
    description: string
    variant: 'warning' | 'success' | 'destructive'
  }
> = {
  pending: {
    label: 'Pendente',
    title: 'Aguardando confirmação',
    description:
      'O pagamento simulado está sendo processado. Você pode fechar ou atualizar esta página: o pedido continua daqui.',
    variant: 'warning',
  },
  confirmed: {
    label: 'Confirmado',
    title: 'Compra confirmada',
    description: 'O pagamento simulado foi aprovado. Este recibo é um snapshot imutável do pedido.',
    variant: 'success',
  },
  rejected: {
    label: 'Recusado',
    title: 'Pagamento recusado',
    description: 'Nenhum valor foi debitado e os itens continuam no seu carrinho.',
    variant: 'destructive',
  },
}

export function OrderReceipt({ order }: { order: Order }) {
  const status = STATUS[order.status]

  return (
    <article
      className="container-page py-10"
      data-testid="order-receipt"
      data-status={order.status}
      data-order-id={order.id}
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="[&>span]:inline" />
          {order.status === 'pending' ? (
            <Clock className="size-10 animate-pulse text-warning" aria-hidden="true" />
          ) : order.status === 'confirmed' ? (
            <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
          ) : (
            <XCircle className="size-10 text-destructive" aria-hidden="true" />
          )}
          <h1 className="font-display text-xl uppercase" data-testid="order-title">
            {status.title}
          </h1>
          <Badge variant={status.variant} data-testid="order-status">
            {status.label}
          </Badge>
          <p role="status" aria-live="polite" className="max-w-prose text-sm text-muted-foreground">
            {status.description}
          </p>
        </div>

        <Separator className="my-6 bg-primary/60" />

        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Pedido</dt>
          <dd className="font-mono" data-testid="order-id">
            {order.id}
          </dd>
          <dt className="text-muted-foreground">Data</dt>
          <dd>{formatDateTime(order.createdAt)}</dd>
          <dt className="text-muted-foreground">Colecionador</dt>
          <dd>
            {order.collector.name} · {order.collector.email}
          </dd>
          <dt className="text-muted-foreground">Carteira</dt>
          <dd className="font-mono" title={order.wallet.address}>
            {order.wallet.label} · {shortenAddress(order.wallet.address, 6)}
          </dd>
          <dt className="text-muted-foreground">Rede</dt>
          <dd>{NETWORKS[order.network].label}</dd>
          {order.txHash ? (
            <>
              <dt className="text-muted-foreground">Transação</dt>
              <dd className="font-mono break-all" data-testid="order-tx">
                {shortenAddress(order.txHash, 10)}{' '}
                {order.explorerUrl ? (
                  <a
                    href={order.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  >
                    explorer simulado <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                ) : null}
              </dd>
            </>
          ) : null}
          {order.rejectionReason ? (
            <>
              <dt className="text-muted-foreground">Motivo</dt>
              <dd data-testid="order-rejection">{order.rejectionReason}</dd>
            </>
          ) : null}
        </dl>

        <Separator className="my-6" />

        <ul className="flex flex-col divide-y divide-border" data-testid="order-items">
          {order.items.map((item) => (
            <li key={`${item.nftId}-${item.editionId}`} className="flex items-center gap-3 py-3">
              <img
                src={item.imageUrl.replace(/-1\.webp$/, '-1-sm.webp')}
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="hover:underline">
                    {item.name}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.editionName} · {item.quantity}× <EthPrice value={item.unitPriceEth} />
                </p>
              </div>
              <EthPrice value={item.lineTotalEth} className="text-sm font-semibold" />
            </li>
          ))}
        </ul>

        <Separator className="my-6" />

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>
              <EthPrice value={order.subtotalEth} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Desconto{order.coupon ? ` (${order.coupon.code})` : ''}
            </dt>
            <dd>
              {order.coupon ? '−' : ''}
              <EthPrice value={order.discountEth} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Taxa de rede</dt>
            <dd>
              <EthPrice value={order.networkFeeEth} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-2">
            <dt className="font-semibold">Total</dt>
            <dd data-testid="order-total">
              <EthPrice value={order.totalEth} className="text-xl font-semibold text-primary" />
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {order.status === 'rejected' ? (
            <Button asChild>
              <Link to="/cart">Voltar ao carrinho</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/" hash="catalogo">
                Continuar explorando
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/account/orders">Meus pedidos</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
