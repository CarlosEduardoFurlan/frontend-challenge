import { useNavigate } from '@tanstack/react-router'
import { ShoppingCart, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSession } from '@/features/auth/hooks'

import { useAddToCart, useBuyNow } from '../hooks'

interface AddToCartActionsProps {
  nftId: string
  editionId: string
  quantity: number
  canBuy: boolean
}

export function AddToCartActions({ nftId, editionId, quantity, canBuy }: AddToCartActionsProps) {
  const add = useAddToCart()
  const buy = useBuyNow()
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()

  async function handleBuyNow() {
    if (!isAuthenticated) {
      // Add to the guest cart first so nothing is lost, then ask for login with return to checkout.
      await add.mutateAsync({ nftId, editionId, quantity })
      await navigate({ to: '/login', search: { redirect: '/checkout', reason: 'required' } })
      return
    }
    await buy.buyNow({ nftId, editionId, quantity })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        variant="secondary"
        className="flex-1"
        disabled={!canBuy}
        loading={add.isPending}
        onClick={() => add.mutate({ nftId, editionId, quantity })}
        data-testid="add-to-cart"
      >
        <ShoppingCart aria-hidden="true" /> Adicionar ao carrinho
      </Button>
      <Button
        size="lg"
        className="flex-1"
        disabled={!canBuy}
        loading={buy.isPending}
        onClick={() => void handleBuyNow()}
        data-testid="buy-now"
      >
        <Zap aria-hidden="true" /> Comprar agora
      </Button>
    </div>
  )
}
