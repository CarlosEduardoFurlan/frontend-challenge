# PR #12 — fix/figma-fidelity → develop

## Objetivo e escopo

Corrigir a fidelidade visual ao arquivo Figma "Frontend Challenge (Copy)"
(`fwIfA7xCwcap7SbD0YZ5pA`) usando o MCP oficial do Figma: tokens, tipografia, assets originais,
componentes compartilhados e as telas desktop/mobile, preservando toda a funcionalidade, os
cenários MSW e a suíte de testes.

## O que foi inspecionado no Figma

- `whoami`, `create_session`, `get_metadata`, `get_variable_defs` e `get_design_context` do frame
  "Desktop / Início" (`2:2`): 12 variáveis de cor, 25 estilos de texto (Roboto Mono 400/500/700),
  código de referência e 25 assets.
- Screenshots de 7 frames: início, detalhe, carrinho, pagamento, confirmação, carteiras e pagamento
  mobile (`docs/figma-comparison/figma-reference/`).
- Os outros 8 frames (login, cadastro, perfil e as versões mobile de início, detalhe, carrinho,
  login e cadastro) não puderam ser capturados: o plano Starter limita o MCP a 20 chamadas de
  leitura por mês e a cota esgotou. Essas telas seguem o design system verificado, sem comparação
  frame a frame (ver `docs/FIGMA-AUDIT.md`).

## Conteúdo

- **Assets** (`fix(assets)`): quatro artes e os ícones do arquivo convertidos por
  `scripts/figma-assets.py` para `public/assets/` (WebP 320/640/1024 + SVG); artes geradas
  removidas; fixtures mapeados às artes com a repetição da grade do design.
- **Design system** (`style(tokens)`): paleta completa do arquivo, raios, Roboto Mono em três
  pesos, primitivos restilizados (botões, campos, rádios, abas, chips, cards, slider).
- **Componentes compartilhados** (`fix(figma)`): Header Row (nav de 4 itens, busca por ícone,
  carrinho com badge, botão Entrar), Footer de três blocos, cards 258×300, paginação 35 px,
  breadcrumbs, stepper redondo.
- **Início** (`fix(figma)`): hero, sidebar (Filters + Featured NFT Banner), toolbar com abas e
  ordenação, grade 3×3, promos, Diário da Cunhagem; filtro "Rede" implementado de ponta a ponta;
  pré-render e preload de LCP atualizados.
- **Detalhe, carrinho, pagamento, confirmação** (`fix(figma)`): layouts reproduzidos das
  referências, inclusive o fluxo de pagamento mobile (cards de carteira, opções de rede com
  medalhão, botão pill).
- **Conta, carteiras, auth, favoritos** (`fix(figma)`): sidebar "Meu perfil", blocos de carteira,
  perfil no mesmo shell, auth com o design system.
- **Testes** (`test(e2e)`, `test(visual)`): busca atrás do ícone do header, banner de destaque,
  galeria com a mesma arte; baselines visuais regeneradas após a comparação.
- **Docs**: `docs/FIGMA-AUDIT.md` completo, comparações lado a lado em
  `docs/figma-comparison/comparisons/`, README/ARCHITECTURE/matriz atualizados.

## Divergências assumidas (funcionalidade exigida pelo desafio)

"Adicionar ao carrinho" ao lado de "COMPRAR"; coleção e disponibilidade nos cards; favorito ao
passar o mouse; contagem de resultados; filtro "Disponibilidade"; campos de checkout reais
(nome, e-mail, CPF) no lugar dos campos fictícios do design; ilustração "THANK YOU" substituída
por ícone (asset não exportado pela cota).

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run format:check ✔  npm run build ✔
npm run test:e2e   144/144 (chromium-desktop + chromium-mobile, build de produção)
npm run test:a11y  22/22
npm run test:visual 10/10 (baselines regeneradas após a comparação com o Figma)
scripts/dev/login-stress.mjs  30 logins / 8 contextos: 0 falhas
auth + profile-wallets ×3     90/90
scripts/dev/overflow.mjs      sem overflow horizontal em 390 px
```

Lighthouse: ver `lighthouse/README.md` (3 execuções por página/perfil, medianas).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
