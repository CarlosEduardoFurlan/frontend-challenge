# Lighthouse — 2026-10-27T21:46:19.856Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 94 | 100 | 100 | 100 | 2641 | 0.031 | 194 |
| home | desktop | 100 | 100 | 100 | 100 | 54 | 0.017 | 0 |
| nft-detail | mobile | 78 | 100 | 100 | 100 | 4870 | 0.03 | 149 |
| nft-detail | desktop | 100 | 100 | 100 | 100 | 46 | 0.028 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 94 | 100 | 100 | 100 | 2641 | 0.031 | 194 |
| 2 | 94 | 100 | 100 | 100 | 2654 | 0.031 | 166 |
| 3 | 92 | 100 | 100 | 100 | 2641 | 0.031 | 234 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 53 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 54 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 58 | 0.017 | 1 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 75 | 100 | 100 | 100 | 4948 | 0.03 | 214 |
| 2 | 78 | 100 | 100 | 100 | 4811 | 0.03 | 149 |
| 3 | 78 | 100 | 100 | 100 | 4870 | 0.03 | 126 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 46 | 0.028 | 0 |
| 2 | 100 | 100 | 100 | 100 | 46 | 0.028 | 0 |
| 3 | 100 | 100 | 100 | 100 | 377 | 0.028 | 0 |
