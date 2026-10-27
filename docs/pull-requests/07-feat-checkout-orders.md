# PR #7 — feat/checkout-orders → develop

## Objetivo e escopo

Pagamento e pedidos: formulário do colecionador, seleção de carteira cadastrada e rede,
simulação de conexão (conectada/recusada/desconectada), revisão com cotação revalidada,
criação idempotente do pedido, estados `pending | confirmed | rejected`, recibo imutável,
recuperação após refresh/timeout e lista de pedidos. Testes E2E dos grupos 6, 7 e parte do 10.

## Principais decisões técnicas

- **Idempotência real**: `POST /orders` exige `Idempotency-Key`. Mesma chave + mesmo payload
  (hash SHA-256 de cotação/carteira/rede/colecionador) devolve o mesmo pedido (200); mesma chave
  com payload diferente responde 409 `idempotency_conflict`. A chave é gerada uma vez por
  tentativa e guardada no rascunho (`sessionStorage`), reutilizada em retries.
- **Timeout após criação** (cenário `order-timeout`): o pedido é criado antes do atraso de
  resposta; o Axios estoura em 15 s, o cliente reenvia com a mesma chave e recupera o pedido.
- **Revalidação da cotação**: o cliente refaz `POST /cart/quote` no envio e compara
  `quoteVersion` com a versão revisada; o servidor refaz a cotação e responde 409
  `price_changed` / `quote_expired` / `availability_conflict` se algo mudou. Qualquer diferença
  exibe "Os valores mudaram" e exige o clique "Revisei os novos valores".
- **Liquidação simulada**: timer server-side (`orderSettleDelayMs`), retomado no boot
  (`resumePendingOrders`) para sobreviver a refresh; só na confirmação o estoque é baixado e as
  quantidades compradas saem do carrinho. Recusa preserva os itens.
- **Recibo**: snapshot dos itens/valores guardado no pedido; alterações posteriores do catálogo
  não o afetam (testado).
- **Conexão de carteira**: `POST /wallets/connect` simulada; cenários `wallet-rejected` e
  `wallet-disconnect` (desconecta após 4 s, desabilitando a confirmação).
- **Sessão expirada no checkout**: rascunho (dados, carteira, rede, termos, chave) é restaurado
  após o novo login via `redirect=/checkout`.
- Página do pedido faz polling (3 s) enquanto pendente; a branch de realtime adiciona o evento
  `order.updated` mantendo o polling como fallback.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run build ✔
npx playwright test tests/e2e/checkout.spec.ts (desktop + mobile): 22 passed
  compra completa até recibo confirmado; pagamento recusado; cliques repetidos (1 pedido);
  timeout com recuperação pela chave; preço alterado exige nova confirmação; edição esgotada
  bloqueia; carteira recusada/desconectada; expiração de sessão com retomada do rascunho;
  pedido pendente após refresh e liquidação posterior; usuário sem carteiras; pedido de outro
  usuário não é encontrado.
```

## Limitações

- O explorer de transações é um link simulado (`explorer.example`), conforme o enunciado.
