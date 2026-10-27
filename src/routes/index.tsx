import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { apiClient } from '@/services/api/client'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await apiClient.get<{ status: string }>('/health')).data,
  })

  return (
    <section className="container-page py-16">
      <h1 className="font-display text-4xl">NFT Marketplace</h1>
      <p className="mt-4 text-muted-foreground">
        API: {health.isPending ? 'carregando' : health.isError ? 'erro' : health.data.status}
      </p>
    </section>
  )
}
