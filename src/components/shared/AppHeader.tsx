import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

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

/**
 * Figma "Header Row": KURIO wordmark, four nav items (one active, in text-accent with a 3px
 * primary underline), search icon, cart with count badge and the "Entrar" button.
 * "Criadores" and "Aprenda" point to the matching sections of the home page.
 */
export const NAV_LINKS = [
  { key: 'home', to: '/', hash: undefined, label: 'Início' },
  { key: 'market', to: '/', hash: 'catalogo', label: 'Mercado' },
  { key: 'creators', to: '/', hash: 'criadores', label: 'Criadores' },
  { key: 'learn', to: '/', hash: 'diario', label: 'Aprenda' },
] as const

export type NavKey = (typeof NAV_LINKS)[number]['key']

/** Market-flow screens (detail, cart, checkout, order) highlight "Mercado" and drop the divider. */
export function isMarketPath(pathname: string): boolean {
  return /^\/(nft|cart|checkout|orders)(\/|$)/.test(pathname)
}

/** Top navigation. Presentational: session and cart data arrive through props. */
export function AppHeader({ user, cartCount, onLogout, sessionLoading }: AppHeaderProps) {
  const navigate = useNavigate()
  const { pathname, currentQuery } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      currentQuery:
        typeof (state.location.search as { q?: unknown }).q === 'string'
          ? ((state.location.search as { q: string }).q ?? '')
          : '',
    }),
  })
  const market = isMarketPath(pathname)
  const activeKey: NavKey = market ? 'market' : 'home'
  const [searchOpen, setSearchOpen] = useState(() => Boolean(currentQuery))
  const [query, setQuery] = useState(currentQuery)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Keep the field in sync with the URL (history navigation restores the previous term).
  useEffect(() => {
    setQuery(currentQuery)
    if (currentQuery) setSearchOpen(true)
  }, [currentQuery])

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
    <header
      className={cn(
        'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90',
        !market && 'hairline',
      )}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[69px] lg:items-start lg:pt-6">
          <Logo className="lg:mt-2 lg:w-40" />

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-start gap-10">
              {NAV_LINKS.map((link) => {
                const active = link.key === activeKey
                return (
                  <li key={link.key}>
                    <Link
                      to={link.to}
                      hash={link.hash}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative block pt-2 pb-[21px] text-base leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active
                          ? 'font-bold text-text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-primary'
                          : 'font-normal text-foreground hover:text-text-accent',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4 lg:gap-7">
            <button
              type="button"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={searchOpen ? 'Fechar busca' : 'Buscar NFTs'}
              aria-expanded={searchOpen}
              aria-controls="header-search-panel"
              onClick={() => setSearchOpen((open) => !open)}
              data-testid="header-search-toggle"
            >
              <img src="/assets/icons/search.svg" alt="" width={20} height={20} />
            </button>

            <Link
              to="/cart"
              aria-label={`Carrinho, ${cartCount} itens`}
              className="relative inline-flex size-9 items-center justify-center rounded-sm outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="header-cart"
            >
              <img src="/assets/icons/cart.svg" alt="" width={24} height={24} />
              {cartCount > 0 ? (
                <span
                  className="absolute top-0 left-[21px] inline-flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] leading-none font-medium text-primary-foreground tabular-nums"
                  data-testid="header-cart-count"
                >
                  {cartCount}
                </span>
              ) : null}
            </Link>

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
              <Link
                to="/login"
                className="hidden h-[35px] w-[100px] items-center justify-center gap-1 rounded-md bg-primary text-base font-medium text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:inline-flex"
                data-testid="header-login"
              >
                <img src="/assets/icons/login.svg" alt="" width={18} height={17} />
                Entrar
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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
                  onLogout={() => {
                    setMobileOpen(false)
                    onLogout()
                  }}
                />
              </Suspense>
            ) : null}
          </div>
        </div>

        {searchOpen ? (
          <form
            id="header-search-panel"
            role="search"
            onSubmit={submitSearch}
            className="flex items-center gap-3 border-t border-primary/40 py-3 lg:py-2"
          >
            <Label htmlFor="header-search" className="sr-only">
              Buscar NFTs
            </Label>
            <Input
              id="header-search"
              type="search"
              placeholder="Buscar por nome, coleção ou artista"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false)
              }}
              autoFocus
              className="h-9"
              data-testid="catalog-search"
            />
            <Button type="submit" size="sm" data-testid="catalog-search-submit">
              Buscar
            </Button>
          </form>
        ) : null}
      </div>
    </header>
  )
}
