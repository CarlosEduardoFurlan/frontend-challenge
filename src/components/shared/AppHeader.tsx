import { Link, useNavigate } from '@tanstack/react-router'
import { Heart, LogOut, Menu, Package, Search, ShoppingCart, User, Wallet } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { initials } from '@/lib/format'

import { Logo } from './Logo'

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
  { to: '/favorites', label: 'Favoritos' },
  { to: '/cart', label: 'Carrinho' },
] as const

/** Top navigation. Presentational: session and cart data arrive through props. */
export function AppHeader({ user, cartCount, onLogout, sessionLoading }: AppHeaderProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = query.trim()
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, q: q || undefined, page: undefined }),
      hash: 'catalogo',
    })
    setMobileOpen(false)
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
                  activeOptions={{ exact: 'exact' in link && link.exact }}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label={`Conta de ${user.name}`}
                  data-testid="header-user-menu"
                >
                  <Avatar className="size-8">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account/profile">
                    <User aria-hidden="true" /> Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/wallets">
                    <Wallet aria-hidden="true" /> Carteiras
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders">
                    <Package aria-hidden="true" /> Pedidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">
                    <Heart aria-hidden="true" /> Favoritos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout} destructive data-testid="logout">
                  <LogOut aria-hidden="true" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-1 hidden md:inline-flex">
              <Link to="/login" data-testid="header-login">
                Entrar
              </Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Navegação principal</SheetDescription>
              </SheetHeader>
              <form role="search" onSubmit={submitSearch} className="flex flex-col gap-2">
                <Label htmlFor="mobile-search">Buscar NFTs</Label>
                <div className="flex gap-2">
                  <Input
                    id="mobile-search"
                    type="search"
                    placeholder="Nome ou coleção"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <Button type="submit" size="icon" aria-label="Buscar">
                    <Search aria-hidden="true" />
                  </Button>
                </div>
              </form>
              <nav aria-label="Principal (mobile)">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent data-[status=active]:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {user ? (
                    <>
                      <li>
                        <Link
                          to="/account/profile"
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                        >
                          Perfil
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/wallets"
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                        >
                          Carteiras
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/orders"
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                        >
                          Pedidos
                        </Link>
                      </li>
                    </>
                  ) : null}
                </ul>
              </nav>
              <div className="mt-auto">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false)
                      onLogout()
                    }}
                  >
                    <LogOut aria-hidden="true" /> Sair
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
