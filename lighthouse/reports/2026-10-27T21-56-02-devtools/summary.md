# Lighthouse — 2026-10-27T21:56:05.093Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 95 | 100 | 100 | 100 | 2643 | 0.031 | 152 |
| home | desktop | 100 | 100 | 100 | 100 | 55 | 0.017 | 0 |
| nft-detail | mobile | 92 | 100 | 100 | 100 | 2549 | 0.03 | 142 |
| nft-detail | desktop | 100 | 100 | 100 | 100 | 490 | 0.028 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 95 | 100 | 100 | 100 | 2645 | 0.031 | 129 |
| 2 | 95 | 100 | 100 | 100 | 2643 | 0.031 | 153 |
| 3 | 95 | 100 | 100 | 100 | 2639 | 0.031 | 152 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 151 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 52 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 55 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 2561 | 0.03 | 159 |
| 2 | 92 | 100 | 100 | 100 | 2549 | 0.03 | 142 |
| 3 | 93 | 100 | 100 | 100 | 2537 | 0.03 | 139 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 49 | 0.028 | 0 |
| 2 | 100 | 100 | 100 | 100 | 514 | 0.028 | 0 |
| 3 | 100 | 100 | 100 | 100 | 490 | 0.028 | 0 |
