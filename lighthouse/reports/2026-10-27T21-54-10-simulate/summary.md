# Lighthouse — 2026-10-27T21:54:14.944Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 92 | 100 | 100 | 100 | 2715 | 0.031 | 34 |
| home | desktop | 99 | 100 | 100 | 100 | 841 | 0.017 | 0 |
| nft-detail | mobile | 90 | 100 | 100 | 100 | 3012 | 0.078 | 40 |
| nft-detail | desktop | 99 | 100 | 100 | 100 | 976 | 0.028 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 2715 | 0.031 | 36 |
| 2 | 92 | 100 | 100 | 100 | 2718 | 0.03 | 34 |
| 3 | 92 | 100 | 100 | 100 | 2713 | 0.031 | 27 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 862 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 617 | 0.017 | 0 |
| 3 | 99 | 100 | 100 | 100 | 841 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 90 | 100 | 100 | 100 | 3011 | 0.078 | 39 |
| 2 | 90 | 100 | 100 | 100 | 3012 | 0.078 | 40 |
| 3 | 79 | 100 | 100 | 100 | 4329 | 0.078 | 51 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 982 | 0.028 | 0 |
| 2 | 100 | 100 | 100 | 100 | 630 | 0.028 | 0 |
| 3 | 99 | 100 | 100 | 100 | 976 | 0.028 | 0 |
