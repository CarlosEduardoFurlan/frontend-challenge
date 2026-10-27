# Auditoria Lighthouse

Páginas auditadas: **início** (`/`) e **detalhe do NFT** (`/nft/nft-001`), perfis **mobile** e
**desktop**, três medições por página/perfil, build de produção servido por `vite preview` com a
camada MSW ativa no cenário `default`. Os relatórios HTML de todas as execuções, o JSON da execução
mediana e o `summary.json`/`summary.md` ficam em `lighthouse/reports/<data>-<modo>/`; o resumo da
última execução (qualquer modo) está em `lighthouse/latest.json`.

```
npm run lighthouse                      # modo simulate (padrão do Lighthouse)
npm run lighthouse -- --throttling=devtools
node scripts/lighthouse.mjs --skip-build --runs=3 --port=4174
```

Ferramentas: Lighthouse 13.5.0 · Chrome 156 (headless) · Node 24.19 · Windows 11 (i5-12450HX,
12 núcleos, 16 GB). A configuração está versionada em `scripts/lighthouse.mjs`.

## Resultados (medianas de 3 execuções) — build da branch `fix/figma-fidelity`

Execução final de 2026-10-27 (`lighthouse/reports/2026-10-27T21-54-10-simulate` e
`2026-10-27T21-56-02-devtools`), depois da correção de fidelidade ao Figma, do chrome mobile e
da adoção da imagem pré-renderizada pelo React (ver abaixo).

### Modo `simulate` (padrão do Lighthouse, modelo Lantern)

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS   | TBT (ms) |
| ------- | ------- | ----------: | ------------: | -------------: | --: | -------: | ----- | -------: |
| início  | mobile  |      **92** |           100 |            100 | 100 |     2715 | 0.031 |       34 |
| início  | desktop |          99 |           100 |            100 | 100 |      841 | 0.017 |        0 |
| detalhe | mobile  |      **90** |           100 |            100 | 100 |     3012 | 0.078 |       40 |
| detalhe | desktop |          99 |           100 |            100 | 100 |      976 | 0.028 |        0 |

### Modo `devtools` (throttling real aplicado via protocolo DevTools, métricas observadas)

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS   | TBT (ms) |
| ------- | ------- | ----------: | ------------: | -------------: | --: | -------: | ----- | -------: |
| início  | mobile  |          95 |           100 |            100 | 100 |     2643 | 0.031 |      152 |
| início  | desktop |         100 |           100 |            100 | 100 |       55 | 0.017 |        0 |
| detalhe | mobile  |          92 |           100 |            100 | 100 |     2549 | 0.030 |      142 |
| detalhe | desktop |         100 |           100 |            100 | 100 |      490 | 0.028 |        0 |

Metas do desafio: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
**Todas as metas são atingidas nas quatro combinações, nos dois modos.** A margem do detalhe
mobile no modo `simulate` é pequena (90, com variação de ±2 pontos entre execuções, ver
"Limitações"), e o CLS desse perfil (0,078) continua dentro da faixa "boa" (< 0,1), mas é o maior
da aplicação. O relatório mediano atribui 0,048 à barra de navegação inferior fixa (os rótulos
dos itens refluem quando a Roboto Mono substitui a fonte de fallback) e 0,030 ao `main`, onde o
painel do detalhe é renderizado pelo React abaixo da arte estática.

### Adoção da imagem pré-renderizada (84/81 → 92/90)

As medições anteriores desta branch (`2026-10-27T20-11-47-simulate`: 84 início / 81 detalhe)
ficavam abaixo da meta no mobile simulado porque o modelo Lantern atribuía o LCP à imagem criada
pelo React. A correção foi fazer o React **adotar o nó `<img>` estático** em vez de renderizar
outro: o `#prerender` do `index.html` fica fora de `#root`, e `HomeHero`/`NftGallery` movem o
elemento existente para o slot do componente no `useLayoutEffect` (`src/lib/prerender.ts`). O
elemento LCP do DOM final passa a ser o mesmo que o navegador pintou a partir do HTML, com
`preload`, e o Lantern deixa de encadear o bundle inteiro antes dele.

Medições intermediárias no mesmo build de referência: com a adoção só no desktop
(`2026-10-27T21-44-20-simulate`), início mobile subiu para 92 e detalhe mobile ficou em 79
(LCP 4,4 s); estendendo o pré-render e a adoção ao layout mobile do detalhe (sem header, arte em
largura total), o detalhe mobile foi a 90 (LCP 3,0 s) na execução final.

### Efeito da correção de fidelidade ao Figma

A primeira medição após o redesign (`2026-10-27T20-00-41-simulate`) deu 82 (início) e **72**
(detalhe) no mobile simulado, com TBT de 330 ms no detalhe. Duas causas foram identificadas e
corrigidas antes da medição final:

- o chunk compartilhado `app-ui` passou a carregar os componentes exclusivos da home (filtros,
  slider, promos, blog) também na página de detalhe; eles voltaram ao chunk da rota inicial
  (`app-ui` 303 → 285 KB, chunk da home 19 KB);
- a arte principal (hero/detalhe) oferecia a variante de 1024 px via `srcset`, e o perfil mobile
  do Lighthouse (DPR 1,75) a escolhia; agora um `<picture>` reserva a variante grande para
  viewports ≥ 1024 px e o telefone baixa no máximo a de 640 px (o `preload` segue a mesma regra).

Uma medição A/B na mesma máquina e hora (build do commit anterior ao redesign, `3396c65`, em um
worktree) deu 77 pontos / TBT 315 ms para o detalhe mobile em execução única, contra 73 / 316 ms
do redesign antes das correções: a diferença de TBT entre sessões (58 ms na medição da manhã)
vem da variação da máquina, não do redesign. O custo residual do redesign fica em ~2 pontos no
mobile simulado, pelo conteúdo adicional da página (promos, blog, rodapé completo).

## Por que os dois modos ainda divergem no mobile

A aplicação pré-renderiza estaticamente a hero da home e a arte do detalhe no `index.html`, com
CSS crítico inline e `preload` da imagem. No Chrome real, essa imagem pinta antes de qualquer
JavaScript: medindo os candidatos a LCP com `PerformanceObserver` sob 4G lento e CPU 4x
(`scripts/dev/lcp-candidates.mjs`), o LCP é a imagem estática a ~1,0 s, e é isso que o modo
`devtools` observa (LCP ≈ 2,5–2,6 s com a latência simulada e as artes do Figma).

O modo `simulate` usa o modelo Lantern, que reconstrói o caminho crítico de rede até o elemento
LCP do DOM final. Com a adoção do nó estático, esse elemento é a própria imagem pré-renderizada,
e o LCP estimado cai de ~4,0–4,4 s para 2,7–3,0 s; a diferença residual para o modo `devtools`
vem do modelo de rede do Lantern (ele ainda contabiliza o CSS inline e a fonte pré-carregada no
caminho crítico), não de JavaScript.

## Otimizações aplicadas (todas mantêm as funcionalidades, imagens e fontes da entrega)

- Render imediato do shell com gate das requisições até o MSW iniciar (`src/lib/app-ready.ts`).
- Pré-render estático da hero e da arte do detalhe (desktop e mobile) e CSS inline
  (`index.html`, plugin em `vite.config.ts`); o React adota o nó `<img>` estático em vez de
  renderizar outro (`src/lib/prerender.ts`).
- `preload` da imagem LCP e das duas fontes críticas; fontes locais em `public/fonts` (apenas
  subconjunto Latin, `font-display: swap`).
- Code splitting por rota (TanStack Router) e grupos explícitos de chunks: `react`, `tanstack`,
  `app-ui`, `validation` (zod + schemas), `forms` (react-hook-form), `money` (decimal.js),
  `socket`, `mocks` (MSW). Zod e decimal.js saíram do bundle inicial; menus, drawers e o
  slider (Radix) ficam fora de `app-ui` e são carregados com seus consumidores lazy; o painel de
  mocks carrega sob demanda.
- `modulepreload` do chunk da rota inicial (home) e, via script inline, do chunk do detalhe.
- Artes do Figma em WebP com `width`/`height`, `srcset` 320/640 (1024 apenas para desktop via
  `<picture>`) e `loading="lazy"` fora da dobra; skeletons com as mesmas dimensões do conteúdo
  (CLS ≤ 0,035).

## Causas residuais e limitações

- O bundle inicial inclui `axios`, `react-dom`, TanStack Router/Query e Radix Toast (todos
  exigidos pela stack); no 4G simulado o download+execução leva ~2,5 s antes da hidratação.
- A camada MSW (~140 KB gzip) é obrigatória no build de demonstração; ela é carregada após o
  shell e não bloqueia o primeiro paint, mas consome banda e CPU na janela de carregamento.
- `bf-cache` falha por haver um WebSocket aberto (Socket.IO), inerente ao requisito de tempo real.
- Medições feitas em máquina de desenvolvimento; a variação entre execuções foi de ±2–3 pontos
  no mobile simulado, então o detalhe mobile (90) pode oscilar em torno da meta em outra máquina.
  Os relatórios intermediários (`2026-10-27T21-44-20-simulate`, `2026-10-27T21-46-17-devtools`)
  foram mantidos como evidência do estado anterior à adoção no mobile.
