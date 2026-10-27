import { createFileRoute } from '@tanstack/react-router'

import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks'
import { requireAuth } from '@/features/auth/require-auth'
import { CheckoutPage } from '@/features/checkout/components/CheckoutPage'

export const Route = createFileRoute('/checkout')({
  beforeLoad: requireAuth,
  component: CheckoutRoute,
})

function CheckoutRoute() {
  const session = useSession()
  if (session.isLoading || (!session.user && !session.isError)) {
    return (
      <div className="container-page py-8" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-96 w-full rounded-xl" />
      </div>
    )
  }
  if (!session.user) {
    return (
      <div className="container-page py-8">
        <ErrorState error={session.error} onRetry={() => void session.refetch()} />
      </div>
    )
  }
  return <CheckoutPage key={session.user.id} user={session.user} />
}
