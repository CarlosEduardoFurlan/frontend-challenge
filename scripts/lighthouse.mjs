/**
 * Lighthouse audit runner (versioned configuration).
 *
 * Audits the production build served by `vite preview` with the default mock scenario:
 *   pages:    home (/) and NFT detail (/nft/nft-001)
 *   profiles: mobile (Lighthouse default: Moto G Power emulation, slow 4G) and desktop preset
 *   runs:     3 per page/profile; the median of each category score is reported
 *
 * Output (lighthouse/reports/<timestamp>/):
 *   <page>-<profile>-<run>.html   full HTML report of every run
 *   <page>-<profile>-median.json  JSON report of the run whose performance score is the median
 *   summary.json / summary.md     scores (median), LCP/CLS/TBT per run, tool versions, conditions
 *
 * Usage: node scripts/lighthouse.mjs [--skip-build] [--runs=3] [--port=4174] [--throttling=simulate|devtools]
 *
 * Throttling: `simulate` (Lighthouse default, Lantern model) and `devtools` (real network/CPU
 * throttling applied through the DevTools protocol, metrics observed in the browser). Both are
 * reported because the Lantern model attributes the LCP image to the JavaScript-rendered element
 * and therefore ignores the statically pre-rendered hero that paints before the bundle.
 */
import { execSync, spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'

import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const args = new Map(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const RUNS = Number(args.get('runs') ?? 3)
const PORT = Number(args.get('port') ?? 4174)
const THROTTLING = args.get('throttling') === 'devtools' ? 'devtools' : 'simulate'
const BASE = `http://localhost:${PORT}`
const PAGES = [
  { id: 'home', path: '/' },
  { id: 'nft-detail', path: '/nft/nft-001' },
]
const PROFILES = [
  { id: 'mobile', config: undefined },
  { id: 'desktop', config: desktopConfig },
]
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const outDir = join('lighthouse', 'reports', `${stamp}-${THROTTLING}`)
mkdirSync(outDir, { recursive: true })

if (!args.has('skip-build')) {
  console.log('> building production bundle')
  execSync('npm run build', { stdio: 'inherit' })
}

console.log(`> starting vite preview on ${BASE}`)
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  shell: true,
})
await waitForServer(BASE)

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const summary = {
  generatedAt: new Date().toISOString(),
  environment: {
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    cpu: os.cpus()[0]?.model ?? 'unknown',
    cores: os.cpus().length,
    memoryGb: Math.round(os.totalmem() / 1024 ** 3),
    node: process.version,
    lighthouse: JSON.parse(readFileSync('node_modules/lighthouse/package.json', 'utf8')).version,
    chrome: null,
  },
  conditions: {
    server: 'vite preview (production build, MSW mock layer enabled, scenario "default")',
    mobile: 'Lighthouse default mobile emulation (Moto G Power, slow 4G throttling, 4x CPU)',
    desktop: 'Lighthouse desktop preset (no throttling, 1x CPU)',
    throttlingMethod: THROTTLING,
    runsPerTarget: RUNS,
    network: 'simulated throttling (Lighthouse default); page is served from localhost',
  },
  results: [],
}

try {
  for (const page of PAGES) {
    for (const profile of PROFILES) {
      const runs = []
      for (let run = 1; run <= RUNS; run++) {
        const url = `${BASE}${page.path}`
        console.log(`> ${page.id} / ${profile.id} / run ${run}`)
        const result = await lighthouse(
          url,
          {
            port: chrome.port,
            output: ['html', 'json'],
            logLevel: 'error',
            throttlingMethod: THROTTLING,
          },
          profile.config,
        )
        const lhr = result.lhr
        summary.environment.chrome ??=
          lhr.environment.hostUserAgent.match(/Chrome\/[\d.]+/)?.[0] ?? null
        const scores = Object.fromEntries(
          CATEGORIES.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)]),
        )
        const metrics = {
          lcpMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? 0),
          cls: Number((lhr.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3)),
          tbtMs: Math.round(lhr.audits['total-blocking-time']?.numericValue ?? 0),
          fcpMs: Math.round(lhr.audits['first-contentful-paint']?.numericValue ?? 0),
          speedIndexMs: Math.round(lhr.audits['speed-index']?.numericValue ?? 0),
        }
        const base = `${page.id}-${profile.id}-${run}`
        writeFileSync(join(outDir, `${base}.html`), result.report[0])
        runs.push({ run, scores, metrics, json: result.report[1] })
        console.log(
          `  scores ${JSON.stringify(scores)} LCP ${metrics.lcpMs}ms CLS ${metrics.cls} TBT ${metrics.tbtMs}ms`,
        )
      }
      const medianScores = Object.fromEntries(
        CATEGORIES.map((c) => [c, median(runs.map((r) => r.scores[c]))]),
      )
      const perfMedian = medianScores.performance
      const medianRun = runs.reduce(
        (best, r) =>
          Math.abs(r.scores.performance - perfMedian) <
          Math.abs(best.scores.performance - perfMedian)
            ? r
            : best,
        runs[0],
      )
      writeFileSync(join(outDir, `${page.id}-${profile.id}-median.json`), medianRun.json)
      summary.results.push({
        page: page.id,
        path: page.path,
        profile: profile.id,
        medianScores,
        medianMetrics: {
          lcpMs: median(runs.map((r) => r.metrics.lcpMs)),
          cls: median(runs.map((r) => r.metrics.cls)),
          tbtMs: median(runs.map((r) => r.metrics.tbtMs)),
        },
        runs: runs.map(({ run, scores, metrics }) => ({ run, scores, metrics })),
      })
    }
  }
} finally {
  await chrome.kill()
  preview.kill()
  try {
    execSync(`npx kill-port ${PORT}`, { stdio: 'ignore' })
  } catch {
    // best effort
  }
}

writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
writeFileSync(join(outDir, 'summary.md'), renderMarkdown(summary))
writeFileSync(
  join('lighthouse', 'latest.json'),
  JSON.stringify({ reportDir: outDir, ...summary }, null, 2),
)
console.log(`\n${renderMarkdown(summary)}\nReports written to ${outDir}`)

function renderMarkdown(data) {
  const lines = []
  lines.push(`# Lighthouse — ${data.generatedAt}`, '')
  lines.push(
    `Lighthouse ${data.environment.lighthouse} · ${data.environment.chrome} · Node ${data.environment.node} · ${data.environment.os} · ${data.environment.cpu} (${data.environment.cores} cores, ${data.environment.memoryGb} GB)`,
    '',
  )
  lines.push(
    `Server: ${data.conditions.server}. ${data.conditions.runsPerTarget} runs per page/profile; medians reported.`,
    '',
  )
  lines.push(
    '| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |',
  )
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const r of data.results) {
    const s = r.medianScores
    const m = r.medianMetrics
    lines.push(
      `| ${r.page} | ${r.profile} | ${s.performance} | ${s.accessibility} | ${s['best-practices']} | ${s.seo} | ${m.lcpMs} | ${m.cls} | ${m.tbtMs} |`,
    )
  }
  lines.push('', '## Individual runs', '')
  for (const r of data.results) {
    lines.push(
      `### ${r.page} / ${r.profile}`,
      '',
      '| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |',
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    )
    for (const run of r.runs) {
      lines.push(
        `| ${run.run} | ${run.scores.performance} | ${run.scores.accessibility} | ${run.scores['best-practices']} | ${run.scores.seo} | ${run.metrics.lcpMs} | ${run.metrics.cls} | ${run.metrics.tbtMs} |`,
      )
    }
    lines.push('')
  }
  return lines.join('\n')
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Server at ${url} did not start`)
}
