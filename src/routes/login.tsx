import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/components/shared/PlaceholderPage'

export const Route = createFileRoute('/login')({
  component: () => <PlaceholderPage title="Login" />,
})
