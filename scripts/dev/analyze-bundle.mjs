import { build } from 'vite'
const out =
  process.argv[2] ??
  'C:/Users/carlo/AppData/Local/Temp/claude/c--Users-carlo-OneDrive-Desktop-frontend-challenge/72daac06-8727-404a-952d-f5ddc1ebf36d/scratchpad/dist-analyze'
await build({
  configFile: 'vite.config.ts',
  logLevel: 'silent',
  build: { outDir: out, emptyOutDir: true },
  plugins: [
    {
      name: 'size-report',
      generateBundle(_, bundle) {
        const chunks = Object.values(bundle)
          .filter((c) => c.type === 'chunk')
          .sort((a, b) => b.code.length - a.code.length)
          .slice(0, 3)
        for (const c of chunks) {
          console.log(
            `\n=== ${c.fileName} (${(c.code.length / 1024).toFixed(0)} KB raw, entry=${c.isEntry})`,
          )
          const mods = Object.entries(c.modules)
            .map(([id, m]) => [id, m.renderedLength])
            .sort((a, b) => b[1] - a[1])
          const byPkg = new Map()
          for (const [id, len] of mods) {
            const m = id.match(/node_modules[\/](@[^\/]+[\/][^\/]+|[^\/]+)/)
            const key = m ? m[1] : id.replace(/.*[\/]src[\/]/, 'src/')
            byPkg.set(key, (byPkg.get(key) ?? 0) + len)
          }
          for (const [k, v] of [...byPkg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22))
            console.log(`  ${(v / 1024).toFixed(1).padStart(7)} KB  ${k}`)
        }
      },
    },
  ],
})
