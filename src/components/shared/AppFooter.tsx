import { Link } from '@tanstack/react-router'
import { Layers, ShieldCheck, Wallet } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Logo } from './Logo'

const FEATURES = [
  {
    icon: Wallet,
    title: 'Carteiras simuladas',
    description: 'Conecte carteiras fictícias e escolha a rede sem instalar extensões.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra verificada',
    description: 'Cada pedido só é confirmado após a resposta da simulação de pagamento.',
  },
  {
    icon: Layers,
    title: 'Edições limitadas',
    description: 'Disponibilidade e preço atualizados em tempo real enquanto você navega.',
  },
] as const

/**
 * Links that exist in the layout but point to pages outside the challenge scope. They are
 * rendered as plain text with an "em breve" hint instead of pretending to navigate.
 */
const LINK_COLUMNS = [
  { title: 'Marketplace', links: ['Editorial', 'Ofertas', 'Atividade'] },
  { title: 'Conta', links: ['Downloads', 'Suporte'] },
  { title: 'Legal', links: ['Termos de uso', 'Privacidade'] },
] as const

export function AppFooter() {
  const [subscribed, setSubscribed] = useState(false)

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Newsletter is outside the challenge scope: we acknowledge honestly, without faking a request.
    setSubscribed(true)
  }

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-16">
          <ul className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex flex-col gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleNewsletter}
            className="flex flex-col gap-3"
            aria-labelledby="newsletter-title"
          >
            <h3 id="newsletter-title" className="font-display text-sm uppercase">
              Fique por dentro
            </h3>
            <p className="text-sm text-muted-foreground">
              Receba os próximos lançamentos. Recurso ilustrativo, sem envio real.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="newsletter-email" className="sr-only">
                  E-mail
                </Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  disabled={subscribed}
                />
              </div>
              <Button type="submit" disabled={subscribed}>
                {subscribed ? 'Registrado' : 'Inscrever'}
              </Button>
            </div>
            {subscribed ? (
              <p className="text-xs text-success" role="status">
                Preferência registrada apenas nesta sessão (fora do escopo da demonstração).
              </p>
            ) : null}
          </form>
        </div>

        <div className="mt-12 grid gap-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Marketplace de arte digital com pagamentos e carteiras simulados.
            </p>
          </div>
          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {column.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {column.links.map((label) => (
                  <li key={label} className="text-muted-foreground">
                    <span aria-disabled="true" title="Página fora do escopo da demonstração">
                      {label}
                    </span>
                    <span className="ml-1 text-[10px] uppercase opacity-70">em breve</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NFT Market. Demonstração técnica com dados simulados.</p>
          <nav aria-label="Links do rodapé" className="flex gap-4">
            <Link to="/" className="hover:text-foreground">
              Início
            </Link>
            <Link to="/favorites" className="hover:text-foreground">
              Favoritos
            </Link>
            <Link to="/cart" className="hover:text-foreground">
              Carrinho
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
