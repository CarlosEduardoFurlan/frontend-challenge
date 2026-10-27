import { createFileRoute } from '@tanstack/react-router'

import { ErrorState } from '@/components/shared/ErrorState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletForm } from '@/features/wallets/components/WalletForm'
import { useWallets } from '@/features/wallets/hooks'

export const Route = createFileRoute('/account/wallets')({
  component: WalletsPage,
})

function WalletsPage() {
  const wallets = useWallets()

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        as="h1"
        title="Carteiras"
        description="Cadastre a carteira principal e, opcionalmente, uma secundária para o checkout."
      />
      {wallets.isPending ? (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando carteiras">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
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
          />
          <WalletForm
            key={`secondary-${wallets.data.secondary?.id ?? 'new'}`}
            kind="secondary"
            wallet={wallets.data.secondary}
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
