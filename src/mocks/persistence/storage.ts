/**
 * Thin wrapper around localStorage used by the mock database and scenario selection.
 * Every access is guarded: private mode or blocked storage must not break the app.
 */
export const STORAGE_KEYS = {
  db: 'nftm.mock.db.v1',
  scenario: 'nftm.mock.scenario',
} as const

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable: the in-memory state still works for this session.
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
