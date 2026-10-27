# Auditoria de fidelidade ao Figma

Arquivo de referência: `https://www.figma.com/design/fwIfA7xCwcap7SbD0YZ5pA/Frontend-Challenge--Copy-`
Branch: `fix/figma-fidelity` (a partir de `develop`). Data da inspeção: 2026-10-27.

## 1. Acesso ao Figma (MCP remoto)

| Verificação                                 | Resultado                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `whoami`                                    | Carlos Furlan, plano **Starter**, seat Full                                 |
| `create_session` (`fwIfA7xCwcap7SbD0YZ5pA`) | sessão criada                                                               |
| `get_metadata` do frame `2:2`               | árvore completa do frame "Desktop / Início" (1440 × 3668)                   |
| `get_variable_defs` do frame `2:2`          | 12 variáveis de cor + 25 estilos de texto (todos Roboto Mono 400/500/700)   |
| `get_design_context` do frame `2:2`         | código de referência completo + 25 assets (4 artes PNG 1254 px, 21 SVGs)    |
| `get_screenshot` dos 15 frames              | **7 obtidos**; os outros 8 retornaram "tool call limit on the Starter plan" |

O plano Starter do Figma limita o MCP a **20 chamadas de leitura por mês** (documentação oficial:
`developers.figma.com/docs/figma-mcp-server/rate-limits-access`). A cota esgotou durante a
inspeção; o `whoami` continua respondendo, logo a sessão **não perdeu a autenticação**. Para
inspecionar os frames restantes basta repetir o fluxo quando a cota renovar (ou com um seat em
plano Professional). Nenhuma alternativa (REST, navegador) foi usada.

Frames capturados em `docs/figma-comparison/figma-reference/`:

| Arquivo                          | Frame                           | Node ID   |
| -------------------------------- | ------------------------------- | --------- |
| `desktop-home.png`               | Desktop / Início                | `2:2`     |
| `desktop-nft-detail.png`         | Desktop / Detalhes do NFT       | `10:244`  |
| `desktop-cart.png`               | Desktop / Carrinho de NFTs      | `11:1278` |
| `desktop-checkout.png`           | Desktop / Pagamento             | `11:2862` |
| `desktop-order-confirmation.png` | Desktop / Confirmação de pedido | `11:4385` |
| `desktop-wallets.png`            | Desktop / Carteiras             | `9:1670`  |
| `mobile-checkout.png`            | Mobile / Pagamento (414 × 896)  | `16:748`  |

Frames **não capturados** (cota): Login `9:115`, Cadastro `9:1022`, Perfil do colecionador
`9:1238`, Início mobile `14:5226`, Detalhes mobile `15:5536`, Carrinho mobile `16:360`, Login
mobile `16:1022`, Cadastro mobile `16:1228`.

## 2. Design system verificado

### Cores (variáveis do arquivo → tokens em `src/app/styles/globals.css`)

| Variável Figma              | Valor     | Token CSS                                  | Uso                                                   |
| --------------------------- | --------- | ------------------------------------------ | ----------------------------------------------------- |
| `color/ink`                 | `#140d0a` | `--background`                             | fundo da página, texto sobre primary                  |
| `color/surface-card`        | `#241612` | `--card`, `--popover`                      | cards, filtros, rodapé, linhas do carrinho            |
| `color/surface-dark`        | `#38220f` | `--surface-dark`, `--secondary`, `--muted` | faixa do rodapé, campo da newsletter, chips, skeleton |
| `color/border`              | `#3f2319` | `--border`                                 | paginação, hairlines de tabela                        |
| `color/border-soft`         | `#55321f` | `--border-soft`, `--input`                 | campos de formulário, chip de carteiras               |
| `color/primary`             | `#d28a4c` | `--primary`, `--ring`                      | botões, sublinhado ativo, divisores, slider           |
| `color/secondary`           | `#b39463` | `--brass`                                  | placeholders, preço anterior, legendas discretas      |
| `color/text-accent`         | `#e89b55` | `--text-accent`, `--primary-hover`         | preços, nav ativa, títulos de seção, links            |
| `color/text-secondary`      | `#cfb28c` | `--muted-foreground`                       | parágrafos de apoio                                   |
| `color/foreground`          | `#f5f1eb` | `--foreground`                             | texto padrão                                          |
| `color/text-primary`        | `#f7f3ec` | `--text-primary`                           | títulos do blog                                       |
| `color/background-elevated` | `#fbfbfb` | `--background-elevated`                    | máscaras/fills claros                                 |

Os tokens de estado (`--success`, `--warning`, `--destructive`) não existem no arquivo e foram
mantidos do sistema anterior para feedback de erros/estoque.

### Tipografia

Família única: **Roboto Mono** (variável `font/family`), pesos 400, 500 e 700. O peso 600 foi
removido do `@font-face` e do `public/fonts`. Escala usada (estilos do arquivo):

| Estilo Figma              | Tamanho / altura    | Onde                                             |
| ------------------------- | ------------------- | ------------------------------------------------ |
| Display/43 Bold           | 43 / 70             | título do hero                                   |
| Heading/24 Bold           | 24 / 32             | "NFT EM DESTAQUE"                                |
| Blog title (28 Bold)      | 28                  | "Diário da Cunhagem"                             |
| Body Large/18 Bold · lh16 | 18 / 16             | títulos dos filtros e do rodapé, preço dos cards |
| Body Large/17 Bold        | 17 / 16             | títulos dos medalhões do rodapé                  |
| Body Large/16 Bold/Reg    | 16 / 16–20          | nav, nome do card, botões, "Aplicar"             |
| Body/15 Regular · lh40    | 15 / 40             | linhas dos filtros                               |
| Body/15 Medium            | 15 / 16             | abas da toolbar                                  |
| Body/14 Medium · lh16     | 14, tracking 1.4 px | "Bem-vindo à Kurio", wordmark KURIO              |
| Body/14 Regular · lh24    | 14 / 24             | parágrafos                                       |
| Body/14 Regular · lh30    | 14 / 30             | links do rodapé                                  |
| Caption/13 Regular · lh22 | 13 / 22             | legenda da newsletter, "ID do token"             |
| Caption/12 Bold / Medium  | 12 / 14–16          | meta e CTA dos cards do blog                     |
| Tiny/10 Medium            | 10                  | contador do carrinho                             |
| Tiny/9 Bold               | 9, tracking 0.1 px  | chip "METAMASK • WALLETCONNECT • COINBASE"       |

### Assets originais (`download` via URLs do `get_design_context`)

Convertidos por `scripts/figma-assets.py` para `public/assets/` (nenhuma URL temporária do Figma
permanece no código):

- `nfts/ape-emerald`, `ape-sage`, `ape-ivory`, `ape-golden` (`-sm` 320 px, 640 px, `-lg` 1024 px,
  WebP q82) — as quatro ilustrações que o arquivo reutiliza em todas as telas.
- `icons/search.svg`, `cart.svg`, `login.svg` (Iconly Logout), `arrow-right.svg`,
  `arrow-right-2.svg`, `arrow-down.svg`, `hero-dots.svg`, `social-{facebook,instagram,twitter,linkedin,youtube}.svg`.
- `banners/promo-rings.svg` (máscara decorativa dos cards promocionais).

Não exportados (cota do MCP): ilustração "THANK YOU" da confirmação de pedido (substituída por um
ícone de linha, documentado no componente), ícones do menu lateral "Meu perfil" (usados os
equivalentes do lucide-react).

## 3. Componentes compartilhados

| Componente                            | Fonte no Figma                                   | Status                                                                                                                 |
| ------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `Logo`                                | "Logo" (14 Bold, tracking 1.4)                   | ✅                                                                                                                     |
| `AppHeader` (desktop)                 | "Header Row" + "Header With Divider"             | ✅ nav de 4 itens, busca por ícone, carrinho com badge, botão "Entrar" com ícone; divisor apenas fora do fluxo Mercado |
| `AppHeader` (mobile)                  | sem frame capturado                              | ⚠️ adaptação responsiva (logo, busca, carrinho, menu)                                                                  |
| `MobileNav`                           | sem frame capturado                              | ⚠️ drawer com os mesmos itens                                                                                          |
| `AppFooter`                           | "Footer" (70491:1286)                            | ✅ três blocos, medalhões W/C/D, newsletter, faixa de contato, colunas, redes, chip de carteiras                       |
| `Button`                              | botões 40 px, raio 6, Bold 16, ink sobre primary | ✅ + variante outline ("Favoritar") e pill (mobile)                                                                    |
| `Input` / `Textarea` / `NativeSelect` | campos do checkout/carteiras                     | ✅ 40 px, borda border-soft, placeholder brass                                                                         |
| `Checkbox` / `RadioGroup`             | rádios de "Carteira e rede"                      | ✅                                                                                                                     |
| `Tabs`                                | abas do detalhe                                  | ✅                                                                                                                     |
| `Badge`                               | chips de edição                                  | ✅                                                                                                                     |
| `NftCard`                             | cards 258 × 300 + nome 16 + preço 18 accent      | ✅ (coleção e disponibilidade adicionadas em 12 px)                                                                    |
| `Pagination`                          | "Pagination" 35 px, raio 4                       | ✅                                                                                                                     |
| `CatalogFilters` + `Slider`           | "Filters" (70485:381)                            | ✅ listas Coleções/Rede, slider de preço, "Aplicar"                                                                    |
| `FeaturedBanner`                      | "Featured NFT Banner" (70410:3791)               | ✅                                                                                                                     |
| `Breadcrumbs`                         | "Início / Mercado / …"                           | ✅                                                                                                                     |
| `QuantityStepper`                     | botões redondos − / +                            | ✅                                                                                                                     |
| Loaders / estados                     | sem referência no arquivo                        | ⚠️ skeletons espelham o layout final                                                                                   |

## 4. Telas

Comparações lado a lado em `docs/figma-comparison/comparisons/` (Figma à esquerda, implementação
à direita); screenshots anteriores preservados em `docs/figma-comparison/before/` e os novos em
`docs/figma-comparison/after/` (390, 414, 768 e 1440 px).

| Frame                     | Status | Observações                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2:2 Início desktop        | ✅     | Hero, sidebar (filtros + destaque), toolbar com abas e ordenação, grade 3 × 3, paginação, promos, blog e rodapé reproduzidos com as medidas do design context. Divergências assumidas: contagem de resultados e ícone de favorito (hover) nos cards; "Criadores"/"Aprenda" apontam para as seções promos/blog. |
| 14:5226 Início mobile     | ⚠️     | Sem referência. Adaptação responsiva da versão desktop (grade 2 colunas, filtros em drawer, destaque após a grade). Sem overflow horizontal em 390/414.                                                                                                                                                        |
| 10:244 Detalhes           | ✅     | Breadcrumb, galeria com miniaturas + zoom, título/preço/curtidas, "Sobre este NFT", chips de edição, stepper, COMPRAR/Favoritar, metadados, compartilhar, abas, "Mais desta coleção". Divergências: botão extra "Adicionar ao carrinho" (funcionalidade exigida), chips mostram nome/preço da edição.          |
| 15:5536 Detalhes mobile   | ⚠️     | Sem referência; coluna única.                                                                                                                                                                                                                                                                                  |
| 11:1278 Carrinho          | ✅     | Tabela NFTs/Preço/Edições/Total, linhas 70 px, "Resumo da carteira", código promocional, totais, "Conectar e finalizar", "Continuar explorando", "Colecionadores também viram".                                                                                                                                |
| 16:360 Carrinho mobile    | ⚠️     | Sem referência; linhas em duas faixas.                                                                                                                                                                                                                                                                         |
| 11:2862 Pagamento         | ✅     | Breadcrumb, "Perfil do colecionador" em duas colunas (campos existentes: nome, e-mail, CPF), "Seus NFTs", totais, "Carteira e rede", "Confirmar compra". Campos exclusivos do design (ENS, código de indicação, observação) não foram inventados.                                                              |
| 16:748 Pagamento mobile   | ✅     | "Carteira conectada" com cards e rádio, opções de rede com medalhão e rádio à direita, total e botão pill com gradiente.                                                                                                                                                                                       |
| 11:4385 Confirmação       | ✅     | Painel 578 px com faixa primary inferior, status, tira de metadados em 4 colunas, "Detalhes da transação", totais, mensagem e ação. Ilustração "THANK YOU" substituída por ícone (asset não exportado).                                                                                                        |
| 9:1670 Carteiras          | ✅     | Sidebar "Meu perfil" com itens e "Sair", título + descrição, formulário em duas colunas, "Carteira secundária".                                                                                                                                                                                                |
| 9:1238 Perfil             | ⚠️     | Sem referência; usa o mesmo shell da tela de Carteiras.                                                                                                                                                                                                                                                        |
| 9:115 / 16:1022 Login     | ⚠️     | Sem referência; header com divisor (conforme descrição do componente "Marketplace Page") e formulário com o design system.                                                                                                                                                                                     |
| 9:1022 / 16:1228 Cadastro | ⚠️     | Idem.                                                                                                                                                                                                                                                                                                          |

## 5. Dados simulados

Os fixtures mantêm ids, preços, categorias e nomes (dependências dos testes); apenas as imagens
passaram a usar as quatro artes do Figma com o mesmo padrão de repetição da grade do design
(`artworkFor` em `src/mocks/fixtures/nfts.ts`; `index.html` replica o mapeamento para o preload
do LCP). As três imagens da galeria usam a mesma arte, como no frame de detalhe. O filtro "Rede"
do design foi implementado de ponta a ponta (`network` na URL, no handler MSW e nas facetas).

## 6. Verificação

- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`: ok.
- `npm run test:e2e` (chromium-desktop + chromium-mobile): ver seção "Testes" no README.
- `npm run test:a11y`: ok (axe, sem violações sérias/críticas nas 8 telas).
- Overflow horizontal: `scripts/dev/overflow.mjs` em 390 px — nenhum elemento fora da viewport em
  `/`, `/nft/nft-001`, `/cart`, `/checkout`, `/account/wallets`, `/account/profile`.
- Baselines visuais regeneradas **após** a comparação com as referências (seção 4).
- Lighthouse: ver `lighthouse/README.md`.
