/**
 * Socket.IO mock server. The full implementation lands with the realtime feature; this
 * module already exposes the connection count so the control endpoints compile.
 */
let connected = 0

export function getConnectedSocketCount(): number {
  return connected
}

export function trackConnection(delta: 1 | -1): void {
  connected = Math.max(0, connected + delta)
}
