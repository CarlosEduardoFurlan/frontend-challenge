import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/types/api'

/**
 * Internal event bus of the mock backend. Store mutations publish domain events here and the
 * Socket.IO mock server forwards them to connected clients. The UI never subscribes to this
 * bus directly: it only receives events through `socket.io-client`.
 */
export interface MockDomainEvents {
  'nft.updated': NftUpdatedEvent
  /** `userId` scopes delivery to the order owner. */
  'order.updated': OrderUpdatedEvent & { userId: string }
}

type Listener<K extends keyof MockDomainEvents> = (event: MockDomainEvents[K]) => void

const listeners: { [K in keyof MockDomainEvents]: Set<Listener<K>> } = {
  'nft.updated': new Set(),
  'order.updated': new Set(),
}

export const mockEventBus = {
  on<K extends keyof MockDomainEvents>(type: K, listener: Listener<K>): () => void {
    listeners[type].add(listener)
    return () => listeners[type].delete(listener)
  },
  emit<K extends keyof MockDomainEvents>(type: K, event: MockDomainEvents[K]): void {
    listeners[type].forEach((listener) => listener(event))
  },
}
