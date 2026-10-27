import { useSyncExternalStore } from 'react'

export type RealtimeState = 'connecting' | 'connected' | 'disconnected'

export interface RealtimeStatus {
  state: RealtimeState
  /** Number of successful (re)connections of the current socket. */
  connections: number
  lastEventAt: string | null
}

let status: RealtimeStatus = { state: 'connecting', connections: 0, lastEventAt: null }
const listeners = new Set<() => void>()

export function setRealtimeStatus(patch: Partial<RealtimeStatus>) {
  status = { ...status, ...patch }
  listeners.forEach((l) => l())
}

export function resetRealtimeStatus() {
  status = { state: 'connecting', connections: 0, lastEventAt: null }
  listeners.forEach((l) => l())
}

export function useRealtimeStatus(): RealtimeStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => status,
    () => status,
  )
}
