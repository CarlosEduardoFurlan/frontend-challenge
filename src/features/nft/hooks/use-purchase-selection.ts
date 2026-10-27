import { useEffect, useMemo, useState } from 'react'

import type { Nft } from '@/types/api'

/**
 * Edition + quantity selection for the detail page. Keeps the selection valid whenever the
 * NFT changes (e.g. a realtime event sells out the chosen edition or lowers availability).
 */
export function usePurchaseSelection(nft: Nft | undefined) {
  const [editionId, setEditionId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const editions = useMemo(() => nft?.editions ?? [], [nft?.editions])
  const firstAvailable = editions.find((e) => e.available > 0)?.id ?? null

  useEffect(() => {
    if (!nft) return
    const current = editions.find((e) => e.id === editionId)
    if (!current || current.available <= 0) setEditionId(firstAvailable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft?.version, nft?.id])

  const edition = useMemo(
    () => editions.find((e) => e.id === editionId) ?? null,
    [editions, editionId],
  )
  const maxQuantity = edition ? Math.max(0, Math.min(edition.available, edition.maxPerOrder)) : 0

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, maxQuantity)))
  }, [maxQuantity])

  return {
    editionId,
    setEditionId,
    edition,
    quantity,
    setQuantity,
    maxQuantity,
    canBuy: Boolean(edition) && maxQuantity > 0,
  }
}
