# PR #12 — fix/figma-fidelity → develop

Abrir em: `https://github.com/CarlosEduardoFurlan/frontend-challenge/compare/develop...fix/figma-fidelity?expand=1`

## Objetivo e escopo

Corrigir a fidelidade visual ao arquivo Figma "Frontend Challenge (Copy)"
(`fwIfA7xCwcap7SbD0YZ5pA`) usando o MCP oficial do Figma: tokens, tipografia, assets originais,
componentes compartilhados e as 15 telas (desktop e mobile), preservando toda a funcionalidade,
os cenários MSW e a suíte de testes.

## O que foi inspecionado no Figma

- `whoami`, `create_session`, `get_metadata`, `get_variable_defs` e `get_design_context` do frame
  "Desktop / Início" (`2:2`): 12 variáveis de cor, 25 estilos de texto (Roboto Mono 400/500/700),
  código de referência e 25 assets.
- Screenshots de 7 frames pelo MCP: início, detalhe, carrinho, pagamento, confirmação, carteiras e
  pagamento mobile.
- Os outros 8 frames (login, cadastro, perfil e os mobiles de início, detalhe, carrinho, login e
  cadastro) foram exportados manualmente do Figma em PNG 2x depois que o plano Starter esgotou a
  cota de 20 chamadas/mês do MCP. Todos os 15 frames estão em
  `docs/figma-comparison/figma-reference/` e comparados lado a lado em
  `docs/figma-comparison/comparisons/` (`scripts/figma-compare.py`).

## Conteúdo

- **Assets** (`fix(assets)`): quatro artes e os ícones do arquivo convertidos por
  `scripts/figma-assets.py` para `public/assets/` (WebP 320/640/1024 + SVG); artes geradas
  removidas; fixtures mapeados às artes com a repetição da grade do design.
- **Design system** (`style(tokens)`): paleta completa do arquivo, raios, Roboto Mono em três
  pesos, primitivos restilizados (botões, campos, rádios, abas, chips, cards, slider).
- **Componentes compartilhados** (`fix(figma)`): Header Row (nav de 4 itens, busca por ícone,
  carrinho com badge, botão Entrar), Footer de três blocos, cards 258×300, paginação 35 px,
  breadcrumbs, stepper redondo.
- **Chrome mobile** (`fix(figma)`): abaixo de 1024px o header dá lugar ao campo de busca + botão
  de filtros e à barra inferior (início, favoritos, botão central, carrinho, conta) da home
  mobile; telas de mercado com botão de voltar + título; telas de autenticação em tela inteira.
- **Início** (`fix(figma)`): hero, sidebar (Filters + Featured NFT Banner), toolbar com abas e
  ordenação, grade 3×3, promos, Diário da Cunhagem; no mobile, card do hero, abas e grade de 2
  colunas com faixa "RARO"; filtro "Rede" implementado de ponta a ponta; pré-render e preload de
  LCP atualizados.
- **Detalhe, carrinho, pagamento, confirmação** (`fix(figma)`): layouts reproduzidos das
  referências desktop e mobile (arte em largura total com botões redondos, painel com "Comprar
  NFT", cards do carrinho, cupom em pílula, "Pagamento com carteira").
- **Login / cadastro** (`fix(figma)`): modal de 500 px sobre a home no desktop (abas Entrar |
  Criar conta, "Ou continue com", faixa primary) e tela inteira com o wordmark no mobile.
- **Perfil, carteiras, favoritos** (`fix(figma)`): sidebar "Meu perfil", "Perfil do
  colecionador" em duas colunas com a linha do avatar, blocos de carteira, "Lista de interesse".
- **Performance** (`perf`): componentes exclusivos da home fora do chunk compartilhado, overlays
  (menus, drawers, slider) com seus consumidores lazy, painel de mocks carregado sob demanda,
  arte de 1024 px apenas para desktop via `<picture>`, e a imagem pré-renderizada do hero/detalhe
  é adotada pelo React (mesmo nó DOM) em vez de ser renderizada de novo.
- **Testes** (`test(e2e)`, `test(visual)`): fixture aguarda `main` (não há header no mobile), busca
  atrás do ícone no desktop e sempre visível no mobile, banner de destaque, galeria com a mesma
  arte; baselines visuais regeneradas após a comparação; `playwright.remote.config.ts` executa as
  mesmas suítes contra uma URL publicada (`REMOTE_BASE_URL`).
- **Docs**: `docs/FIGMA-AUDIT.md` completo (15 frames), README/ARCHITECTURE/matriz atualizados,
  `lighthouse/README.md` com as medianas.

## Divergências assumidas (funcionalidade exigida pelo desafio)

"Adicionar ao carrinho" ao lado de "COMPRAR" (desktop) e botão redondo do carrinho (mobile);
coleção e disponibilidade nos cards; favorito ao passar o mouse (desktop); contagem de
resultados e seletor de ordenação; filtro "Disponibilidade"; campos de checkout reais (nome,
e-mail, CPF) no lugar dos campos fictícios do design; barra inferior mantida em todas as telas
mobile (o arquivo só a mostra na home); pontos de galeria no detalhe mobile; login social e
recuperação de senha explicados em toast (não existem no mock); ilustração "THANK YOU" e marcas
Google/Facebook não exportadas (ícone e monogramas).

## Deploy

`vercel deploy --temporary` gerou um deployment anônimo, mas a Vercel o protege (`403`,
`X-Vercel-Mitigated: deny`) até ser reivindicado; a validação pública exige um deploy autenticado
(`npx vercel login` + `npx vercel`), ver README.

## Testes executados

- `npm run typecheck`, `npm run lint`, `npm run format:check`: limpos.
- Playwright E2E (`chromium-desktop` + `chromium-mobile`): 144/144 na execução final da branch.
- Regressão visual (`npm run test:visual`): 10/10 com as baselines regeneradas após a comparação.
- Lighthouse (3 execuções por página/perfil, medianas): simulate início 92 / detalhe 90 (mobile)
  e 99/99 (desktop); devtools 95/92 (mobile) e 100/100 (desktop); Accessibility, Best Practices e
  SEO 100 em todos. Detalhes, LCP/CLS/TBT e histórico em `lighthouse/README.md`.
- Ver também a seção "Verificação" de `docs/FIGMA-AUDIT.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
