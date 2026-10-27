# Auditoria de fidelidade ao Figma

Arquivo de referência: `https://www.figma.com/design/fwIfA7xCwcap7SbD0YZ5pA/Frontend-Challenge--Copy-`
Branch: `fix/figma-fidelity` (a partir de `develop`).

## Estado do acesso ao Figma (bloqueio registrado)

Verificações feitas no ambiente de execução em 2026-10-27:

| Via                                                        | Resultado                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| Ferramentas MCP do Figma na sessão                         | nenhuma disponível (`ToolSearch figma` sem resultados)                 |
| Servidor MCP do Figma Desktop (`127.0.0.1:3845`)           | sem resposta; nenhum processo do Figma em execução                     |
| Configuração MCP (`.mcp.json`, `~/.claude.json`, settings) | nenhuma entrada de Figma                                               |
| API REST (`/v1/files/fwIfA7x…`)                            | 403 (exige token pessoal)                                              |
| Visualizador web em Chromium headless                      | 403 do CloudFront (bloqueio de automação); não contornado por política |

Consequência: **nenhum frame foi inspecionado nesta etapa**. Conforme a instrução "não invente o
layout", as únicas alterações visuais aplicadas são as que você confirmou explicitamente (marca
KURIO, Roboto Mono e os seis tokens listados). Composição, dimensões, espaçamentos, pesos
tipográficos, assets e demais cores permanecem **não verificados**.

Para destravar, uma das opções:

1. **Token pessoal do Figma** (Figma → Settings → Security → Personal access tokens, escopo de
   leitura de arquivos) exportado como `FIGMA_TOKEN`. O script `scripts/figma-export.mjs` baixa
   os 15 frames em PNG 2x, as árvores de nós com estilos e os image fills para
   `docs/figma-reference/`.
2. **Figma Desktop com Dev Mode MCP** ligado (Preferences → Enable Dev Mode MCP Server) e o
   servidor registrado no Claude Code (`claude mcp add figma --transport http http://127.0.0.1:3845/mcp`).
3. **Exportação manual**: PNG 2x de cada frame (IDs abaixo) e os assets (logo, artes, banners,
   ícones) em `docs/figma-reference/frames/` e `docs/figma-reference/images/`.

## Frames de referência e mapeamento atual

### Desktop — 1440 px

| Tela                   | Node ID   | Rota / componentes atuais                                                                                                   | Screenshot "antes"                                    |
| ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Início                 | `2:2`     | `routes/index.tsx` → `HomeHero`, `FeaturedSection`, `CatalogSection`, `CatalogFilters`, `NftCard`, `AppHeader`, `AppFooter` | `docs/figma-comparison/before/home--desktop-1440.png` |
| Detalhes do NFT        | `10:244`  | `routes/nft/$nftId.tsx` → `NftDetail`, `NftGallery`, `EditionSelector`, `AddToCartActions`, `RelatedNfts`                   | `nft-nft-001--desktop-1440.png`                       |
| Carrinho de NFTs       | `11:1278` | `features/cart/components/CartPage`, `CartItemRow`, `CouponForm`, `QuoteSummary`                                            | `cart--desktop-1440.png`                              |
| Pagamento              | `11:2862` | `features/checkout/components/CheckoutPage`, `WalletSelector`, `QuoteLines`                                                 | `checkout--desktop-1440.png`                          |
| Confirmação de pedido  | `11:4385` | `features/orders/components/OrderStatusPage` (`OrderReceipt`)                                                               | (requer pedido; capturar na fase de comparação)       |
| Login                  | `9:115`   | `routes/login.tsx` → `AuthLayout`, `LoginForm`                                                                              | `login--desktop-1440.png`                             |
| Cadastro               | `9:1022`  | `routes/register.tsx` → `AuthLayout`, `RegisterForm`                                                                        | `register--desktop-1440.png`                          |
| Perfil do colecionador | `9:1238`  | `routes/account.tsx` + `account/profile.tsx` → `ProfileForm`, `PasswordForm`                                                | `account-profile--desktop-1440.png`                   |
| Carteiras              | `9:1670`  | `account/wallets.tsx` → `WalletForm`                                                                                        | `account-wallets--desktop-1440.png`                   |

### Mobile — 414 px

| Tela            | Node ID   | Componentes atuais (mobile)                                                            | Screenshot "antes"            |
| --------------- | --------- | -------------------------------------------------------------------------------------- | ----------------------------- |
| Início          | `14:5226` | `AppHeader` (hambúrguer + `MobileNav`), `HomeHero`, grid 2 colunas, filtros em `Sheet` | `home--mobile-414.png`        |
| Detalhes do NFT | `15:5536` | `NftDetail` em coluna única, miniaturas horizontais                                    | `nft-nft-001--mobile-414.png` |
| Carrinho        | `16:360`  | `CartPage` em coluna única                                                             | `cart--mobile-414.png`        |
| Pagamento       | `16:748`  | `CheckoutPage` em coluna única                                                         | `checkout--mobile-414.png`    |
| Login           | `16:1022` | `AuthLayout` centralizado                                                              | `login--mobile-414.png`       |
| Cadastro        | `16:1228` | `AuthLayout` centralizado                                                              | `register--mobile-414.png`    |

Telas sem frame mobile (perfil, carteiras, confirmação) serão adaptadas após a inspeção dos
frames mobile existentes.

## Divergências conhecidas (informadas por você) e status

| Item                         | Antes                                                 | Ação nesta etapa                                                                                                                                                     | Status                                                                                       |
| ---------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Marca                        | "NFT Market" + ícone "N" próprio                      | Wordmark **KURIO** em header, rodapé, auth, recibo, título e meta                                                                                                    | ✅ texto; **logo/ícone original pendente** (asset não disponível)                            |
| Tipografia                   | Silkscreen (display) + Inter (texto)                  | **Roboto Mono** local (400/500/600/700) em texto e display                                                                                                           | ⚠️ família aplicada; tamanhos, pesos e line-heights por tela **pendentes**                   |
| Paleta                       | `#120b08`, `#1b120d`, `#e58a3a`, `#f5ede0`, `#b3a292` | `--background #140d0a`, `--card #241612`, `--primary #d28a4c`, `--foreground #f5f1eb`, `--muted-foreground #cfb28c`, novo `--text-accent #e89b55` (preços/destaques) | ✅ seis tokens confirmados; bordas, superfícies secundárias, estados e sombras **pendentes** |
| Artes dos NFTs               | geradas por `scripts/generate-artwork.py`             | manter até extrair os image fills do Figma                                                                                                                           | ⏳ pendente                                                                                  |
| Hero, banners, ícones        | composição derivada do thumbnail antigo               | —                                                                                                                                                                    | ⏳ pendente                                                                                  |
| Composição de todas as telas | —                                                     | —                                                                                                                                                                    | ⏳ pendente (exige frames)                                                                   |

## Checklist por tela (preencher na fase de comparação)

Para cada frame: componentes correspondentes · divergências de composição · assets a substituir ·
tipografia e cores incorretas · diferenças de largura/altura/espaçamento · elementos ausentes ou
adicionais · responsividade (390/414/768/1440) · prioridade · status e evidência
(`docs/figma-comparison/after/*.png` lado a lado com `docs/figma-reference/frames/*.png`).

| Frame                     | Prioridade | Status                     |
| ------------------------- | ---------- | -------------------------- |
| 2:2 Início desktop        | 1          | bloqueado — sem referência |
| 14:5226 Início mobile     | 1          | bloqueado — sem referência |
| 10:244 Detalhe            | 1          | bloqueado — sem referência |
| 15:5536 Detalhe mobile    | 1          | bloqueado — sem referência |
| 11:1278 Carrinho          | 2          | bloqueado — sem referência |
| 16:360 Carrinho mobile    | 2          | bloqueado — sem referência |
| 11:2862 Pagamento         | 2          | bloqueado — sem referência |
| 16:748 Pagamento mobile   | 2          | bloqueado — sem referência |
| 11:4385 Confirmação       | 2          | bloqueado — sem referência |
| 9:115 / 16:1022 Login     | 3          | bloqueado — sem referência |
| 9:1022 / 16:1228 Cadastro | 3          | bloqueado — sem referência |
| 9:1238 Perfil             | 3          | bloqueado — sem referência |
| 9:1670 Carteiras          | 3          | bloqueado — sem referência |

## Baselines visuais

As baselines em `tests/visual/__snapshots__` representam o design anterior. Elas **não foram
regeneradas** nesta etapa, porque a regra é atualizá-las apenas após verificar as telas contra a
referência real. Com a marca/fonte/tokens aplicados, `npm run test:visual` falha de forma
esperada até a regeneração pós-verificação; a suíte funcional (`npm run test:e2e`) continua
passando.
