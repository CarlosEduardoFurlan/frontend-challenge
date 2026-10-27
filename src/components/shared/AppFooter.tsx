import { Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { Logo } from './Logo'

/** Figma "Footer" (component 70491:1286): feature medallions + newsletter, brand band, link columns. */
const FEATURES = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    description: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    description: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
] as const

interface FooterLink {
  label: string
  /** Route of the app when the Figma link maps to an existing screen. */
  to?: '/account/profile' | '/account/orders' | '/favorites' | '/'
  search?: Record<string, unknown>
  hash?: string
}

const COLUMNS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: 'Meu perfil',
    links: [
      { label: 'Meu perfil', to: '/account/profile' },
      { label: 'Minha coleção', to: '/account/orders' },
      { label: 'Atividade', to: '/account/orders' },
      { label: 'Estúdio do criador' },
      { label: 'Lista de interesse', to: '/favorites' },
    ],
  },
  {
    title: 'Central de ajuda',
    links: [
      { label: 'Central de ajuda' },
      { label: 'Como comprar NFTs', to: '/', hash: 'diario' },
      { label: 'Carteira e segurança', to: '/', hash: 'diario' },
      { label: 'Política do mercado' },
      { label: 'Denunciar item' },
    ],
  },
  {
    title: 'Coleções',
    links: [
      { label: 'Arte digital', to: '/', search: { category: ['arte'] }, hash: 'catalogo' },
      { label: 'Fotografia', to: '/', search: { category: ['fotografia'] }, hash: 'catalogo' },
      { label: 'Música', to: '/', search: { category: ['musica'] }, hash: 'catalogo' },
      { label: 'Arte 3D', to: '/', search: { category: ['colecionavel'] }, hash: 'catalogo' },
      { label: 'Utilidade', to: '/', search: { category: ['utilitario'] }, hash: 'catalogo' },
    ],
  },
]

const SOCIAL = [
  { name: 'Facebook', icon: 'social-facebook' },
  { name: 'Instagram', icon: 'social-instagram' },
  { name: 'Twitter', icon: 'social-twitter' },
  { name: 'LinkedIn', icon: 'social-linkedin' },
  { name: 'YouTube', icon: 'social-youtube' },
] as const

export function AppFooter({ className }: { className?: string }) {
  const [subscribed, setSubscribed] = useState(false)

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Newsletter is outside the challenge scope: we acknowledge honestly, without faking a request.
    setSubscribed(true)
  }

  return (
    <footer className={cn('mt-24 pb-6', className)}>
      <div className="container-page">
        {/* Block 1: feature medallions + newsletter (surface-card, 32px padding). */}
        <div className="rounded-t-lg bg-card p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr_1px_1fr_1px_357px] lg:gap-0">
            {FEATURES.map((feature, index) => (
              <div key={feature.title} className="contents">
                {index > 0 ? (
                  <div
                    className="hidden w-px self-stretch bg-primary lg:block"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="flex flex-col gap-3 lg:px-4">
                  <span className="inline-flex size-[74px] items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {feature.letter}
                  </span>
                  <h3 className="text-[17px] leading-4 font-bold lg:whitespace-nowrap">
                    {feature.title}
                  </h3>
                  <p className="max-w-[204px] text-sm leading-[22px] text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
            <div className="hidden w-px self-stretch bg-primary lg:block" aria-hidden="true" />
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col gap-3 lg:px-4"
              aria-labelledby="newsletter-title"
            >
              <h3 id="newsletter-title" className="text-lg leading-4 font-bold">
                Antecipe-se ao próximo lançamento
              </h3>
              <div className="mt-1 flex h-10 overflow-hidden rounded-md bg-surface-dark shadow-card">
                <Label htmlFor="newsletter-email" className="sr-only">
                  E-mail
                </Label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="digite seu e-mail..."
                  autoComplete="email"
                  required
                  disabled={subscribed}
                  className="min-w-0 flex-1 bg-transparent pl-3 text-sm text-foreground outline-none placeholder:text-brass focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="w-[85px] shrink-0 cursor-pointer bg-primary text-lg font-bold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-60"
                >
                  {subscribed ? 'Ok' : 'Enviar'}
                </button>
              </div>
              <p className="text-[13px] leading-[22px] text-muted-foreground" role="status">
                {subscribed
                  ? 'Preferência registrada apenas nesta sessão (fora do escopo da demonstração).'
                  : 'Receba lançamentos selecionados, histórias de criadores e novidades do mercado.'}
              </p>
            </form>
          </div>
        </div>

        {/* Block 2: brand band (surface-dark, 88px). */}
        <div className="grid gap-4 bg-surface-dark px-6 py-6 text-sm leading-[22px] sm:grid-cols-2 lg:h-[88px] lg:grid-cols-[1fr_auto_auto_228px] lg:items-center lg:gap-[60px] lg:px-8 lg:py-0">
          <Logo />
          <p className="lg:whitespace-nowrap">
            Feito para colecionadores,
            <br />
            criadores e cultura
          </p>
          <a
            href="mailto:contato@email.com"
            className="rounded-sm outline-none hover:text-text-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            contato@email.com
          </a>
          <p>+55 11 4002 8922</p>
        </div>

        {/* Block 3: link columns, social icons and wallet chip. */}
        <div className="rounded-b-lg bg-card p-6 lg:p-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_228px] lg:gap-x-[124px]">
            {COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-2">
                <h3 className="text-lg leading-4 font-bold">{column.title}</h3>
                <ul className="text-sm leading-[30px]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          search={link.search as never}
                          hash={link.hash}
                          className="rounded-sm outline-none hover:text-text-accent focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span
                          className="cursor-default"
                          title="Página fora do escopo da demonstração"
                          aria-disabled="true"
                        >
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <h3 className="text-lg leading-4 font-bold">Redes sociais</h3>
                <ul className="flex items-center gap-2.5">
                  {SOCIAL.map((item) => (
                    <li key={item.name}>
                      <span
                        className="block size-[30px] cursor-default"
                        title={`${item.name} (fora do escopo da demonstração)`}
                      >
                        <img
                          src={`/assets/icons/${item.icon}.svg`}
                          alt={item.name}
                          width={30}
                          height={30}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg leading-4 font-bold">Carteiras compatíveis</h3>
                <p
                  className={cn(
                    'inline-flex h-[26px] items-center justify-center rounded-md border border-border-soft bg-surface-dark px-2 text-[9px] font-bold tracking-[0.1px] whitespace-pre text-text-accent',
                  )}
                >
                  {'METAMASK  •  WALLETCONNECT  •  COINBASE'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="pt-1.5 text-center text-sm leading-[30px]">
          © {new Date().getFullYear()} Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  )
}
