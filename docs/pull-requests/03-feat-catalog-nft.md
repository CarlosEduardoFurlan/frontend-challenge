# PR #3 — feat/catalog-nft → develop

## Objetivo e escopo

Descoberta de NFTs com backend simulado: contratos tipados de toda a API, banco de dados mock
persistido (MSW), cenários determinísticos, endpoints de controle, catálogo com estado na URL e
página de detalhe. Inclui o painel de cenários na interface e os testes E2E dos grupos 1, 2 e 12.

## Principais decisões técnicas

- **Contratos** em `src/types/api.ts` compartilhados por MSW, Axios e UI. Valores em ETH são
  strings decimais; aritmética via `decimal.js` (`src/lib/money.ts`).
- **URL legível**: `parseSearch`/`stringifySearch` customizados no TanStack Router
  (`category=games&page=2` em vez de JSON). O schema Zod coage os tipos na entrada.
- **Out-of-order e cancelamento**: cada combinação de parâmetros tem sua própria query key;
  o `signal` da query aborta requisições substituídas; `placeholderData: keepPreviousData` mantém a
  página anterior visível enquanto a próxima carrega (sem layout shift) e um badge
  "Atualizando…" indica refetch em segundo plano.
- **Mock DB** em `localStorage` (`nftm.mock.db.v1`), semeado com 24 NFTs, 2 usuários (senhas
  hasheadas com SHA-256 + salt) e cupons; `?mock-reset` restaura a semente.
- **Cenários** (`src/mocks/scenarios`): latência, fora de ordem, erro de rede, 4xx/5xx,
  sessão curta, conflito de cadastro, validação, cupom inválido/expirado, preço alterado,
  esgotado, timeout de pedido, pagamento recusado, carteira recusada/desconectada. Selecionáveis
  por URL, painel na UI, `POST /api/__mock/scenario` ou `window.__mock` (testes).
- **Facetas** de categoria e faixa de preço vêm da API; filtros resetam a página; página fora
  do intervalo redireciona para a última.
- Erros Axios normalizados em `ApiError` por interceptor; 404 no detalhe não é retentado.

## Testes executados

```
npm run typecheck ✔   npm run lint ✔   npm run build ✔
npx playwright test --project=chromium-desktop --project=chromium-mobile
  38 passed (catalog, nft-detail, loading-and-failures, smoke) — desktop + mobile
```

## Requisitos atendidos

- Início: busca, filtros combináveis, ordenação, paginação, estado na URL, refresh/histórico.
- Detalhe: galeria, informações, edição indisponível, limite de quantidade, acesso direto, 404.
- Mocking: handlers, fixtures, persistência, reset, cenários reproduzíveis.
- Estados loading (skeleton shimmer), vazio, erro com retry, atualização em segundo plano.

## Limitações / pendências

- Favoritos, carrinho e compra chegam nas próximas branches (dependem de sessão).
