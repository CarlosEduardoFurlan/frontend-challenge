import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderPage } from '@/components/shared/PlaceholderPage'

export const Route = createFileRoute('/nft/$nftId')({
  component: () => <PlaceholderPage title="Detalhe do NFT" />,
})
