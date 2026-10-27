/**
 * Tiny pub/sub for session lifecycle events. Decouples the Axios interceptor (which detects a
 * 401) from the router (which redirects to login) and from the cart/realtime features (which
 * drop private state).
 */
export type SessionEvent =
  | { type: 'expired' }
  | { type: 'login'; userId: string }
  | { type: 'logout'; userId: string | null }

type Listener = (event: SessionEvent) => void

const listeners = new Set<Listener>()

export const sessionEvents = {
  on(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  emit(event: SessionEvent): void {
    listeners.forEach((listener) => listener(event))
  },
}
