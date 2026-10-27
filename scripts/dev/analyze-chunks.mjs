import { build } from 'vite'
const out =
  'C:/Users/carlo/AppData/Local/Temp/claude/c--Users-carlo-OneDrive-Desktop-frontend-challenge/72daac06-8727-404a-952d-f5ddc1ebf36d/scratchpad/dist-analyze'
const want = (process.argv[2] ?? 'mocks,index,app-ui').split(',')
await build({
  configFile: 'vite.config.ts',
  logLevel: 'silent',
  build: { outDir: out, emptyOutDir: true },
  plugins: [
    {
      name: 'chunk-report',
      generateBundle(_, bundle) {
        for (const c of Object.values(bundle)) {
          if (c.type !== 'chunk') continue
          if (!want.some((w) => c.fileName.includes(w))) continue
          const src = Object.keys(c.modules)
            .filter((id) => !id.includes('node_modules'))
            .map((id) => id.replace(/.*[\/]src[\/]/, 'src/').replace(/\?.*$/, ''))
          const pkgs = [
            ...new Set(
              Object.keys(c.modules)
                .filter((id) => id.includes('node_modules'))
                .map((id) => id.match(/node_modules[\/](@[^\/]+[\/][^\/]+|[^\/]+)/)?.[1]),
            ),
          ]
          console.log(
            `\n=== ${c.fileName} entry=${c.isEntry} imports=[${c.imports.join(', ')}]\n  src: ${src.join(', ')}\n  pkgs: ${pkgs.join(', ')}`,
          )
        }
      },
    },
  ],
})
