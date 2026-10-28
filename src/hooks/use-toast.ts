import { useSyncExternalStore } from 'react'

import type { ToastProps } from '@/components/ui/toast'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: ToastProps['variant']
  duration?: number
  open: boolean
}

type ToastInput = Omit<ToastItem, 'id' | 'open'>

const TOAST_LIMIT = 4
const DEFAULT_DURATION = 5000

let toasts: ToastItem[] = []
let counter = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setToasts(next: ToastItem[]) {
  toasts = next
  emit()
}

/** Imperative toast API usable from hooks, mutations and realtime handlers. */
export function toast(input: ToastInput) {
  const id = `toast-${++counter}`
  const item: ToastItem = { id, open: true, duration: DEFAULT_DURATION, ...input }
  setToasts([item, ...toasts].slice(0, TOAST_LIMIT))
  return {
    id,
    dismiss: () => dismissToast(id),
  }
}

export function dismissToast(id: string) {
  setToasts(toasts.map((t) => (t.id === id ? { ...t, open: false } : t)))
  // Give the exit animation time before removing from the list.
  setTimeout(() => setToasts(toasts.filter((t) => t.id !== id)), 300)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useToasts() {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts,
  )
}

/** Test/dev helper to clear every toast. */
export function clearToasts() {
  setToasts([])
}
