import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

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
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <h1 className="font-display text-3xl">Página não encontrada</h1>
      <p className="mt-4 text-muted-foreground">O endereço acessado não existe.</p>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Voltar ao início
      </Link>
    </section>
  )
}
