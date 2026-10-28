/**
 * Static pre-render handoff (see index.html). The HTML ships the above-the-fold artwork so it
 * paints before any JavaScript; when the matching React component mounts it adopts that very
 * <img> element instead of rendering a second one, so the browser keeps the already decoded
 * image (and the LCP candidate) and the placeholder block is removed in the same frame.
 */
export function prerenderedImage(id: string, src: string): HTMLImageElement | null {
  if (typeof document === 'undefined') return null
  const node = document.getElementById(id)
  if (!(node instanceof HTMLImageElement)) return null
  return node.getAttribute('src') === src ? node : null
}

/** Moves the static image into `slot` (and applies the final alt text), then drops the block. */
export function adoptPrerenderedImage(node: HTMLImageElement, slot: HTMLElement, alt: string) {
  node.alt = alt
  node.removeAttribute('id')
  slot.replaceChildren(node)
  removePrerender()
}

export function removePrerender() {
  document.getElementById('prerender')?.remove()
}
