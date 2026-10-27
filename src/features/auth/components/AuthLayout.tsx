import type { ReactNode } from 'react'

import { Logo } from '@/components/shared/Logo'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

/** Centered card used by login and register, following the mobile frames of the Figma file. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <section className="container-page flex min-h-[70dvh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo className="[&>span]:inline" />
          <div>
            <h1 className="font-display text-xl uppercase">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </section>
  )
}
