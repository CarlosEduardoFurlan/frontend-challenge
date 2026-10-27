import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { AppFooter } from '@/components/shared/AppFooter'
import { AppHeader } from '@/components/shared/AppHeader'
import { LiveAnnouncer } from '@/components/shared/LiveAnnouncer'
import { Toaster } from '@/components/ui/toaster'
import { SessionWatcher } from '@/features/auth/components/SessionWatcher'
import { useLogout, useSession } from '@/features/auth/hooks'
import { CartSessionBridge } from '@/features/cart/components/CartSessionBridge'
import { useCart } from '@/features/cart/hooks'
import { MockPanel } from '@/features/mock-panel/MockPanel'
import { RealtimeStatus } from '@/features/realtime/components/RealtimeStatus'
import { RealtimeProvider } from '@/features/realtime/RealtimeProvider'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const session = useSession()
  const logout = useLogout()
  const cart = useCart()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only-focusable fixed top-2 left-2 z-50 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <AppHeader
        user={session.user}
        sessionLoading={session.isLoading}
        cartCount={cart.itemCount}
        onLogout={() => logout.mutate()}
      />
      <RealtimeStatus className="border-b border-border bg-card py-1 text-muted-foreground data-[state=connected]:hidden" />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <AppFooter />
      <Toaster />
      <LiveAnnouncer />
      <SessionWatcher />
      <CartSessionBridge />
      <RealtimeProvider />
      <MockPanel />
    </div>
  )
}

function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <h1 className="font-display text-2xl uppercase sm:text-3xl">Página não encontrada</h1>
      <p className="mt-4 text-muted-foreground">O endereço acessado não existe.</p>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Voltar ao início
      </Link>
    </section>
  )
}
