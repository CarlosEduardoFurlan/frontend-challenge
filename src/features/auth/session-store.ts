import { useSyncExternalStore } from 'react'

/**
 * Minimal persisted session store: only the bearer token and the user id live here.
 * The user profile itself is cached by TanStack Query (`sessionQuery`); this store exists so
 * the Axios interceptor and route guards can read the token synchronously.
 */
const STORAGE_KEY = 'nftm.session.v1'

export interface StoredSession {
  token: string
  userId: string
}

type Listener = () => void

let current: StoredSession | null = read()
const listeners = new Set<Listener>()

function read(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    return parsed.token && parsed.userId ? { token: parsed.token, userId: parsed.userId } : null
  } catch {
    return null
  }
}

function write(value: StoredSession | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: keep the in-memory session for this tab.
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export const sessionStore = {
  get(): StoredSession | null {
    return current
  },
  getToken(): string | null {
    return current?.token ?? null
  },
  getUserId(): string | null {
    return current?.userId ?? null
  },
  set(value: StoredSession): void {
    current = value
    write(value)
    notify()
  },
  clear(): void {
    if (!current) return
    current = null
    write(null)
    notify()
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

// Keep tabs in sync (login/logout in another tab).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      current = read()
      notify()
    }
  })
}

export function useStoredSession(): StoredSession | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null)
}
