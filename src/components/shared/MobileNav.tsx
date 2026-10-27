import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import type { HeaderUser, NAV_LINKS } from './AppHeader'
import { Logo } from './Logo'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: HeaderUser | null
  links: typeof NAV_LINKS
  onNavigate: () => void
  onLogout: () => void
}

const accountLinks = [
  { to: '/account/profile', label: 'Dados do perfil' },
  { to: '/account/wallets', label: 'Carteiras' },
  { to: '/account/orders', label: 'Atividade' },
  { to: '/favorites', label: 'Lista de interesse' },
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
  onLogout,
}: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col bg-card">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">Navegação principal</SheetDescription>
        </SheetHeader>
        <nav aria-label="Principal (mobile)">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  to={link.to}
                  hash={link.hash}
                  onClick={onNavigate}
                  className="block py-3 text-base leading-4 font-medium text-foreground hover:text-text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {user ? (
          <nav aria-label="Conta" className="hairline border-t border-t-primary/40 pt-3">
            <p className="pb-2 text-lg font-bold">Meu perfil</p>
            <ul className="flex flex-col">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={onNavigate}
                    className="block py-2.5 text-[15px] text-text-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div className="mt-auto">
          {user ? (
            <Button variant="outline" className="w-full" onClick={onLogout}>
              <LogOut aria-hidden="true" /> Sair
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to="/login" onClick={onNavigate}>
                <img src="/assets/icons/login.svg" alt="" width={18} height={17} />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
