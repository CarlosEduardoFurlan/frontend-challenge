import { build } from 'vite'
const out =
  'C:/Users/carlo/AppData/Local/Temp/claude/c--Users-carlo-OneDrive-Desktop-frontend-challenge/72daac06-8727-404a-952d-f5ddc1ebf36d/scratchpad/dist-analyze'
await build({
  configFile: 'vite.config.ts',
  logLevel: 'silent',
  build: { outDir: out, emptyOutDir: true },
  plugins: [
    {
      name: 'mods',
      generateBundle(_, bundle) {
        for (const c of Object.values(bundle)) {
          if (c.type !== 'chunk' || !/app-ui|react-|index-/.test(c.fileName)) continue
          const mods = Object.entries(c.modules)
            .map(([id, m]) => [
              id.replace(/.*node_modules[\/]/, 'nm:').replace(/.*[\/]src[\/]/, 'src/'),
              m.renderedLength,
            ])
            .filter(([, l]) => l > 1500)
            .sort((a, b) => b[1] - a[1])
          console.log(`=== ${c.fileName} total=${c.code.length}`)
          for (const [id, l] of mods.slice(0, 30))
            console.log(String(l).padStart(7), id.slice(0, 95))
        }
      },
    },
  ],
})
