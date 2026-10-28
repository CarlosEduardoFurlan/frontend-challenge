import { Link, type LinkProps } from '@tanstack/react-router'
import { Fragment } from 'react'

import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  to?: LinkProps['to']
  hash?: string
}

/** Figma market screens: "Início / Mercado / Carrinho", 14px bold, color/foreground. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Navegação estrutural" className={cn('text-sm font-bold', className)}>
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <li aria-hidden="true" className="text-foreground">
                  /
                </li>
              ) : null}
              <li>
                {item.to && !last ? (
                  <Link
                    to={item.to}
                    hash={item.hash}
                    className="rounded-sm outline-none hover:text-text-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined}>{item.label}</span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
