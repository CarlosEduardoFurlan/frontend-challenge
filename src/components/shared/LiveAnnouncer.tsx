import { useSyncExternalStore } from 'react'

type Politeness = 'polite' | 'assertive'

interface AnnouncerState {
  polite: string
  assertive: string
}

let state: AnnouncerState = { polite: '', assertive: '' }
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

/**
 * Pushes a message to a visually hidden live region. Used for feedback that has no visual
 * counterpart big enough to be noticed by screen readers (e.g. "Item adicionado ao carrinho",
 * realtime price changes).
 */
export function announce(message: string, politeness: Politeness = 'polite') {
  // Clear first so repeated identical messages are re-announced.
  state = { ...state, [politeness]: '' }
  notify()
  setTimeout(() => {
    state = { ...state, [politeness]: message }
    notify()
  }, 50)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function LiveAnnouncer() {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  )
  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="live-polite">
        {current.polite}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-assertive"
      >
        {current.assertive}
      </div>
    </>
  )
}
