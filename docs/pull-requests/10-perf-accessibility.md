# PR #10 — perf/accessibility → develop

## Objetivo e escopo

Auditoria Lighthouse versionada (runner, relatórios, versões e condições), otimizações de
carregamento sem remover funcionalidades, e revisão de experiência/acessibilidade decorrente das
medições.

## Principais decisões técnicas

- **Runner** `scripts/lighthouse.mjs`: 3 execuções por página/perfil, medianas, HTML de cada
  execução, JSON da mediana, `summary.json/md`, versões (Lighthouse 13.5, Chrome 156, Node 24) e
  condições. Dois modos de throttling: `simulate` (padrão) e `devtools` (observado).
- **Shell imediato + gate de rede**: o React renderiza antes de o MSW iniciar; Axios e o socket
  esperam `whenNetworkReady()`. Primeiro paint deixou de depender do service worker.
- **Pré-render estático** da hero (home) e do placeholder da arte (detalhe) no `index.html`,
  CSS crítico inline e `preload` da imagem LCP e das fontes críticas (fontes locais em
  `public/fonts`).
- **Chunks explícitos**: `react`, `tanstack`, `app-ui`, `validation` (zod + schemas), `forms`
  (react-hook-form), `money` (decimal.js), `socket` (socket.io-client isolado para que o
  `WebSocket` capturado seja o interceptado pelo MSW), `mocks`. O bundle inicial caiu de
  ~233 KB para ~175 KB gzip; zod e decimal.js saíram dele (validação de URL sem zod,
  `money-format` sem decimal).
- **Skeletons fiéis** ao conteúdo (detalhe e cards) e `robots.txt`: CLS 0,17 → 0,017 no detalhe
  desktop; SEO 92 → 100.
- Reconciliação de eventos (`apply-events`) carregada sob demanda e pré-aquecida na conexão;
  o status anterior do pedido é capturado antes do import para não perder a transição.

## Resultados (medianas) — ver `lighthouse/README.md`

| Página  | Perfil  | simulate (Perf/A11y/BP/SEO) | devtools (Perf) |
| ------- | ------- | --------------------------- | --------------- |
| início  | mobile  | 86 / 100 / 100 / 100        | 99              |
| início  | desktop | 100 / 100 / 100 / 100       | 100             |
| detalhe | mobile  | 83 / 100 / 100 / 100        | 96              |
| detalhe | desktop | 99 / 100 / 100 / 100        | 100             |

Meta de Performance mobile (≥ 90) **não atingida no modo simulate** (86/83); causas e a divergência
entre os modos estão documentadas em `lighthouse/README.md`.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run build ✔
npx playwright test (E2E + visual): 154 passed
npm run lighthouse (simulate) e --throttling=devtools: relatórios em lighthouse/reports/
```

## Limitações

- Performance mobile no modo `simulate` abaixo de 90 (ver análise em `lighthouse/README.md`).
