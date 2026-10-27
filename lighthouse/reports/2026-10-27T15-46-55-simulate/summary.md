# Lighthouse — 2026-10-27T15:46:58.656Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 86 | 100 | 100 | 100 | 3801 | 0.028 | 51 |
| home | desktop | 100 | 100 | 100 | 100 | 795 | 0.017 | 0 |
| nft-detail | mobile | 83 | 100 | 100 | 100 | 4283 | 0.028 | 58 |
| nft-detail | desktop | 99 | 100 | 100 | 100 | 927 | 0.017 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 86 | 100 | 100 | 100 | 3801 | 0.028 | 51 |
| 2 | 86 | 100 | 100 | 100 | 3803 | 0.028 | 44 |
| 3 | 86 | 100 | 100 | 100 | 3797 | 0.028 | 52 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 795 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 750 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 797 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 83 | 100 | 100 | 100 | 4284 | 0.028 | 94 |
| 2 | 84 | 100 | 100 | 100 | 4206 | 0.028 | 54 |
| 3 | 83 | 100 | 100 | 100 | 4283 | 0.028 | 58 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 943 | 0.017 | 0 |
| 2 | 99 | 100 | 100 | 100 | 927 | 0.017 | 0 |
| 3 | 99 | 100 | 100 | 100 | 904 | 0.017 | 0 |
