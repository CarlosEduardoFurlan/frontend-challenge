import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Clock, MailOpen, X, XCircle } from 'lucide-react'
import { useEffect } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EthPrice } from '@/components/shared/EthPrice'
import { artworkThumb } from '@/components/shared/NftImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, shortenAddress, tokenId } from '@/lib/format'
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
      <div
        className="container-page flex justify-center py-10 lg:py-[165px]"
        aria-busy="true"
        aria-label="Carregando pedido"
      >
        <div className="w-full max-w-[578px] rounded-lg bg-card p-8">
          <Skeleton className="mx-auto size-20 rounded-full" />
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
    title: 'Aguardando confirmação da rede',
    description:
      'O pagamento simulado está sendo processado. Você pode fechar ou atualizar esta página: o pedido continua daqui.',
    variant: 'warning',
  },
  confirmed: {
    label: 'Confirmado',
    title: 'Seus NFTs agora estão na sua carteira',
    description:
      'Transação confirmada. A propriedade foi transferida para sua carteira conectada e registrada na rede.',
    variant: 'success',
  },
  rejected: {
    label: 'Recusado',
    title: 'Pagamento recusado',
    description: 'Nenhum valor foi debitado e os itens continuam no seu carrinho.',
    variant: 'destructive',
  },
}

/**
 * Figma "Desktop / Confirmação de pedido" (11:4385): a 578px panel on color/surface-card with
 * the "thank you" envelope, the status line, a four-column metadata strip (ID da transação,
 * Data, Total, Carteira) separated by primary hairlines, the "Detalhes da transação" table,
 * fee and total rows, the confirmation copy and the primary action; a 10px primary bar closes
 * the panel. The envelope illustration of the design was not exported (MCP rate limit), so a
 * line icon stands in for it.
 */
export function OrderReceipt({ order }: { order: Order }) {
  const status = STATUS[order.status]

  return (
    <article
      className="container-page flex justify-center py-10 lg:py-[165px]"
      data-testid="order-receipt"
      data-status={order.status}
      data-order-id={order.id}
    >
      <div className="relative w-full max-w-[578px] overflow-hidden rounded-lg bg-card pb-[10px]">
        <Link
          to="/"
          hash="catalogo"
          aria-label="Fechar e voltar ao mercado"
          className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-sm text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden="true" />
        </Link>

        <div className="flex flex-col items-center gap-4 px-8 pt-6 text-center">
          {order.status === 'pending' ? (
            <Clock className="size-[70px] animate-pulse text-primary" aria-hidden="true" />
          ) : order.status === 'confirmed' ? (
            <MailOpen className="size-[70px] text-primary" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <XCircle
              className="size-[70px] text-destructive"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
          <h1 className="text-base font-bold text-text-accent" data-testid="order-title">
            {status.title}
          </h1>
          <Badge variant={status.variant} data-testid="order-status">
            {status.label}
          </Badge>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-y-3 border-y border-primary px-8 py-3 text-sm sm:grid-cols-4">
          <div className="flex flex-col gap-1 sm:border-r sm:border-primary sm:pr-3">
            <dt className="font-bold">ID da transação</dt>
            <dd className="truncate font-mono text-muted-foreground" data-testid="order-id">
              {order.id}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:border-r sm:border-primary sm:px-3">
            <dt>Data</dt>
            <dd className="text-muted-foreground">{formatDateTime(order.createdAt)}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:border-r sm:border-primary sm:px-3">
            <dt>Total</dt>
            <dd className="text-muted-foreground">
              <EthPrice value={order.totalEth} />
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:pl-3">
            <dt className="font-bold">Carteira</dt>
            <dd className="truncate text-muted-foreground" title={order.wallet.address}>
              {order.wallet.label}
            </dd>
          </div>
        </dl>

        <div className="px-8 pt-6 sm:px-11">
          <h2 className="text-[15px] font-bold">Detalhes da transação</h2>
          <div
            className="mt-3 grid grid-cols-[minmax(0,1fr)_80px_110px] gap-x-3 border-b border-border-soft pb-2 text-base font-bold"
            aria-hidden="true"
          >
            <span>NFTs</span>
            <span className="text-center">Edições</span>
            <span className="text-right">Subtotal</span>
          </div>
          <ul className="flex flex-col gap-3 py-3" data-testid="order-items">
            {order.items.map((item) => (
              <li
                key={`${item.nftId}-${item.editionId}`}
                className="grid grid-cols-[minmax(0,1fr)_80px_110px] items-center gap-x-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={artworkThumb(item.imageUrl)}
                    alt=""
                    width={70}
                    height={70}
                    className="size-[70px] shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">
                      <Link
                        to="/nft/$nftId"
                        params={{ nftId: item.nftId }}
                        className="hover:text-text-accent"
                      >
                        {item.name}
                      </Link>
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">
                      ID do token: {tokenId(item.nftId)} · {item.editionName}
                    </p>
                  </div>
                </div>
                <span className="text-center text-sm text-muted-foreground">
                  (x {item.quantity})
                </span>
                <EthPrice
                  value={item.lineTotalEth}
                  className="justify-end text-lg font-bold text-text-accent"
                />
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2 border-b border-primary pb-3 text-base">
            <div className="grid grid-cols-[minmax(0,1fr)_110px] items-baseline gap-x-4">
              <dt className="text-right">Subtotal</dt>
              <dd className="text-right">
                <EthPrice value={order.subtotalEth} />
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_110px] items-baseline gap-x-4">
              <dt className="text-right">
                Desconto{order.coupon ? ` (${order.coupon.code})` : ''}
              </dt>
              <dd className="text-right">
                {order.coupon ? '−' : '(-) '}
                <EthPrice value={order.discountEth} />
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_110px] items-baseline gap-x-4">
              <dt className="text-right">Taxa de rede</dt>
              <dd className="text-right">
                <EthPrice value={order.networkFeeEth} />
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_110px] items-baseline gap-x-4">
              <dt className="text-right font-bold">Total</dt>
              <dd className="text-right" data-testid="order-total">
                <EthPrice value={order.totalEth} className="text-lg font-bold text-text-accent" />
              </dd>
            </div>
          </dl>

          <p
            role="status"
            aria-live="polite"
            className="mx-auto mt-4 max-w-[470px] text-center text-sm leading-[22px] text-muted-foreground"
          >
            {status.description}
            {order.status === 'confirmed' ? ` Rede: ${NETWORKS[order.network].label}.` : ''}
          </p>
          {order.txHash ? (
            <p
              className="mt-2 text-center font-mono text-xs text-muted-foreground"
              data-testid="order-tx"
            >
              Transação {shortenAddress(order.txHash, 10)}
            </p>
          ) : null}
          {order.rejectionReason ? (
            <p className="mt-2 text-center text-sm text-destructive" data-testid="order-rejection">
              Motivo: {order.rejectionReason}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col items-center gap-3 pb-8 sm:flex-row sm:justify-center">
            {order.status === 'rejected' ? (
              <Button asChild>
                <Link to="/cart">Voltar ao carrinho</Link>
              </Button>
            ) : order.explorerUrl ? (
              <Button asChild>
                <a href={order.explorerUrl} target="_blank" rel="noreferrer">
                  Ver no explorador
                </a>
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
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[10px] bg-primary" />
      </div>
    </article>
  )
}
