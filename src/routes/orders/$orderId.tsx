import { createFileRoute } from '@tanstack/react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks'
import { requireAuth } from '@/features/auth/require-auth'
import { OrderStatusPage } from '@/features/orders/components/OrderStatusPage'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: requireAuth,
  component: OrderRoute,
})

function OrderRoute() {
  const { orderId } = Route.useParams()
  const session = useSession()
  if (!session.userId) {
    return (
      <div className="container-page py-10" aria-busy="true">
        <Skeleton className="mx-auto h-96 w-full max-w-2xl rounded-2xl" />
      </div>
    )
  }
  return <OrderStatusPage userId={session.userId} orderId={orderId} />
}
