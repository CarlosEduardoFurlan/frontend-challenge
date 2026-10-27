import { Link } from '@tanstack/react-router'
import { LogOut, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import type { HeaderUser } from './AppHeader'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: HeaderUser | null
  links: ReadonlyArray<{ to: '/' | '/favorites' | '/cart'; label: string }>
  onNavigate: () => void
  onSearch: (query: string) => void
  onLogout: () => void
}

const accountLinks = [
  { to: '/account/profile', label: 'Perfil' },
  { to: '/account/wallets', label: 'Carteiras' },
  { to: '/account/orders', label: 'Pedidos' },
] as const

/**
 * Mobile navigation drawer (Radix Dialog). Loaded lazily when the drawer opens, so the dialog
 * primitives stay out of the initial bundle. Focus returns to the header button on close.
 */
export default function MobileNav({
  open,
  onOpenChange,
  user,
  links,
  onNavigate,
  onSearch,
  onLogout,
}: MobileNavProps) {
  const [query, setQuery] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(query)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Navegação principal</SheetDescription>
        </SheetHeader>
        <form role="search" onSubmit={submit} className="flex flex-col gap-2">
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
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent data-[status=active]:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user
              ? accountLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={onNavigate}
                      className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              : null}
          </ul>
        </nav>
        <div className="mt-auto">
          {user ? (
            <Button variant="outline" className="w-full" onClick={onLogout}>
              <LogOut aria-hidden="true" /> Sair
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to="/login" onClick={onNavigate}>
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
