import { createFileRoute } from '@tanstack/react-router'

import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletForm } from '@/features/wallets/components/WalletForm'
import { useWallets } from '@/features/wallets/hooks'

export const Route = createFileRoute('/account/wallets')({
  component: WalletsPage,
})

/**
 * Figma "Desktop / Carteiras" (9:1670): "Carteira principal" title with the description
 * "Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.", the
 * two-column form and "Salvar carteira"; then the "Carteira secundária" block.
 */
function WalletsPage() {
  const wallets = useWallets()

  return (
    <div className="flex flex-col gap-10">
      {wallets.isPending ? (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando carteiras">
          <Skeleton className="h-6 w-56" />
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      ) : wallets.isError ? (
        <ErrorState
          error={wallets.error}
          onRetry={() => void wallets.refetch()}
          retrying={wallets.isFetching}
        />
      ) : (
        <>
          <WalletForm
            key={`primary-${wallets.data.primary?.id ?? 'new'}`}
            kind="primary"
            wallet={wallets.data.primary}
            headingLevel="h1"
            description="Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados."
          />
          <WalletForm
            key={`secondary-${wallets.data.secondary?.id ?? 'new'}`}
            kind="secondary"
            wallet={wallets.data.secondary}
            headingLevel="h2"
            description="Uma carteira de reserva, opcional, para o pagamento."
            disabledReason={
              wallets.data.primary
                ? undefined
                : 'Cadastre a carteira principal antes de adicionar uma secundária.'
            }
          />
        </>
      )}
    </div>
  )
}
