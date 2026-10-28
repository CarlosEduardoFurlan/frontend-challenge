import { Link, useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'

import { Logo } from '@/components/shared/Logo'
import { HomePage } from '@/features/catalog/components/HomePage'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/use-media-query'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface AuthShellProps {
  mode: 'login' | 'register'
  /** Mobile page title ("Entrar" / "Criar perfil de colecionador"). */
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
  /** Preserved across the Entrar / Criar conta tabs. */
  redirect?: string
}

/**
 * Desktop ("Desktop / Login" 9:115 and "Desktop / Cadastro" 9:1022): the marketplace page stays
 * behind a 500px modal with the "Entrar | Criar conta" tabs, a short description, the form, an
 * "Ou continue com" divider with the social buttons and a primary bar closing the panel.
 * Mobile (16:1022 / 16:1228): a full screen with the KURIO wordmark, the title, the form, the
 * social buttons and the switch link, without the application chrome.
 */
export function AuthShell({
  mode,
  title,
  description,
  children,
  footer,
  redirect,
}: AuthShellProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const navigate = useNavigate()

  if (!isDesktop) {
    return (
      <section className="flex min-h-dvh flex-col px-6 pt-[112px] pb-10">
        <Logo className="justify-center text-[42px] tracking-[0.12em]" />
        <h1 className="mt-20 text-center text-[26px] leading-tight font-bold">{title}</h1>
        <div className="mt-9">{children}</div>
        <SocialLogin />
        <p className="mt-10 text-center text-lg text-muted-foreground">{footer}</p>
      </section>
    )
  }

  return (
    <>
      <HomePage search={{}} />
      <DialogPrimitive.Root open onOpenChange={(open) => !open && void navigate({ to: '/' })}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[500px] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-none bg-card pb-[10px] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            aria-describedby="auth-dialog-description"
          >
            <DialogPrimitive.Close
              className="absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Fechar"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
            <div className="px-20 pt-14">
              <DialogPrimitive.Title asChild>
                <h1 className="sr-only">{title}</h1>
              </DialogPrimitive.Title>
              <nav
                aria-label="Entrar ou criar conta"
                className="flex items-center justify-center gap-3 text-2xl font-bold"
              >
                <Link
                  to="/login"
                  search={{ redirect }}
                  aria-current={mode === 'login' ? 'page' : undefined}
                  className={cn(
                    'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    mode === 'login'
                      ? 'text-text-accent'
                      : 'text-foreground hover:text-text-accent',
                  )}
                >
                  Entrar
                </Link>
                <span aria-hidden="true" className="h-7 w-px bg-primary" />
                <Link
                  to="/register"
                  search={{ redirect }}
                  aria-current={mode === 'register' ? 'page' : undefined}
                  className={cn(
                    'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    mode === 'register'
                      ? 'text-text-accent'
                      : 'text-foreground hover:text-text-accent',
                  )}
                >
                  Criar conta
                </Link>
              </nav>
              <DialogPrimitive.Description
                id="auth-dialog-description"
                className="mt-8 text-center text-sm leading-5 text-muted-foreground"
              >
                {description}
              </DialogPrimitive.Description>
              <div className="mt-7">{children}</div>
            </div>
            <SocialLogin className="px-20" />
            <p className="px-20 pt-6 pb-8 text-center text-sm text-muted-foreground">{footer}</p>
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[10px] bg-primary" />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}

/**
 * "Ou continue com" + Google / Facebook. There is no identity provider in the mock backend, so
 * the buttons explain that social login is outside the demo instead of pretending to work.
 * The brand marks of the design were not exported (MCP quota); monograms stand in for them.
 */
function SocialLogin({ className }: { className?: string }) {
  function unavailable(provider: string) {
    toast({
      title: `${provider} indisponível`,
      description: 'O login social está fora do escopo desta demonstração.',
      variant: 'info',
    })
  }
  return (
    <div className={cn('mt-8 flex flex-col gap-3', className)}>
      <p className="flex items-center gap-3 text-sm whitespace-nowrap text-foreground before:h-px before:flex-1 before:bg-border-soft after:h-px after:flex-1 after:bg-border-soft">
        Ou continue com
      </p>
      <button
        type="button"
        onClick={() => unavailable('Google')}
        className="inline-flex h-[50px] cursor-pointer items-center justify-center gap-3 rounded-xl border border-border-soft text-lg text-muted-foreground outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring lg:h-10 lg:rounded-md lg:text-base"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-6 items-center justify-center rounded-full bg-background-elevated font-bold text-[#4285f4]"
        >
          G
        </span>
        Continuar com Google
      </button>
      <button
        type="button"
        onClick={() => unavailable('Facebook')}
        className="inline-flex h-[50px] cursor-pointer items-center justify-center gap-3 rounded-xl border border-border-soft text-lg text-muted-foreground outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring lg:h-10 lg:rounded-md lg:text-base"
      >
        <span aria-hidden="true" className="text-xl leading-none font-bold text-[#1877f2]">
          f
        </span>
        Continuar com Facebook
      </button>
    </div>
  )
}
