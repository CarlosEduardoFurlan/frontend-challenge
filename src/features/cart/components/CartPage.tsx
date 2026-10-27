import { Link, useNavigate } from '@tanstack/react-router'
import { AlertTriangle, ShoppingCart } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks'

import { useCart, useQuote, useRemoveCartItem, useUpdateCartItem } from '../hooks'
import { CartItemRow } from './CartItemRow'
import { CouponForm } from './CouponForm'
import { QuoteSummary } from './QuoteSummary'

export function CartPage() {
  const cart = useCart()
  const quote = useQuote('ethereum')
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()

  const items = cart.data?.items ?? []
  const busy = update.isPending || remove.isPending
  const blocking = quote.data?.lines.some((l) => l.status === 'sold_out') ?? false

  function goToCheckout() {
    if (!isAuthenticated) {
      void navigate({ to: '/login', search: { redirect: '/checkout', reason: 'required' } })
      return
    }
    void navigate({ to: '/checkout' })
  }

  return (
    <section className="container-page py-8" aria-labelledby="cart-title">
      <SectionHeading
        as="h1"
        id="cart-title"
        title="Carrinho"
        description="Revise itens, quantidades e cupom antes do pagamento."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          {cart.isPending ? (
            <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando carrinho">
              {Array.from({ length: 2 }).map((_, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </li>
              ))}
            </ul>
          ) : cart.isError ? (
            <ErrorState
              error={cart.error}
              onRetry={() => void cart.refetch()}
              retrying={cart.isFetching}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart />}
              title="Seu carrinho está vazio"
              description="Explore o catálogo e adicione edições ao carrinho."
              action={
                <Button asChild>
                  <Link to="/" hash="catalogo">
                    Explorar catálogo
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3" data-testid="cart-items">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  busy={busy}
                  onQuantityChange={(quantity) => update.mutate({ itemId: item.id, quantity })}
                  onRemove={() => remove.mutate(item.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <aside
          className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20"
          aria-labelledby="summary-title"
        >
          <h2 id="summary-title" className="font-display text-sm uppercase">
            Resumo
          </h2>
          {items.length > 0 ? (
            <CouponForm
              appliedCode={cart.data?.couponCode ?? null}
              description={quote.data?.coupon?.description}
            />
          ) : null}
          {quote.isError && items.length > 0 ? (
            <Alert variant="warning">
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>Não foi possível calcular os valores</AlertTitle>
              <AlertDescription>
                <Button variant="link" size="sm" onClick={() => void quote.refetch()}>
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <QuoteSummary
              quote={items.length === 0 ? undefined : quote.data}
              loading={items.length > 0 && quote.isPending}
              refreshing={quote.isFetching && !quote.isPending}
            />
          )}
          {blocking ? (
            <Alert variant="destructive" data-testid="cart-blocking">
              <AlertTriangle aria-hidden="true" />
              <AlertDescription>Remova os itens esgotados para continuar.</AlertDescription>
            </Alert>
          ) : null}
          <Button
            size="lg"
            disabled={items.length === 0 || blocking || quote.isPending}
            onClick={goToCheckout}
            data-testid="go-to-checkout"
          >
            Ir para o pagamento
          </Button>
          <p className="text-xs text-muted-foreground">
            Os valores são recalculados pela API a cada alteração. A taxa de rede final depende da
            rede escolhida no pagamento.
          </p>
        </aside>
      </div>
    </section>
  )
}
