# PR #6 — feat/cart-pricing → develop

## Objetivo e escopo

Carrinho e cotação: inclusão (detalhe → "Adicionar ao carrinho" / "Comprar agora"), alteração de
quantidade, remoção, cupom (aplicar/remover, inválido/expirado/subtotal mínimo), resumo com
subtotal, desconto, taxa de rede e total vindos da API, persistência do visitante e merge no
login. Testes E2E do grupo 5.

## Principais decisões técnicas

- **Identidade do carrinho**: `user:<id>` ou `guest:<id>` (header `X-Guest-Cart-Id`, id em
  `localStorage`). No login, `POST /cart/merge` soma os itens do visitante ao carrinho da conta
  (quantidades limitadas pelo estoque); no logout o id de visitante é rotacionado.
- **Projeção viva**: `GET /cart` sempre reflete preço e disponibilidade atuais do catálogo e
  guarda o preço no momento da inclusão (`addedPriceEth`) para sinalizar "Preço atualizado".
- **Cotação** (`POST /cart/quote`): linhas com status `ok | price_changed | quantity_reduced |
sold_out`, cupom revalidado, taxa por rede e total; `quoteVersion` é um hash das entradas,
  usado pelo checkout para detectar cotação desatualizada. Modelada como query dependente da
  versão do carrinho (`['cart', owner, 'quote', ..., cartVersion]`).
- **Limites**: a API rejeita (409 `availability_conflict`) quantidades acima de
  `min(disponível, máximo por pedido)`; o stepper usa o mesmo limite.
- **Cupom** fica salvo no carrinho (sobrevive ao refresh) e é validado a cada cotação; cenários
  `coupon-invalid` / `coupon-expired`.
- **Logout otimista**: limpa sessão, cache privado e id de visitante antes da chamada ao servidor
  (token enviado explicitamente), eliminando vazamento mesmo com rede lenta.
- Valores em ETH: strings decimais ponta a ponta; soma/multiplicação via `decimal.js`.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run build ✔
npx playwright test (desktop + mobile): 88 passed
  cart.spec.ts: inclusão com quantidade, totais, refresh, limites de estoque, remoção,
  cupons (inválido/expirado/mínimo/válido/remoção/persistência), cenários de cupom,
  merge visitante → usuário e isolamento entre contas, "Comprar agora" sem sessão,
  reflexo de preço alterado e edição esgotada.
```

## Requisitos atendidos

- Carrinho completo com persistência e transição visitante → autenticado.
- Subtotal, desconto, taxa de rede e total coerentes com a API; limites de estoque.

## Limitações

- A atualização em tempo real do carrinho (evento `nft.updated`) chega na branch de realtime;
  nesta branch as mudanças são refletidas ao recarregar/refetch.
