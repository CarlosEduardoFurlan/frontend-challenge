import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import {
  AlertTriangle,
  Download,
  Heart,
  LogOut,
  ShoppingCart,
  Tag,
  User,
  Wallet,
} from 'lucide-react'

import { useLogout } from '@/features/auth/hooks'
import { requireAuth } from '@/features/auth/require-auth'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/account')({
  beforeLoad: requireAuth,
  component: AccountLayout,
})

/**
 * Figma "Meu perfil" sidebar (Carteiras frame 9:1670): 310px color/surface-card panel with the
 * section title and one row per area (icon + 16px label in text-accent); the active row has a
 * 4px primary bar on the left. "Sair" sits below a hairline. Rows without a screen in this
 * challenge ("Ofertas", "Arquivos baixados", "Suporte") are listed but not navigable.
 */
const NAV = [
  { to: '/account/profile', label: 'Dados do perfil', icon: User },
  { to: '/account/wallets', label: 'Carteiras', icon: Wallet },
  { to: '/account/orders', label: 'Atividade', icon: ShoppingCart },
  { to: '/favorites', label: 'Lista de interesse', icon: Heart },
] as const

const OUT_OF_SCOPE = [
  { label: 'Ofertas', icon: Tag },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: AlertTriangle },
] as const

const rowClass =
  'relative flex h-[45px] items-center gap-3 px-6 text-base text-text-accent outline-none transition-colors'

function AccountLayout() {
  const logout = useLogout()

  return (
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-8 pt-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-7">
      <nav aria-label="Conta" className="rounded-lg bg-card pb-2 lg:self-start">
        <h2 className="px-2.5 pt-5 pb-3 text-xl font-bold">Meu perfil</h2>
        <ul className="flex flex-col">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  rowClass,
                  'hover:bg-surface-dark/60 focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:bg-surface-dark/40 data-[status=active]:before:absolute data-[status=active]:before:inset-y-0 data-[status=active]:before:left-0 data-[status=active]:before:w-1 data-[status=active]:before:bg-primary',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
          {OUT_OF_SCOPE.map(({ label, icon: Icon }) => (
            <li key={label}>
              <span
                className={cn(rowClass, 'cursor-default')}
                aria-disabled="true"
                title="Área fora do escopo da demonstração"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </span>
            </li>
          ))}
          <li className="mt-1 border-t border-primary/60 pt-1">
            <button
              type="button"
              onClick={() => logout.mutate()}
              className={cn(rowClass, 'w-full cursor-pointer font-bold hover:bg-surface-dark/60')}
              data-testid="account-logout"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </li>
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
