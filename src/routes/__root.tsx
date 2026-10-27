import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { AppFooter } from '@/components/shared/AppFooter'
import { AppHeader } from '@/components/shared/AppHeader'
import { LiveAnnouncer } from '@/components/shared/LiveAnnouncer'
import { Toaster } from '@/components/ui/toaster'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only-focusable fixed top-2 left-2 z-50 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <AppHeader user={null} cartCount={0} onLogout={() => undefined} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <AppFooter />
      <Toaster />
      <LiveAnnouncer />
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
