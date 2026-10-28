import { Link, useNavigate, useRouterState, type LinkProps } from '@tanstack/react-router'
import { ChevronLeft, Heart, House, ScanLine, Search, SlidersHorizontal, User } from 'lucide-react'
import { forwardRef, lazy, Suspense, useState, type FormEvent, type ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { HeaderUser } from './AppHeader'

const UserMenu = lazy(() => import('./UserMenu'))

/**
 * Mobile chrome of the Figma 414px frames. The mobile screens have no desktop header: the home
 * frame (14:5226) opens with a search field and a filter button and closes with a bottom
 * navigation bar; the market screens (detail 15:5536, cart 16:360, checkout 16:748) start with
 * a round back button and a centred title. The desktop header is not rendered below 1024px.
 */

interface MobileTopBarProps {
  title: string
  backTo?: LinkProps['to']
  backHash?: string
  trailing?: ReactNode
  className?: string
  /** Heading level of the title (`h1` unless the page already has one). */
  as?: 'h1' | 'h2' | 'p'
}

export function MobileTopBar({
  title,
  backTo = '/',
  backHash,
  trailing,
  className,
  as: Title = 'h1',
}: MobileTopBarProps) {
  return (
    <div className={cn('relative flex h-[70px] items-center px-3', className)}>
      <Link
        to={backTo}
        hash={backHash}
        aria-label="Voltar"
        className="inline-flex size-[46px] items-center justify-center rounded-full border border-border-soft bg-surface-dark/60 text-text-accent outline-none hover:bg-surface-dark focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Link>
      <Title className="absolute inset-x-16 truncate text-center text-2xl font-bold">{title}</Title>
      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  )
}

interface MobileSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onOpenFilters: () => void
}

/**
 * Figma home (mobile): rounded search field "Explorar coleções" and the square filter button.
 * The search icon inside the field submits the query; the ref targets the filter button so the
 * page can return focus to it when the filter sheet closes.
 */
export const MobileSearchBar = forwardRef<HTMLButtonElement, MobileSearchBarProps>(
  function MobileSearchBar({ value, onChange, onSubmit, onOpenFilters }, ref) {
    function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      onSubmit(value)
    }
    return (
      <div className="flex items-center gap-3 px-6 pt-10">
        <form role="search" onSubmit={submit} className="relative flex-1">
          <label htmlFor="mobile-search" className="sr-only">
            Buscar NFTs
          </label>
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute top-1/2 left-3 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-text-accent outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="catalog-search-submit"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <input
            id="mobile-search"
            type="search"
            placeholder="Explorar coleções"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-[46px] w-full rounded-xl bg-surface-dark/70 pr-4 pl-12 text-base text-foreground outline-none placeholder:text-brass focus-visible:ring-2 focus-visible:ring-ring/60"
            data-testid="catalog-search"
          />
        </form>
        <button
          ref={ref}
          type="button"
          onClick={onOpenFilters}
          aria-label="Abrir filtros"
          className="inline-flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[linear-gradient(135deg,#e89b55_0%,#c57f45_100%)] text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          data-testid="open-filters"
        >
          <SlidersHorizontal className="size-5" aria-hidden="true" />
        </button>
      </div>
    )
  },
)

interface MobileBottomNavProps {
  user: HeaderUser | null
  cartCount: number
  onLogout: () => void
  sessionLoading?: boolean
}

/**
 * Figma home (mobile) bottom bar: início, favoritos, a raised scan button, carrinho and conta.
 * The scan button has no screen in the file; it focuses the search field of the home page.
 */
export function MobileBottomNav({
  user,
  cartCount,
  onLogout,
  sessionLoading,
}: MobileBottomNavProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [menuOpen, setMenuOpen] = useState(false)
  const itemClass =
    'inline-flex size-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring'

  async function focusSearch() {
    if (pathname !== '/') await navigate({ to: '/' })
    requestAnimationFrame(() => document.getElementById('mobile-search')?.focus())
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 h-[70px] rounded-t-[26px] bg-card lg:hidden"
      data-testid="mobile-bottom-nav"
    >
      <ul className="grid h-full grid-cols-5 items-center px-2">
        <li className="flex justify-center">
          <Link
            to="/"
            aria-label="Início"
            className={cn(itemClass, pathname === '/' ? 'text-text-accent' : 'text-brass')}
          >
            <House className="size-6" aria-hidden="true" />
          </Link>
        </li>
        <li className="flex justify-center">
          <Link
            to="/favorites"
            aria-label="Lista de interesse"
            className={cn(itemClass, pathname === '/favorites' ? 'text-text-accent' : 'text-brass')}
          >
            <Heart className="size-6" aria-hidden="true" />
          </Link>
        </li>
        <li className="flex justify-center">
          <button
            type="button"
            onClick={() => void focusSearch()}
            aria-label="Buscar NFTs"
            className="-mt-10 inline-flex size-16 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(180deg,#e89b55_0%,#c57f45_100%)] text-primary-foreground shadow-[0_8px_20px_rgba(10,6,4,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <ScanLine className="size-7" aria-hidden="true" />
          </button>
        </li>
        <li className="flex justify-center">
          <Link
            to="/cart"
            aria-label={`Carrinho, ${cartCount} itens`}
            className={cn(
              itemClass,
              'relative',
              pathname === '/cart' ? 'text-text-accent' : 'text-brass',
            )}
            data-testid="header-cart"
          >
            <img src="/assets/icons/cart.svg" alt="" width={24} height={24} />
            {cartCount > 0 ? (
              <span
                className="absolute top-1 right-1 inline-flex size-4 items-center justify-center rounded-full border-2 border-card bg-primary text-[10px] leading-none font-medium text-primary-foreground tabular-nums"
                data-testid="header-cart-count"
              >
                {cartCount}
              </span>
            ) : null}
          </Link>
        </li>
        <li className="flex justify-center">
          {sessionLoading ? (
            <span className="skeleton size-8 rounded-full" aria-hidden="true" />
          ) : user ? (
            <Suspense
              fallback={
                <span className={cn(itemClass, 'text-brass')} aria-busy="true">
                  <Avatar className="size-8">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                </span>
              }
            >
              <UserMenu
                user={user}
                onLogout={onLogout}
                side="top"
                open={menuOpen}
                onOpenChange={setMenuOpen}
              />
            </Suspense>
          ) : (
            <Link
              to="/login"
              aria-label="Entrar"
              className={cn(itemClass, pathname === '/login' ? 'text-text-accent' : 'text-brass')}
              data-testid="header-login"
            >
              <User className="size-6" aria-hidden="true" />
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}
