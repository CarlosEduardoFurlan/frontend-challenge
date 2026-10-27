# Lighthouse — 2026-10-27T20:11:52.401Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 84 | 100 | 100 | 100 | 4020 | 0.028 | 58 |
| home | desktop | 99 | 100 | 100 | 100 | 842 | 0.017 | 0 |
| nft-detail | mobile | 81 | 100 | 100 | 100 | 4431 | 0.033 | 90 |
| nft-detail | desktop | 99 | 100 | 100 | 100 | 934 | 0.028 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 84 | 100 | 100 | 100 | 4024 | 0.028 | 83 |
| 2 | 84 | 100 | 100 | 100 | 4019 | 0.028 | 57 |
| 3 | 84 | 100 | 100 | 100 | 4020 | 0.028 | 58 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 845 | 0.017 | 0 |
| 2 | 99 | 100 | 100 | 100 | 841 | 0.017 | 0 |
| 3 | 99 | 100 | 100 | 100 | 842 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 81 | 100 | 100 | 100 | 4357 | 0.033 | 90 |
| 2 | 81 | 100 | 100 | 100 | 4439 | 0.033 | 108 |
| 3 | 81 | 100 | 100 | 100 | 4431 | 0.033 | 77 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 934 | 0.028 | 0 |
| 2 | 99 | 100 | 100 | 100 | 936 | 0.028 | 0 |
| 3 | 99 | 100 | 100 | 100 | 934 | 0.028 | 0 |
