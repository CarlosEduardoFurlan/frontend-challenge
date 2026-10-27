import { Link, useNavigate } from '@tanstack/react-router'
import { Menu, Search, ShoppingCart } from 'lucide-react'
import { lazy, Suspense, useState, type FormEvent } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { initials } from '@/lib/format'

import { Logo } from './Logo'

// Dropdown (Radix menu + floating-ui) and the drawer content are only needed after an
// interaction or a login, so they stay out of the initial bundle.
const UserMenu = lazy(() => import('./UserMenu'))
const MobileNav = lazy(() => import('./MobileNav'))

export interface HeaderUser {
  name: string
  email: string
  avatarUrl?: string | null
}

export interface AppHeaderProps {
  user: HeaderUser | null
  cartCount: number
  onLogout: () => void
  sessionLoading?: boolean
}

const NAV_LINKS = [
  { to: '/', label: 'Início', exact: true },
  { to: '/favorites', label: 'Favoritos', exact: false },
  { to: '/cart', label: 'Carrinho', exact: false },
] as const

/** Top navigation. Presentational: session and cart data arrive through props. */
export function AppHeader({ user, cartCount, onLogout, sessionLoading }: AppHeaderProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  function search(term: string) {
    const q = term.trim()
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, q: q || undefined, page: undefined }),
      hash: 'catalogo',
    })
    setMobileOpen(false)
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    search(query)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.exact }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form
          role="search"
          onSubmit={submitSearch}
          className="ml-auto hidden w-full max-w-xs items-center md:flex"
        >
          <Label htmlFor="header-search" className="sr-only">
            Buscar NFTs
          </Label>
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="header-search"
              type="search"
              placeholder="Buscar NFTs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart" aria-label={`Carrinho, ${cartCount} itens`} data-testid="header-cart">
              <span className="relative">
                <ShoppingCart aria-hidden="true" />
                {cartCount > 0 ? (
                  <span
                    className="absolute -top-2 -right-2 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums"
                    data-testid="header-cart-count"
                  >
                    {cartCount}
                  </span>
                ) : null}
              </span>
            </Link>
          </Button>

          {sessionLoading ? (
            <div className="skeleton size-9 rounded-full" aria-hidden="true" />
          ) : user ? (
            <Suspense
              fallback={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label={`Conta de ${user.name}`}
                  aria-busy="true"
                  disabled
                >
                  <Avatar className="size-8">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              }
            >
              <UserMenu user={user} onLogout={onLogout} />
            </Suspense>
          ) : (
            <Button asChild size="sm" className="ml-1 hidden md:inline-flex">
              <Link to="/login" data-testid="header-login">
                Entrar
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            data-testid="open-mobile-menu"
          >
            <Menu aria-hidden="true" />
          </Button>
          {mobileOpen ? (
            <Suspense fallback={null}>
              <MobileNav
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                user={user}
                links={NAV_LINKS}
                onNavigate={() => setMobileOpen(false)}
                onSearch={search}
                onLogout={() => {
                  setMobileOpen(false)
                  onLogout()
                }}
              />
            </Suspense>
          ) : null}
        </div>
      </div>
    </header>
  )
}
