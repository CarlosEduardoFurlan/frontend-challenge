# Auditoria Lighthouse

Páginas auditadas: **início** (`/`) e **detalhe do NFT** (`/nft/nft-001`), perfis **mobile** e
**desktop**, três medições por página/perfil, build de produção servido por `vite preview` com a
camada MSW ativa no cenário `default`. Os relatórios HTML de todas as execuções, o JSON da execução
mediana e o `summary.json`/`summary.md` ficam em `lighthouse/reports/<data>-<modo>/`; o resumo da
última execução de cada modo está em `lighthouse/latest-simulate.json` e
`lighthouse/latest-devtools.json`.

```
npm run lighthouse                      # modo simulate (padrão do Lighthouse)
npm run lighthouse -- --throttling=devtools
node scripts/lighthouse.mjs --skip-build --runs=3 --port=4174
```

Ferramentas: Lighthouse 13.5.0 · Chrome 156 (headless) · Node 24.19 · Windows 11 (i5-12450HX,
12 núcleos, 16 GB). A configuração está versionada em `scripts/lighthouse.mjs`.

## Resultados (medianas de 3 execuções)

### Modo `simulate` (padrão do Lighthouse, modelo Lantern)

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS   | TBT (ms) |
| ------- | ------- | ----------: | ------------: | -------------: | --: | -------: | ----- | -------: |
| início  | mobile  |      **86** |           100 |            100 | 100 |     3801 | 0.028 |       51 |
| início  | desktop |         100 |           100 |            100 | 100 |      795 | 0.017 |        0 |
| detalhe | mobile  |      **83** |           100 |            100 | 100 |     4283 | 0.028 |       58 |
| detalhe | desktop |          99 |           100 |            100 | 100 |      927 | 0.017 |        0 |

### Modo `devtools` (throttling real aplicado via protocolo DevTools, métricas observadas)

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS   | TBT (ms) |
| ------- | ------- | ----------: | ------------: | -------------: | --: | -------: | ----- | -------: |
| início  | mobile  |          99 |           100 |            100 | 100 |     2186 | 0.028 |        8 |
| início  | desktop |         100 |           100 |            100 | 100 |      169 | 0.017 |        0 |
| detalhe | mobile  |          96 |           100 |            100 | 100 |     2132 | 0.028 |      125 |
| detalhe | desktop |         100 |           100 |            100 | 100 |      444 | 0.017 |        0 |

Metas do desafio: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
Todas as metas são atingidas em desktop (ambos os modos) e em mobile no modo `devtools`.
**No modo `simulate`, Performance mobile fica em 86 (início) e 83 (detalhe)**: abaixo da meta.

## Por que os dois modos divergem no mobile

A aplicação pré-renderiza estaticamente a hero da home (e um placeholder da arte no detalhe) no
`index.html`, com CSS crítico inline e `preload` da imagem. No Chrome real, essa imagem pinta
antes de qualquer JavaScript: medindo os candidatos a LCP com `PerformanceObserver` sob 4G lento e
CPU 4x (`scripts/dev/lcp-candidates.mjs`), o LCP é a imagem estática a ~1,0 s, e é isso que o
modo `devtools` observa (LCP ≈ 2,1 s com a latência simulada).

O modo `simulate` usa o modelo Lantern: ele identifica o elemento LCP no DOM final (a imagem
renderizada pelo React, que substitui a estática ao montar), reconstrói o caminho crítico de rede
até ele e, como esse elemento foi criado por JavaScript, assume que o LCP depende do download e
da execução de todo o bundle inicial (~175 KB gzip: React, TanStack, UI). Daí o LCP estimado de
~3,8 s. É uma limitação do modelo para páginas com pré-renderização parcial, não um atraso que o
usuário veja; ainda assim registramos o número porque é o que `npx lighthouse` reporta por padrão.

## Otimizações aplicadas (todas mantêm as funcionalidades, imagens e fontes da entrega)

- Render imediato do shell com gate das requisições até o MSW iniciar (`src/lib/app-ready.ts`).
- Pré-render estático da hero/placeholder e CSS inline (`index.html`, plugin em `vite.config.ts`).
- `preload` da imagem LCP e das duas fontes críticas; fontes locais em `public/fonts` (apenas
  subconjunto Latin, `font-display: swap`).
- Code splitting por rota (TanStack Router) e grupos explícitos de chunks: `react`, `tanstack`,
  `app-ui`, `validation` (zod + schemas), `forms` (react-hook-form), `money` (decimal.js),
  `socket`, `mocks` (MSW). Zod e decimal.js saíram do bundle inicial; menus do header são
  carregados sob demanda.
- `modulepreload` do chunk da rota inicial (home) e, via script inline, do chunk do detalhe.
- Imagens WebP com `width`/`height`, `srcset` 320/640 e `loading="lazy"` fora da dobra;
  skeletons com as mesmas dimensões do conteúdo (CLS ≤ 0,03).

## Causas residuais e limitações

- O bundle inicial inclui `axios`, `react-dom`, TanStack Router/Query e Radix Toast (todos
  exigidos pela stack); no 4G simulado o download+execução leva ~2,5 s antes da hidratação.
- A camada MSW (~140 KB gzip) é obrigatória no build de demonstração; ela é carregada após o
  shell e não bloqueia o primeiro paint, mas consome banda e CPU na janela de carregamento.
- `bf-cache` falha por haver um WebSocket aberto (Socket.IO), inerente ao requisito de tempo real.
- Medições feitas em máquina de desenvolvimento; a variação entre execuções foi de ±3 pontos no
  mobile simulado.
