import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

/**
 * Login and register share the "Marketplace Page" shell of the Figma file (header with
 * divider). The auth frames themselves (9:115, 9:1022, 16:1022, 16:1228) could not be
 * fetched because of the MCP rate limit, so the form uses the verified design system: 28px
 * bold title, 14px text-secondary description, bordered fields and a full-width primary button.
 */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <section className="container-page flex min-h-[70dvh] justify-center pt-10 pb-6">
      <div className="w-full max-w-[480px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-tight font-bold">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
      </div>
    </section>
  )
}
