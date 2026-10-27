import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const normalise = (id: string) => id.split('\\').join('/')

/**
 * Build-time optimisations for the initial render:
 * - inlines the (small) global stylesheet so the first paint does not wait for a CSS round trip;
 * - adds `modulepreload` hints for the route component chunks of the two most visited pages
 *   (home statically, NFT detail through a tiny inline script that checks the pathname), so
 *   they download in parallel with the entry instead of one round trip later.
 * The mock layer is intentionally never preloaded: it must not compete with critical JS.
 */
function criticalAssetsPlugin(): Plugin {
  return {
    name: 'critical-assets',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html

        const collect = (test: (facadeId: string) => boolean): string[] => {
          const files = new Set<string>()
          const addWithImports = (fileName: string) => {
            if (files.has(fileName)) return
            files.add(fileName)
            const chunk = bundle[fileName]
            if (chunk && chunk.type === 'chunk') chunk.imports.forEach(addWithImports)
          }
          for (const output of Object.values(bundle)) {
            if (output.type !== 'chunk') continue
            if (test(normalise(output.facadeModuleId ?? ''))) addWithImports(output.fileName)
          }
          for (const output of Object.values(bundle)) {
            if (output.type === 'chunk' && output.isEntry) files.delete(output.fileName)
          }
          return [...files].filter((file) => !html.includes(`/${file}`) && !file.includes('mocks-'))
        }

        const homeFiles = collect((id) => /[/]routes[/]index[.]tsx([?]|$)/.test(id))
        const detailFiles = collect((id) =>
          /[/]routes[/]nft[/][$]nftId[.]tsx([?]|$)/.test(id),
        ).filter((file) => !homeFiles.includes(file))

        let result = html
        for (const fileName of homeFiles) {
          result = result.replace(
            '</head>',
            `    <link rel="modulepreload" crossorigin href="/${fileName}" />\n  </head>`,
          )
        }
        if (detailFiles.length) {
          const script =
            `<script>if(location.pathname.indexOf('/nft/')===0){${JSON.stringify(detailFiles)}` +
            `.forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';` +
            `l.crossOrigin='';l.href='/'+f;document.head.appendChild(l)})}</script>`
          result = result.replace('</head>', `    ${script}\n  </head>`)
        }

        // Inline the global stylesheet.
        result = result.replace(
          /<link rel="stylesheet" crossorigin href="[/](assets[/][^"]+[.]css)">/,
          (match, cssFile: string) => {
            const asset = bundle[cssFile]
            if (!asset || asset.type !== 'asset' || typeof asset.source !== 'string') return match
            // ~61 KB raw (11.5 KB gzip) after the Figma redesign; still worth one less round trip.
            if (asset.source.length > 72_000) return match
            delete bundle[cssFile]
            return `<style>${asset.source}</style>`
          },
        )
        return result
      },
    },
  }
}

const MOCK_PACKAGES = [
  'msw',
  '@mswjs',
  'tldts',
  'tldts-core',
  'tough-cookie',
  'path-to-regexp',
  'set-cookie-parser',
  'headers-polyfill',
  'outvariant',
  'strict-event-emitter',
  '@open-draft',
  'until-async',
  'rettime',
  'is-node-process',
  'graphql',
  'cookie',
  'psl',
  'punycode',
]

const SHARED_UI_SEGMENTS = [
  '/src/components/',
  '/src/lib/',
  '/src/hooks/',
  '/src/features/catalog/',
  '/src/features/favorites/',
]

/**
 * Chunk strategy. Rollup merges every dependency of a manual chunk into it unless that
 * dependency belongs to another manual chunk, so shared modules (validation schemas, money
 * helpers, fixtures used by the UI) get explicit groups. This keeps the mock runtime (MSW)
 * and the form/validation libraries out of the entry graph.
 */
function manualChunks(id: string): string | undefined {
  const path = normalise(id)
  const pkg = (name: string) => path.includes(`/node_modules/${name}/`)

  if (pkg('react') || pkg('react-dom') || pkg('scheduler')) return 'react'
  if (path.includes('/node_modules/@tanstack/')) return 'tanstack'
  if (
    pkg('zod') ||
    /[/]src[/]features[/](auth|profile|wallets|checkout)[/]schemas[.]ts$/.test(path)
  ) {
    return 'validation'
  }
  if (
    pkg('react-hook-form') ||
    pkg('@hookform/resolvers') ||
    path.endsWith('/src/components/ui/form.tsx')
  ) {
    return 'forms'
  }
  if (pkg('decimal.js') || path.endsWith('/src/lib/money.ts')) return 'money'
  // The Socket.IO client must stay in its own lazily evaluated chunk: engine.io-client captures
  // `globalThis.WebSocket` when its module runs, and that must happen after MSW patched it.
  // The protocol parsers are shared with the mock server, so they get a separate tiny chunk.
  if (pkg('socket.io-client') || pkg('engine.io-client')) return 'socket'
  if (
    pkg('socket.io-parser') ||
    pkg('engine.io-parser') ||
    path.includes('/node_modules/@socket.io/')
  ) {
    return 'socket-parsers'
  }
  if (MOCK_PACKAGES.some(pkg)) return 'mocks'
  if (
    /[/]src[/]mocks[/](browser|control|handlers|realtime|persistence[/]db|fixtures[/](nfts|users|coupons)|lib[/](http|crypto|event-bus|nft-store|cart-store|quote-store|order-store))/.test(
      path,
    )
  ) {
    return 'mocks'
  }
  // Small mock modules the UI itself needs (scenario selection, network table) live with the UI.
  if (
    /[/]src[/]mocks[/](scenarios|lib[/]scenario-state|persistence[/]storage|fixtures[/]networks)/.test(
      path,
    )
  ) {
    return 'app-ui'
  }
  if (SHARED_UI_SEGMENTS.some((segment) => path.includes(segment))) return 'app-ui'
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // The router plugin must run before React so generated route tree is fresh.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/app/router/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    criticalAssetsPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks },
    },
  },
})
