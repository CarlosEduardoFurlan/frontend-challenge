import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ErrorState } from '@/components/shared/ErrorState'
import { announce } from '@/components/shared/LiveAnnouncer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { applyApiErrors } from '@/features/auth/apply-api-errors'
import { useQuote } from '@/features/cart/hooks'
import { QuoteSummary } from '@/features/cart/components/QuoteSummary'
import { profileQuery } from '@/features/profile/hooks'
import { useWallets } from '@/features/wallets/hooks'
import { queryKeys } from '@/lib/query-keys'
import { isApiError, toApiError } from '@/services/api/errors'
import type { NetworkId, Quote, User } from '@/types/api'

import { clearDraft, newIdempotencyKey, readDraft, writeDraft, type CheckoutDraft } from '../draft'
import { useCreateOrder, useWalletConnection } from '../hooks'
import { checkoutFormSchema, formatCpf, type CheckoutFormInput } from '../schemas'
import { QuoteLines } from './QuoteLines'
import { WalletSelector } from './WalletSelector'

interface CheckoutPageProps {
  user: User
}

/**
 * Figma "Desktop / Pagamento" (11:2862) and "Mobile / Pagamento" (16:748): breadcrumb,
 * "Perfil do colecionador" two-column form on the left; "Seus NFTs" lines, totals, "Carteira e
 * rede" options and the "Confirmar compra" button on the right.
 */
export function CheckoutPage({ user }: CheckoutPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const initialDraft = useMemo(() => readDraft(user.id), [user.id])
  const profile = useQuery(profileQuery(user.id))
  const wallets = useWallets()

  const [walletId, setWalletId] = useState<string | null>(initialDraft?.walletId ?? null)
  const [network, setNetwork] = useState<NetworkId>(initialDraft?.network ?? 'ethereum')
  const connection = useWalletConnection()
  const quote = useQuote(network)
  const createOrder = useCreateOrder(user.id)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingRecovery, setPendingRecovery] = useState(false)

  /** Version of the quote the user explicitly reviewed. A different version blocks the order. */
  const [acknowledgedVersion, setAcknowledgedVersion] = useState<string | null>(null)
  const idempotencyKey = useRef<string | null>(initialDraft?.idempotencyKey ?? null)

  const form = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: initialDraft?.collector.name ?? user.name,
      email: initialDraft?.collector.email ?? user.email,
      document: initialDraft?.collector.document ?? '',
      acceptedTerms: (initialDraft?.acceptedTerms ?? false) as true,
    },
    mode: 'onTouched',
  })

  // Pre-select the primary wallet once wallets arrive (unless the draft already chose one).
  useEffect(() => {
    if (!wallets.data || walletId) return
    const first = wallets.data.primary ?? wallets.data.secondary
    if (first) setWalletId(first.id)
  }, [wallets.data, walletId])

  // Persist the draft on every relevant change.
  const values = form.watch()
  useEffect(() => {
    const draft: CheckoutDraft = {
      userId: user.id,
      collector: { name: values.name, email: values.email, document: values.document },
      walletId,
      network,
      acceptedTerms: Boolean(values.acceptedTerms),
      idempotencyKey: idempotencyKey.current,
      orderId: initialDraft?.orderId ?? null,
    }
    writeDraft(draft)
  }, [
    values.name,
    values.email,
    values.document,
    values.acceptedTerms,
    walletId,
    network,
    user.id,
    initialDraft?.orderId,
  ])

  // Changing wallet or network invalidates the simulated connection.
  useEffect(() => {
    connection.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, network])

  // First successful quote is implicitly reviewed; later versions must be acknowledged again.
  const quoteVersion = quote.data?.quoteVersion ?? null
  useEffect(() => {
    if (quoteVersion && acknowledgedVersion === null) setAcknowledgedVersion(quoteVersion)
  }, [quoteVersion, acknowledgedVersion])
  const quoteStale = Boolean(
    quoteVersion && acknowledgedVersion && quoteVersion !== acknowledgedVersion,
  )
  useEffect(() => {
    if (quoteStale)
      announce('Os valores do pedido mudaram. Revise antes de confirmar.', 'assertive')
  }, [quoteStale])

  const cartEmpty = quote.cart.data ? quote.cart.data.items.length === 0 : false
  const blockingLine = quote.data?.lines.some((l) => l.quantity === 0) ?? false
  const canSubmit =
    !cartEmpty &&
    !blockingLine &&
    !quoteStale &&
    Boolean(walletId) &&
    connection.state.status === 'connected' &&
    Boolean(quote.data) &&
    !createOrder.isPending

  function acknowledgeQuote(next: Quote | undefined) {
    if (next) setAcknowledgedVersion(next.quoteVersion)
  }

  async function onSubmit(input: CheckoutFormInput) {
    setSubmitError(null)
    if (!walletId || !quote.data) return
    // Revalidate before sending: a fresh quote must match what the user reviewed.
    const fresh = await quote.refetch()
    const latest = fresh.data
    if (!latest) {
      setSubmitError('Não foi possível revalidar a cotação. Tente novamente.')
      return
    }
    if (latest.quoteVersion !== acknowledgedVersion) {
      announce('Os valores mudaram. Revise a nova cotação antes de confirmar.', 'assertive')
      return
    }
    // One key per attempt, reused on retries (timeouts, transient errors).
    idempotencyKey.current ??= newIdempotencyKey()
    const body = {
      quoteId: latest.quoteId,
      quoteVersion: latest.quoteVersion,
      walletId,
      network,
      collector: {
        name: input.name,
        email: input.email,
        document: input.document.replace(/\D/g, ''),
      },
      acceptedTerms: true as const,
    }
    try {
      const order = await createOrder.mutateAsync({ idempotencyKey: idempotencyKey.current, body })
      clearDraft()
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      await navigate({ to: '/orders/$orderId', params: { orderId: order.id }, replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.isNetworkError) {
        // The request may have reached the server. Retrying with the same key recovers it.
        setPendingRecovery(true)
        setSubmitError('A resposta demorou demais. Verificando se o pedido foi registrado…')
        try {
          const recovered = await createOrder.mutateAsync({
            idempotencyKey: idempotencyKey.current,
            body,
          })
          clearDraft()
          void queryClient.invalidateQueries({ queryKey: ['cart'] })
          await navigate({
            to: '/orders/$orderId',
            params: { orderId: recovered.id },
            replace: true,
          })
          return
        } catch (retryError) {
          setSubmitError(toApiError(retryError).message)
        } finally {
          setPendingRecovery(false)
        }
        return
      }
      if (
        isApiError(error) &&
        (error.code === 'price_changed' ||
          error.code === 'quote_expired' ||
          error.code === 'availability_conflict')
      ) {
        // Server-side revalidation failed: fetch the new quote and ask for a new confirmation.
        setAcknowledgedVersion('__stale__')
        await queryClient.invalidateQueries({
          queryKey: [...queryKeys.cart(quote.cart.ownerKey), 'quote'],
        })
        setSubmitError(error.message)
        return
      }
      if (isApiError(error) && error.code === 'idempotency_conflict') {
        idempotencyKey.current = newIdempotencyKey()
      }
      setSubmitError(
        applyApiErrors(error, form.setError, ['name', 'email', 'document', 'acceptedTerms']),
      )
    }
  }

  const breadcrumbs = (
    <Breadcrumbs
      items={[
        { label: 'Início', to: '/' },
        { label: 'Mercado', to: '/', hash: 'catalogo' },
        { label: 'Pagamento' },
      ]}
    />
  )

  if (wallets.isPending || profile.isPending || quote.cart.isPending) {
    return (
      <div className="container-page pt-8" aria-busy="true" aria-label="Carregando pagamento">
        {breadcrumbs}
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_405px] lg:gap-8">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-6 w-56" />
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (wallets.isError || quote.cart.isError) {
    const error = wallets.error ?? quote.cart.error
    return (
      <div className="container-page py-8">
        <ErrorState
          error={error}
          onRetry={() => void Promise.all([wallets.refetch(), quote.cart.refetch()])}
        />
      </div>
    )
  }

  if (cartEmpty) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Seu carrinho está vazio"
          description="Adicione itens ao carrinho antes de ir para o pagamento."
          className="border-border bg-card"
        />
        <div className="mt-4 text-center">
          <Button asChild>
            <Link to="/" hash="catalogo">
              Explorar catálogo
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="container-page pt-8" aria-labelledby="checkout-title">
      {breadcrumbs}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_405px] lg:gap-8"
          data-testid="checkout-form"
        >
          <div className="flex flex-col gap-6">
            <h1 id="checkout-title" className="text-lg leading-none font-bold">
              Perfil do colecionador
            </h1>
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nome completo</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>CPF</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(event) => field.onChange(formatCpf(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <WalletSelector
              wallets={wallets.data}
              walletId={walletId}
              network={network}
              connection={connection.state}
              onWalletChange={setWalletId}
              onNetworkChange={setNetwork}
              onConnect={() => walletId && void connection.connect(walletId, network)}
            />
          </div>

          <aside className="flex flex-col gap-5" aria-labelledby="review-title">
            <h2 id="review-title" className="text-lg leading-none font-bold">
              Seus NFTs
            </h2>

            {quote.isError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Não foi possível cotar o pedido</AlertTitle>
                <AlertDescription>
                  {toApiError(quote.error).message}{' '}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => void quote.refetch()}
                  >
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            ) : quote.data ? (
              <QuoteLines quote={quote.data} />
            ) : (
              <Skeleton className="h-24 w-full" />
            )}

            <p className="text-center text-sm">
              Tem um código promocional?{' '}
              <Link
                to="/cart"
                className="text-text-accent underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Aplique no carrinho
              </Link>
            </p>

            {quoteStale ? (
              <Alert variant="warning" data-testid="quote-stale">
                <AlertTriangle aria-hidden="true" />
                <AlertTitle>Os valores mudaram</AlertTitle>
                <AlertDescription>
                  <p>
                    Preço, disponibilidade, cupom ou taxa foram atualizados. Revise o resumo e
                    confirme novamente.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-sm"
                    onClick={() => acknowledgeQuote(quote.data)}
                    data-testid="acknowledge-quote"
                  >
                    <RefreshCw aria-hidden="true" /> Revisei os novos valores
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            {blockingLine ? (
              <Alert variant="destructive" data-testid="checkout-blocking">
                <AlertTriangle aria-hidden="true" />
                <AlertDescription>
                  Um item ficou indisponível.{' '}
                  <Link to="/cart" className="font-bold underline underline-offset-4">
                    Ajustar o carrinho
                  </Link>
                </AlertDescription>
              </Alert>
            ) : null}

            <QuoteSummary
              quote={quote.data}
              loading={quote.isPending}
              refreshing={quote.isFetching && !quote.isPending}
            />

            <FormField
              control={form.control}
              name="acceptedTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        className="mt-0.5"
                        data-testid="accept-terms"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-sm leading-5 font-normal">
                      Li e aceito os termos da compra simulada. Nenhum valor real é cobrado.
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <Alert variant={pendingRecovery ? 'info' : 'destructive'} data-testid="submit-error">
                <AlertCircle aria-hidden="true" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              className="w-full lg:h-10 lg:rounded-md lg:bg-primary lg:bg-none lg:text-base"
              size="pill"
              disabled={!canSubmit}
              loading={createOrder.isPending}
              data-testid="confirm-order"
            >
              Confirmar compra
            </Button>
            <p className="text-xs text-muted-foreground">
              {connection.state.status !== 'connected'
                ? 'Conecte a carteira para habilitar a confirmação.'
                : 'A cotação é revalidada no envio; qualquer mudança exige nova confirmação.'}
            </p>
          </aside>
        </form>
      </Form>
    </section>
  )
}
