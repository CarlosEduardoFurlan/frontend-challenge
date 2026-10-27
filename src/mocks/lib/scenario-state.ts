import { env } from '@/lib/env'

import { DEFAULT_SCENARIO_ID, getScenario, type ScenarioConfig } from '../scenarios'
import { readString, STORAGE_KEYS, writeString } from '../persistence/storage'

/**
 * Current scenario selection. Resolution order:
 *   1. `?mock-scenario=<id>` in the URL (persisted so refreshes keep it)
 *   2. localStorage
 *   3. VITE_MOCK_SCENARIO / "default"
 */
let currentId: string = env.defaultScenario || DEFAULT_SCENARIO_ID
const failureCounters = new Map<string, number>()
const listeners = new Set<(id: string) => void>()

export function initScenarioFromLocation(): { reset: boolean } {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('mock-scenario')
  const reset = params.has('mock-reset')

  if (fromUrl) {
    setScenario(fromUrl)
  } else {
    const stored = readString(STORAGE_KEYS.scenario)
    if (stored) currentId = getScenario(stored).id
  }

  if (fromUrl || reset) {
    // Remove control params so they do not leak into app URL state or history.
    params.delete('mock-scenario')
    params.delete('mock-reset')
    const query = params.toString()
    const clean = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(window.history.state, '', clean)
  }
  return { reset }
}

export function getCurrentScenario(): ScenarioConfig {
  return getScenario(currentId)
}

export function getCurrentScenarioId(): string {
  return currentId
}

export function setScenario(id: string): ScenarioConfig {
  const scenario = getScenario(id)
  currentId = scenario.id
  failureCounters.clear()
  writeString(STORAGE_KEYS.scenario, scenario.id)
  listeners.forEach((l) => l(scenario.id))
  return scenario
}

export function onScenarioChange(listener: (id: string) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Returns true when a failure rule with `times` still has budget (and consumes one). */
export function consumeFailureBudget(ruleKey: string, times: number | undefined): boolean {
  if (times === undefined) return true
  const used = failureCounters.get(ruleKey) ?? 0
  if (used >= times) return false
  failureCounters.set(ruleKey, used + 1)
  return true
}
