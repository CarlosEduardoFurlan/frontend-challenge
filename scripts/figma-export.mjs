/**
 * Figma reference exporter.
 *
 * Downloads, for every frame of the challenge file, the rendered PNG (2x), the node tree with
 * styles (fills, strokes, typography, layout, effects) and the image fills used by the frames,
 * so the visual audit (docs/FIGMA-AUDIT.md) can be done against real references.
 *
 * Requires a Figma personal access token with read access to the file:
 *   FIGMA_TOKEN=figd_xxx node scripts/figma-export.mjs [--file=fwIfA7xCwcap7SbD0YZ5pA]
 *
 * Output:
 *   docs/figma-reference/frames/<id>-<slug>.png       screenshot of each frame
 *   docs/figma-reference/nodes/<id>-<slug>.json       node tree (document subtree + styles)
 *   docs/figma-reference/images/<imageRef>.png        image fills (NFT artworks, hero, banners)
 *   docs/figma-reference/index.json                   summary (names, sizes, image refs per frame)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Map(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const FILE_KEY = args.get('file') ?? 'fwIfA7xCwcap7SbD0YZ5pA'
const TOKEN = process.env.FIGMA_TOKEN
if (!TOKEN) {
  console.error('FIGMA_TOKEN is required (Figma > Settings > Personal access tokens).')
  process.exit(1)
}

const FRAMES = [
  { id: '2:2', name: 'desktop-home' },
  { id: '10:244', name: 'desktop-nft-detail' },
  { id: '11:1278', name: 'desktop-cart' },
  { id: '11:2862', name: 'desktop-checkout' },
  { id: '11:4385', name: 'desktop-order-confirmation' },
  { id: '9:115', name: 'desktop-login' },
  { id: '9:1022', name: 'desktop-register' },
  { id: '9:1238', name: 'desktop-profile' },
  { id: '9:1670', name: 'desktop-wallets' },
  { id: '14:5226', name: 'mobile-home' },
  { id: '15:5536', name: 'mobile-nft-detail' },
  { id: '16:360', name: 'mobile-cart' },
  { id: '16:748', name: 'mobile-checkout' },
  { id: '16:1022', name: 'mobile-login' },
  { id: '16:1228', name: 'mobile-register' },
]

const OUT = join('docs', 'figma-reference')
for (const dir of ['frames', 'nodes', 'images']) mkdirSync(join(OUT, dir), { recursive: true })

async function api(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`)
  return res.json()
}

async function download(url, target) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} downloading ${url}`)
  writeFileSync(target, Buffer.from(await res.arrayBuffer()))
}

const ids = FRAMES.map((f) => f.id).join(',')
console.log('> fetching node trees')
const nodes = await api(`/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(ids)}&geometry=paths`)
console.log('> rendering frames (2x PNG)')
const renders = await api(`/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`)
console.log('> listing image fills')
const fills = await api(`/files/${FILE_KEY}/images`)

const summary = { file: FILE_KEY, exportedAt: new Date().toISOString(), frames: [] }
const imageRefs = new Set()

function collectImages(node, acc) {
  for (const fill of node.fills ?? [])
    if (fill.type === 'IMAGE' && fill.imageRef) acc.add(fill.imageRef)
  for (const child of node.children ?? []) collectImages(child, acc)
}

for (const frame of FRAMES) {
  const entry = nodes.nodes[frame.id]
  if (!entry) {
    console.warn(`  ! node ${frame.id} (${frame.name}) not found`)
    continue
  }
  const doc = entry.document
  const refs = new Set()
  collectImages(doc, refs)
  refs.forEach((r) => imageRefs.add(r))
  writeFileSync(
    join(OUT, 'nodes', `${frame.name}.json`),
    JSON.stringify({ styles: entry.styles, document: doc }, null, 2),
  )
  const url = renders.images?.[frame.id]
  if (url) await download(url, join(OUT, 'frames', `${frame.name}.png`))
  const box = doc.absoluteBoundingBox ?? {}
  summary.frames.push({
    ...frame,
    figmaName: doc.name,
    width: box.width,
    height: box.height,
    images: [...refs],
  })
  console.log(`  ${frame.name} (${doc.name}) ${box.width}x${box.height} images=${refs.size}`)
}

console.log(`> downloading ${imageRefs.size} image fills`)
for (const ref of imageRefs) {
  const url = fills.meta?.images?.[ref]
  if (url) await download(url, join(OUT, 'images', `${ref}.png`))
}
writeFileSync(join(OUT, 'index.json'), JSON.stringify(summary, null, 2))
console.log(`done: ${OUT}`)
