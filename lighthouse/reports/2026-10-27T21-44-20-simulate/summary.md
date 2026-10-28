# Lighthouse — 2026-10-27T21:44:23.713Z

Lighthouse 13.5.0 · Chrome/156.0.0.0 · Node v24.19.0 · Windows_NT 10.0.26300 (x64) · 12th Gen Intel(R) Core(TM) i5-12450HX (12 cores, 16 GB)

Server: vite preview (production build, MSW mock layer enabled, scenario "default"). 3 runs per page/profile; medians reported.

| Page | Profile | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 92 | 100 | 100 | 100 | 2714 | 0.031 | 30 |
| home | desktop | 100 | 100 | 100 | 100 | 619 | 0.017 | 0 |
| nft-detail | mobile | 79 | 100 | 100 | 100 | 4433 | 0.078 | 77 |
| nft-detail | desktop | 100 | 100 | 100 | 100 | 631 | 0.028 | 0 |

## Individual runs

### home / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 2715 | 0.031 | 38 |
| 2 | 92 | 100 | 100 | 100 | 2714 | 0.03 | 30 |
| 3 | 92 | 100 | 100 | 100 | 2712 | 0.031 | 28 |

### home / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 861 | 0.017 | 0 |
| 2 | 100 | 100 | 100 | 100 | 615 | 0.017 | 0 |
| 3 | 100 | 100 | 100 | 100 | 619 | 0.017 | 0 |

### nft-detail / mobile

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 79 | 100 | 100 | 100 | 4433 | 0.078 | 77 |
| 2 | 79 | 100 | 100 | 100 | 4438 | 0.078 | 85 |
| 3 | 78 | 100 | 100 | 100 | 4411 | 0.078 | 48 |

### nft-detail / desktop

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 630 | 0.028 | 0 |
| 2 | 99 | 100 | 100 | 100 | 952 | 0.028 | 0 |
| 3 | 100 | 100 | 100 | 100 | 631 | 0.028 | 0 |
