import type { NetworkId } from '@/types/api'

/**
 * Checkout draft kept in sessionStorage so a refresh, a session expiry (login round-trip) or
 * a network timeout never loses the collector data, the chosen wallet or the idempotency key
 * of an in-flight order.
 */
export interface CheckoutDraft {
  userId: string
  collector: { name: string; email: string; document: string }
  walletId: string | null
  network: NetworkId
  acceptedTerms: boolean
  /** Generated once per attempt; reused on retries. Cleared after the order exists. */
  idempotencyKey: string | null
  /** Order created from this draft (pending/confirmed), to resume after refresh. */
  orderId: string | null
}

const STORAGE_KEY = 'nftm.checkout.draft.v1'

export function readDraft(userId: string): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as CheckoutDraft
    return draft.userId === userId ? draft : null
  } catch {
    return null
  }
}

export function writeDraft(draft: CheckoutDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function newIdempotencyKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return `idem_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}
