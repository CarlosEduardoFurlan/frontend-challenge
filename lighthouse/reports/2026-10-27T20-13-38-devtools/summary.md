# Lighthouse — 2026-10-27T20:13:40.842Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 94 | 100 | 100 | 100 | 2680 | 0.028 | 176 |
| home | desktop | 100 | 100 | 100 | 100 | 143 | 0.017 | 0 |
| nft-detail | mobile | 93 | 100 | 100 | 100 | 2613 | 0.028 | 155 |
| nft-detail | desktop | 100 | 100 | 100 | 100 | 473 | 0.028 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 93 | 100 | 100 | 100 | 2682 | 0.028 | 205 |
| 2 | 95 | 100 | 100 | 100 | 2672 | 0.028 | 149 |
| 3 | 94 | 100 | 100 | 100 | 2680 | 0.028 | 176 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 142 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 149 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 143 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 2630 | 0.028 | 179 |
| 2 | 93 | 100 | 100 | 100 | 2595 | 0.028 | 155 |
| 3 | 93 | 100 | 100 | 100 | 2613 | 0.028 | 128 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 477 | 0.028 | 0 |
| 2 | 100 | 100 | 100 | 100 | 466 | 0.028 | 0 |
| 3 | 100 | 100 | 100 | 100 | 473 | 0.028 | 0 |
