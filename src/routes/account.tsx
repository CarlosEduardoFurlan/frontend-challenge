import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Package, User, Wallet } from 'lucide-react'

import { requireAuth } from '@/features/auth/require-auth'

export const Route = createFileRoute('/account')({
  beforeLoad: requireAuth,
  component: AccountLayout,
})

const NAV = [
  { to: '/account/profile', label: 'Perfil', icon: User },
  { to: '/account/wallets', label: 'Carteiras', icon: Wallet },
  { to: '/account/orders', label: 'Pedidos', icon: Package },
] as const

/** Private area shell: side navigation on desktop, horizontal tabs on mobile. */
function AccountLayout() {
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="Conta" className="lg:sticky lg:top-20 lg:self-start">
        <ul className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 lg:flex-col">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to} className="shrink-0 lg:shrink">
              <Link
                to={to}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:bg-accent data-[status=active]:text-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
