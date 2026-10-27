# Fluxo de branches e pull requests

`main` é a versão estável; `develop` integra as funcionalidades. Cada branch partiu da `develop`
atualizada após a integração anterior e foi integrada com `git merge --no-ff`, preservando a
topologia (um merge commit por "PR"). Todas as branches estão publicadas no fork.

| #   | Branch                           | Escopo                                                    | Notas do PR                                    |
| --- | -------------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| 1   | `chore/project-setup`            | Toolchain, Router/Query/Axios/MSW, Playwright, CI, Vercel | `docs/pull-requests/01-chore-project-setup.md` |
| 2   | `feat/design-system`             | Tokens, shadcn/ui, layout, card, estados, artes           | `02-feat-design-system.md`                     |
| 3   | `feat/catalog-nft`               | Contratos, mock DB/cenários, catálogo, detalhe, painel    | `03-feat-catalog-nft.md`                       |
| 4   | `feat/authentication`            | Sessão, login/cadastro, guards, favoritos otimistas       | `04-feat-authentication.md`                    |
| 5   | `feat/collector-profile-wallets` | Perfil, avatar, senha, carteiras                          | `05-feat-collector-profile-wallets.md`         |
| 6   | `feat/cart-pricing`              | Carrinho, cupom, cotação, merge do visitante              | `06-feat-cart-pricing.md`                      |
| 7   | `feat/checkout-orders`           | Checkout, idempotência, pedidos, recibo                   | `07-feat-checkout-orders.md`                   |
| 8   | `feat/realtime-integration`      | Socket.IO sobre MSW, guarda de eventos, reconciliação     | `08-feat-realtime-integration.md`              |
| 9   | `test/e2e-visual`                | Regressão visual, acessibilidade, axe-core, CI visual     | `09-test-e2e-visual.md`                        |
| 10  | `perf/accessibility`             | Lighthouse, bundle, pré-render, fontes                    | `10-perf-accessibility.md`                     |
| 11  | `docs/deployment`                | README, ARCHITECTURE, matriz, screenshots, deploy         | `11-docs-deployment.md`                        |

## Por que os PRs não foram abertos no GitHub

O ambiente de execução não tinha o `gh` CLI nem um token do GitHub (o uso da credencial
armazenada pelo Git Credential Manager fora do `git push` foi bloqueado por política). Por isso:

- cada branch foi publicada (`origin/<branch>`) e integrada localmente em `develop` com
  `--no-ff`, o que reproduz o histórico que um PR mesclado produziria;
- o conteúdo de cada PR (objetivo, decisões, testes, requisitos, limitações) está em
  `docs/pull-requests/`;
- o **PR final `develop → main`** pode ser aberto no GitHub com a comparação
  `main...develop` do fork (a `main` ficou intocada para isso).

## Conventional Commits

Mensagens em inglês com os tipos `chore`, `feat(scope)`, `fix(scope)`, `test`, `perf`, `docs`,
`ci`, representando alterações reais. O histórico completo pode ser consultado com
`git log --oneline --graph develop`.
