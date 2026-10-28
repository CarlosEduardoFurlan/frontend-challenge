import { Construction } from 'lucide-react'

import { EmptyState } from './EmptyState'

/** Temporary page body used while a feature branch has not landed yet. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="container-page py-16">
      <h1 className="sr-only">{title}</h1>
      <EmptyState
        icon={<Construction />}
        title={title}
        description="Esta tela será implementada na próxima etapa."
      />
    </section>
  )
}
