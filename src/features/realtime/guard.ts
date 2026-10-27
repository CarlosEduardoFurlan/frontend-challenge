import type { RealtimeEnvelope } from '@/types/api'

/**
 * Protects against duplicated, stale and out-of-order events.
 * - `eventId` de-duplication (bounded memory);
 * - per-resource monotonic version: an event older than (or equal to) the last applied version
 *   for that resource is ignored, so a late delivery never regresses fresher state.
 * The guard is recreated with every socket (login/logout), so one session never influences another.
 */
export class RealtimeGuard {
  private readonly seen = new Set<string>()
  private readonly seenOrder: string[] = []
  private readonly versions = new Map<string, number>()

  constructor(private readonly maxSeen = 500) {}

  /** Returns `true` when the event must be applied and records it. */
  accept(event: RealtimeEnvelope<string, unknown>, knownVersion?: number): boolean {
    if (this.seen.has(event.eventId)) return false
    this.remember(event.eventId)

    const key = `${event.type}:${event.resourceId}`
    const last = Math.max(this.versions.get(key) ?? -1, knownVersion ?? -1)
    if (event.version <= last) return false
    this.versions.set(key, event.version)
    return true
  }

  /** REST responses can also move the known version forward (reconciliation). */
  observeVersion(type: string, resourceId: string, version: number) {
    const key = `${type}:${resourceId}`
    if ((this.versions.get(key) ?? -1) < version) this.versions.set(key, version)
  }

  private remember(id: string) {
    this.seen.add(id)
    this.seenOrder.push(id)
    if (this.seenOrder.length > this.maxSeen) {
      const oldest = this.seenOrder.shift()
      if (oldest) this.seen.delete(oldest)
    }
  }
}
