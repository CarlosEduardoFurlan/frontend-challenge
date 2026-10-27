/**
 * Anonymous cart identity. Generated once per browser and sent as `X-Guest-Cart-Id`, so the
 * guest cart survives refresh and can be merged into the user cart at login.
 */
const STORAGE_KEY = 'nftm.guest-cart.v1'

let cached: string | null = null

function generate(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return `g_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

export function getGuestCartId(): string {
  if (cached) return cached
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return (cached = stored)
  } catch {
    // ignore
  }
  cached = generate()
  try {
    localStorage.setItem(STORAGE_KEY, cached)
  } catch {
    // ignore
  }
  return cached
}

/** Rotates the guest id (after logout) so a new visitor never sees the previous cart. */
export function rotateGuestCartId(): string {
  cached = generate()
  try {
    localStorage.setItem(STORAGE_KEY, cached)
  } catch {
    // ignore
  }
  return cached
}
