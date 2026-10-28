import { useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSession } from '@/features/auth/hooks'

import { useAddToCart, useBuyNow } from '../hooks'

interface AddToCartActionsProps {
  nftId: string
  editionId: string
  quantity: number
  canBuy: boolean
  /** `desktop`: "COMPRAR" + outlined add-to-cart (10:244); `mobile`: "Comprar NFT" pill + round cart button (15:5536). */
  variant?: 'desktop' | 'mobile'
}

export function AddToCartActions({
  nftId,
  editionId,
  quantity,
  canBuy,
  variant = 'desktop',
}: AddToCartActionsProps) {
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

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-4">
        <Button
          size="pill"
          className="flex-1"
          disabled={!canBuy}
          loading={buy.isPending}
          onClick={() => void handleBuyNow()}
          data-testid="buy-now"
        >
          Comprar NFT
        </Button>
        <Button
          variant="secondary"
          className="size-[60px] shrink-0 rounded-full border-0 bg-surface-dark/70 text-text-accent [&_svg]:size-6"
          disabled={!canBuy}
          loading={add.isPending}
          onClick={() => add.mutate({ nftId, editionId, quantity })}
          aria-label="Adicionar ao carrinho"
          data-testid="add-to-cart"
        >
          {add.isPending ? null : <ShoppingCart aria-hidden="true" />}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        className="w-[130px] text-sm uppercase"
        disabled={!canBuy}
        loading={buy.isPending}
        onClick={() => void handleBuyNow()}
        data-testid="buy-now"
      >
        Comprar
      </Button>
      <Button
        variant="outline"
        className="text-sm"
        disabled={!canBuy}
        loading={add.isPending}
        onClick={() => add.mutate({ nftId, editionId, quantity })}
        data-testid="add-to-cart"
      >
        <ShoppingCart aria-hidden="true" /> Adicionar ao carrinho
      </Button>
    </>
  )
}
