import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/components/shared/PlaceholderPage'

export const Route = createFileRoute('/favorites')({
  component: () => <PlaceholderPage title="Favoritos" />,
})
