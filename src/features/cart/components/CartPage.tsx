import { Link, useNavigate } from '@tanstack/react-router'
import { AlertTriangle, ShoppingCart } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { MobileTopBar } from '@/components/shared/MobileChrome'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks'
import { RelatedNfts } from '@/features/nft/components/RelatedNfts'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/use-media-query'

import { useCart, useQuote, useRemoveCartItem, useUpdateCartItem } from '../hooks'
import { CART_COLUMNS, CartItemRow } from './CartItemRow'
import { CouponForm } from './CouponForm'
import { QuoteSummary } from './QuoteSummary'

/**
 * Desktop ("Desktop / Carrinho de NFTs", 11:1278): breadcrumb, a table of items (NFTs · Preço ·
 * Edições · Total) with a hairline under the header, and the "Resumo da carteira" column on
 * the right. Mobile ("Mobile / Carrinho", 16:360): round back button with the centred title,
 * item cards and a rounded panel with the promo pill, the totals and the "Conectar e
 * finalizar" pill button.
 */
export function CartPage() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const cart = useCart()
  const quote = useQuote('ethereum')
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()

  const items = cart.data?.items ?? []
  const busy = update.isPending || remove.isPending
  const blocking = quote.data?.lines.some((l) => l.status === 'sold_out') ?? false
  const variant = isDesktop ? 'desktop' : 'mobile'

  function goToCheckout() {
    if (!isAuthenticated) {
      void navigate({ to: '/login', search: { redirect: '/checkout', reason: 'required' } })
      return
    }
    void navigate({ to: '/checkout' })
  }

  const list = cart.isPending ? (
    <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando carrinho">
      {Array.from({ length: 2 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 rounded-lg bg-card p-3">
          <Skeleton className="size-[70px] rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  ) : cart.isError ? (
    <ErrorState error={cart.error} onRetry={() => void cart.refetch()} retrying={cart.isFetching} />
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
          variant={variant}
          onQuantityChange={(quantity) => update.mutate({ itemId: item.id, quantity })}
          onRemove={() => remove.mutate(item.id)}
        />
      ))}
    </ul>
  )

  const summary = (
    <>
      {items.length > 0 ? (
        <CouponForm
          appliedCode={cart.data?.couponCode ?? null}
          description={quote.data?.coupon?.description}
          variant={variant}
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
        className="w-full"
        size={isDesktop ? 'default' : 'pill'}
        disabled={items.length === 0 || blocking || quote.isPending}
        onClick={goToCheckout}
        data-testid="go-to-checkout"
      >
        Conectar e finalizar
      </Button>
    </>
  )

  if (!isDesktop) {
    return (
      <>
        <section aria-labelledby="cart-title">
          <MobileTopBar title="Carrinho de NFTs" backTo="/" backHash="catalogo" />
          <div className="px-6">{list}</div>
          <aside className="mt-4 flex flex-col gap-5 rounded-t-[26px] bg-card px-6 pt-8 pb-8">
            <h2 className="sr-only">Resumo da carteira</h2>
            {summary}
          </aside>
        </section>
        <RelatedNfts
          title="Colecionadores também viram"
          excludeIds={items.map((item) => item.nftId)}
          testId="cart-related-grid"
        />
      </>
    )
  }

  return (
    <>
      <section className="container-page pt-8" aria-labelledby="cart-title">
        <Breadcrumbs
          items={[
            { label: 'Início', to: '/' },
            { label: 'Mercado', to: '/', hash: 'catalogo' },
            { label: 'Carrinho' },
          ]}
        />
        <h1 id="cart-title" className="sr-only">
          Carrinho
        </h1>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_332px] lg:gap-[86px]">
          <div className="flex flex-col gap-3">
            <div
              className={`hairline grid items-end gap-x-4 pb-2 text-base font-bold ${CART_COLUMNS}`}
              aria-hidden="true"
            >
              <span>NFTs</span>
              <span className="hidden sm:block">Preço</span>
              <span className="hidden sm:block">Edições</span>
              <span className="hidden sm:block">Total</span>
              <span />
            </div>
            {list}
          </div>

          <aside className="flex flex-col gap-5" aria-labelledby="summary-title">
            <h2 id="summary-title" className="hairline pb-2 text-lg font-bold">
              Resumo da carteira
            </h2>
            {summary}
            <Link
              to="/"
              hash="catalogo"
              className="self-center text-base text-text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Continuar explorando
            </Link>
          </aside>
        </div>
      </section>
      <RelatedNfts
        title="Colecionadores também viram"
        excludeIds={items.map((item) => item.nftId)}
        testId="cart-related-grid"
      />
    </>
  )
}
