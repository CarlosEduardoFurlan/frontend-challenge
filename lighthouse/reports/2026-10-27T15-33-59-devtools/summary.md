# Lighthouse — 2026-10-27T15:34:02.090Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 99 | 100 | 100 | 100 | 2186 | 0.028 | 8 |
| home | desktop | 100 | 100 | 100 | 100 | 169 | 0.017 | 0 |
| nft-detail | mobile | 96 | 100 | 100 | 100 | 2132 | 0.028 | 125 |
| nft-detail | desktop | 100 | 100 | 100 | 100 | 444 | 0.017 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 2186 | 0.028 | 8 |
| 2 | 98 | 100 | 100 | 100 | 2180 | 0.028 | 77 |
| 3 | 99 | 100 | 100 | 100 | 2197 | 0.028 | 2 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 169 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 164 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 177 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 96 | 100 | 100 | 100 | 2106 | 0.028 | 125 |
| 2 | 95 | 100 | 100 | 100 | 2132 | 0.028 | 137 |
| 3 | 96 | 100 | 100 | 100 | 2151 | 0.028 | 18 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 66 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 626 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 444 | 0.017 | 0 |
