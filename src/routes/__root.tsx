import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'

import { AppFooter } from '@/components/shared/AppFooter'
import { AppHeader } from '@/components/shared/AppHeader'
import { LiveAnnouncer } from '@/components/shared/LiveAnnouncer'
import { MobileBottomNav } from '@/components/shared/MobileChrome'
import { Toaster } from '@/components/ui/toaster'
import { SessionWatcher } from '@/features/auth/components/SessionWatcher'
import { useLogout, useSession } from '@/features/auth/hooks'
import { CartSessionBridge } from '@/features/cart/components/CartSessionBridge'
import { useCart } from '@/features/cart/hooks'
import { MockPanel } from '@/features/mock-panel/MockPanel'
import { RealtimeStatus } from '@/features/realtime/components/RealtimeStatus'
import { RealtimeProvider } from '@/features/realtime/RealtimeProvider'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/use-media-query'
import { removePrerender } from '@/lib/prerender'
import { cn } from '@/lib/utils'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

/** Mobile frames with their own full-screen layout: no header, footer or bottom bar. */
const AUTH_PATHS = ['/login', '/register']

function RootLayout() {
  const session = useSession()
  const logout = useLogout()
  const cart = useCart()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const mobileAuth = !isDesktop && AUTH_PATHS.includes(pathname)
  // The home frame (14:5226) is the only mobile frame showing the bottom bar; it is kept on the
  // other screens too so the cart, the account menu and the navigation stay one tap away.
  const bottomNav = !isDesktop && !mobileAuth
  // Child layout effects (hero/gallery adoption) run before this one.
  useLayoutEffect(removePrerender, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only-focusable fixed top-2 left-2 z-50 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      {isDesktop ? (
        <AppHeader
          user={session.user}
          sessionLoading={session.isLoading}
          cartCount={cart.itemCount}
          onLogout={() => logout.mutate()}
        />
      ) : null}
      <RealtimeStatus className="border-b border-border bg-card py-1 text-muted-foreground data-[state=connected]:hidden" />
      <main id="main-content" className={cn('flex-1', bottomNav && 'pb-[90px]')} tabIndex={-1}>
        <Outlet />
      </main>
      {mobileAuth ? null : <AppFooter className={bottomNav ? 'pb-[90px]' : undefined} />}
      {bottomNav ? (
        <MobileBottomNav
          user={session.user}
          sessionLoading={session.isLoading}
          cartCount={cart.itemCount}
          onLogout={() => logout.mutate()}
        />
      ) : null}
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
      <h1 className="text-2xl font-bold uppercase sm:text-3xl">Página não encontrada</h1>
      <p className="mt-4 text-muted-foreground">O endereço acessado não existe.</p>
      <Link to="/" className="mt-6 inline-block text-text-accent underline">
        Voltar ao início
      </Link>
    </section>
  )
}
