# PR #9 — test/e2e-visual → develop

## Objetivo e escopo

Completar a cobertura Playwright: regressão visual de início, detalhe, carrinho e pagamento
(desktop 1440 e mobile 390) com baselines versionadas, testes de acessibilidade (grupo 11:
teclado, foco em diálogos, formulários, live regions) e varredura automatizada com axe-core nas
telas principais. Inclui as correções de acessibilidade encontradas pela varredura e o job de CI
para os testes visuais.

## Principais decisões técnicas

- **Baselines por plataforma**: `tests/visual/__snapshots__/<projeto>/<plataforma>/`. As
  baselines versionadas foram geradas em Windows/Chromium; o CI (Linux) renderiza as mesmas telas,
  guarda as baselines Linux como artefato e falha apenas em erro de renderização. A comparação
  pixel a pixel contra as baselines versionadas roda localmente (`npm run test:visual`).
  Motivo: rasterização de fontes difere entre sistemas; sem Docker no ambiente de geração não há
  como produzir baselines Linux idênticas às do CI.
- **Dados estáveis**: seed determinística, fontes e artes locais, animações desabilitadas,
  skeletons aguardados, toasts fechados, rodapé com ano e botão do painel de mocks mascarados.
  `maxDiffPixelRatio: 0.002` tolera ruído de antialiasing sem esconder deslocamentos de layout.
- **axe-core** (`@axe-core/playwright`, tags WCAG 2.x A/AA): falha em violações `serious` ou
  `critical`. Violações encontradas e corrigidas: nome acessível do logo divergente do texto
  visível; contraste dos rótulos "em breve" do rodapé; `<dl>` da cotação contendo um separador;
  input de arquivo do avatar sem label.
- Testes de teclado sem `skip`: o teste do drawer de filtros reduz o viewport em vez de pular no
  projeto desktop.

## Testes executados

```
npx playwright test  (chromium-desktop + chromium-mobile + visual + visual-mobile)
  154 passed (2.9m)  — 144 E2E + 10 visuais
npm run test:visual (2ª execução, estabilidade): 10 passed
```

## Cobertura dos 12 grupos do README

| Grupo                                               | Spec                                                 |
| --------------------------------------------------- | ---------------------------------------------------- |
| 1 Busca/filtros/ordenação/paginação/histórico       | `catalog.spec.ts`                                    |
| 2 Detalhe, acesso direto, inexistente               | `nft-detail.spec.ts`                                 |
| 3 Cadastro, login, expiração, logout, troca         | `auth.spec.ts`                                       |
| 4 Favoritos com falha e rollback                    | `favorites.spec.ts`                                  |
| 5 Carrinho, cupom, quantidades, persistência        | `cart.spec.ts`                                       |
| 6 Compra completa até recibo                        | `checkout.spec.ts`                                   |
| 7 Pagamento recusado, clique repetido, timeout      | `checkout.spec.ts`                                   |
| 8 Perfil, avatar, senha, carteiras                  | `profile-wallets.spec.ts`                            |
| 9 Preço/disponibilidade via Socket.IO no checkout   | `realtime.spec.ts`                                   |
| 10 Eventos duplicados/antigos, desconexão, retomada | `realtime.spec.ts`, `checkout.spec.ts`               |
| 11 Teclado, foco, formulários                       | `accessibility.spec.ts`                              |
| 12 Skeletons, falhas, recuperação                   | `loading-and-failures.spec.ts`, `nft-detail.spec.ts` |

## Limitações

- Regressão visual contra baseline versionada apenas em Windows/Chromium (ver acima).
