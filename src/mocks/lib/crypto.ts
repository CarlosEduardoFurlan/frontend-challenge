/** Password hashing for the mock database (salted SHA-256 via Web Crypto). */
const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function randomId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return `${prefix}_${toHex(bytes.buffer)}`
}

export function randomSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}:${password}`))
  return toHex(digest)
}

export async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
}

export function fakeTxHash(): string {
  return `0x${toHex(crypto.getRandomValues(new Uint8Array(32)).buffer)}`
}
