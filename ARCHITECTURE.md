# Arquitetura

## 1. Organização e responsabilidades

```
src/
├── app/          providers (QueryClient), router (árvore gerada, (de)serialização da URL), estilos/tokens
├── components/   ui (shadcn/ui adaptados aos tokens) e shared (header, footer, card, estados, stepper…)
├── features/     catalog, nft, auth, favorites, cart, checkout, orders, profile, wallets, realtime, mock-panel
│                 cada feature: queries/hooks (TanStack Query), componentes e schemas
├── services/     api (instância Axios, interceptors, clientes REST tipados) e realtime (socket.io-client)
├── mocks/        MSW: handlers, fixtures, cenários, persistência (localStorage), lib (stores), realtime (servidor Socket.IO)
├── lib/          money (decimal.js), money-format, format, query-keys, env, app-ready, utils
├── routes/       rotas file-based do TanStack Router (componentes lazy por rota)
└── types/        contratos REST e de eventos compartilhados por mocks, services e UI
tests/            e2e (12 grupos), visual (baselines), fixtures (app fixture)
scripts/          lighthouse.mjs, screenshot.mjs, figma-assets.py, figma-compare.py, dev/ (análise)
lighthouse/       README com resultados, relatórios versionados
```

Regras aplicadas: componentes não contêm regra de negócio (cálculos ficam na API simulada e nos
hooks), contratos tipados centralizados em `src/types/api.ts`, Axios em instância única, queries e
mutations por feature com chaves de `src/lib/query-keys.ts`, sem estado global redundante com o
cache do Query (sessão = token em store + perfil no cache; carrinho = cache por dono), Socket.IO
encapsulado em `features/realtime`.

## 2. Contratos REST (`/api`)

Erros usam o envelope `{ code, message, details? }` com `details` por campo (422/409).
Códigos: `validation_error`, `unauthorized`, `session_expired`, `forbidden`, `not_found`,
`conflict`, `email_taken`, `invalid_credentials`, `coupon_invalid`, `coupon_expired`,
`availability_conflict`, `price_changed`, `quote_expired`, `idempotency_conflict`,
`wallet_rejected`, `internal_error`, `service_unavailable`.

| Recurso   | Método e rota                                      | Corpo / resposta                                                                                                                                                               |
| --------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sessão    | `POST /auth/register`                              | `{name,email,password}` → `Session {token,user,expiresAt}` · 409 `email_taken` · 422                                                                                           |
|           | `POST /auth/login`                                 | `{email,password}` → `Session` · 401 `invalid_credentials`                                                                                                                     |
|           | `GET /auth/session`                                | Bearer → `Session` · 401 `session_expired`/`unauthorized`                                                                                                                      |
|           | `POST /auth/logout`                                | 204                                                                                                                                                                            |
| NFTs      | `GET /nfts`                                        | `q, category[], minPrice, maxPrice, available, sort, page, pageSize, featured, ids[]` → `NftListResponse {items,page,pageSize,total,totalPages,facets}`                        |
|           | `GET /nfts/:id`                                    | `Nft` (edições com `priceEth`, `available`, `maxPerOrder`, `version`) · 404                                                                                                    |
| Favoritos | `GET /favorites` · `POST/DELETE /favorites/:nftId` | `{nftIds, items}` (autenticado)                                                                                                                                                |
| Carrinho  | `GET /cart`                                        | `Cart {items[{unitPriceEth, addedPriceEth, available, maxPerOrder, nft.version}], itemCount, subtotalEth, couponCode, version}`                                                |
|           | `POST /cart/items`                                 | `{nftId, editionId, quantity}` → `Cart` · 409 `availability_conflict`                                                                                                          |
|           | `PATCH /cart/items/:id` · `DELETE /cart/items/:id` | `{quantity}` → `Cart`                                                                                                                                                          |
|           | `PUT /cart/coupon` · `DELETE /cart/coupon`         | `{code}` → `Cart` · 422 `coupon_invalid`/`coupon_expired`                                                                                                                      |
|           | `POST /cart/merge`                                 | `{guestCartId}` → `Cart` (autenticado; soma itens do visitante)                                                                                                                |
| Cotação   | `POST /cart/quote`                                 | `{network}` → `Quote {quoteId, quoteVersion, lines[status: ok/price_changed/quantity_reduced/sold_out], coupon, subtotalEth, discountEth, networkFeeEth, totalEth, expiresAt}` |
| Pedidos   | `POST /orders` (`Idempotency-Key`)                 | `{quoteId, quoteVersion, walletId, network, collector, acceptedTerms}` → 201/200 `Order` · 409 `price_changed`/`quote_expired`/`availability_conflict`/`idempotency_conflict`  |
|           | `GET /orders` · `GET /orders/:id`                  | `Order {status: pending/confirmed/rejected, version, items, totais, txHash, explorerUrl, rejectionReason}` · 404 se de outro usuário                                           |
| Carteiras | `GET /wallets` · `PUT /wallets/:kind`              | `{primary, secondary}` · `{label,address,network}` → `Wallet` · 422/409                                                                                                        |
|           | `POST /wallets/connect`                            | `{walletId, network}` → `WalletConnection {sessionTtlMs?}` · 403 `wallet_rejected`                                                                                             |
| Perfil    | `GET /profile` · `PATCH /profile`                  | `{name?, username?, bio?, avatarUrl?(data URL)}` → `User` · 409 username · 422                                                                                                 |
|           | `POST /profile/password`                           | `{currentPassword, newPassword}` → 204 · 422                                                                                                                                   |
| Controle  | `/__mock/*`                                        | status, scenario, reset, session/expire, orders/settle, sockets/drop, nfts/:id/{price,availability,replay}                                                                     |

Identidade do carrinho: Bearer (usuário) ou cabeçalho `X-Guest-Cart-Id` (visitante).
Valores em ETH trafegam como strings decimais; quantidades são inteiras.

## 3. Eventos Socket.IO

Transporte: `socket.io-client` (somente WebSocket, `path=/socket.io`, `auth.token`) → MSW
intercepta o WebSocket → `@mswjs/socket.io-binding` codifica/decodifica → servidor mock em
`src/mocks/realtime/server.ts`. Envelope comum:

```ts
{
  eventId: ('evt_000012', type, resourceId, version, emittedAt, payload)
}
```

| Evento          | Escopo              | Payload                                                            |
| --------------- | ------------------- | ------------------------------------------------------------------ |
| `nft.updated`   | broadcast           | `{priceEth, available, editions[{id,priceEth,available}], reason}` |
| `order.updated` | só o dono do pedido | `{status, txHash, explorerUrl, rejectionReason, updatedAt}`        |

Limitações do binding e contornos: ele responde ao handshake mas não envia pings (o servidor
mock envia `2` a cada 25 s), ignora o payload do CONNECT (o token é lido do pacote `40{...}`) e
não tem rooms (escopo por usuário filtrando conexões). O padrão do `ws.link` precisa ser `'*'`:
o MSW remove `/socket.io/` da URL antes de casar e os navegadores codificam `*` no host; conexões
não Socket.IO (HMR) recebem passthrough. O `socket.io-client` é importado após `worker.start()`
porque o engine.io captura `globalThis.WebSocket` na avaliação do módulo. Abas diferentes não
compartilham o servidor (ele vive na página).

## 4. Autenticação e sessão

- Token bearer + id do usuário em `localStorage` (`sessionStore`); o perfil fica em
  `['session']` no cache (`staleTime` 60 s). O store é lido de forma síncrona pelos guards.
- Interceptor de request anexa `Authorization` e `X-Guest-Cart-Id`; o de response transforma 401
  (`session_expired`/`unauthorized`) em evento `expired` e marca a expiração (sessionStorage).
- `SessionWatcher`: limpa cache privado, avisa; em rotas privadas redireciona para
  `/login?redirect=<url>&reason=expired`. O guard `requireAuth` (beforeLoad) usa `reason=expired`
  se a sessão expirou há menos de 5 min. Login volta ao `redirect` (apenas caminhos same-origin).
- Expiração no checkout: o rascunho (dados, carteira, rede, termos, chave de idempotência) vive em
  `sessionStorage` e é restaurado após o novo login.
- Logout otimista: limpa sessão, `['private', userId]` e `['cart']`, rotaciona o id de visitante e
  reabre o socket sem credenciais; o servidor recebe o token explicitamente para revogar.
- Isolamento: chaves privadas sob `['private', userId]`; troca de usuário remove as do anterior;
  `order.updated` só é entregue ao dono e o handler ainda compara o usuário da sessão.

## 5. Carrinho

Dono = `user:<id>` ou `guest:<id>`. O visitante mantém o carrinho após refresh (id em
`localStorage`); no login, `POST /cart/merge` soma os itens (limitados pelo estoque) e a query do
visitante é descartada. Itens guardam `addedPriceEth` e a API projeta sempre o preço/estoque
atual, permitindo sinalizar "Preço atualizado" e "Esgotado". O cupom fica no carrinho e é
revalidado em cada cotação. Limites: `min(disponível, maxPerOrder)` validados no cliente e na API.

## 6. Política de cache e retries (TanStack Query)

| Item               | Política                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Padrão             | `staleTime` 30 s, `gcTime` 5 min, refetch em foco/reconexão                                                                                       |
| Listas do catálogo | chave por conjunto de parâmetros (respostas fora de ordem nunca se misturam), `keepPreviousData`, cancelamento por `signal`                       |
| Detalhe de NFT     | 404 não é retentado                                                                                                                               |
| Sessão             | 60 s; 401 → `null` (não é erro)                                                                                                                   |
| Carrinho / cotação | 15 s / 10 s; a cotação depende da versão do carrinho; mutations gravam a resposta no cache                                                        |
| Pedido             | polling 3 s enquanto pendente (fallback do socket)                                                                                                |
| Retries            | apenas falhas transitórias (rede, 5xx, 429), até 2 tentativas com backoff; mutations sem retry automático, exceto login (1 retry em erro de rede) |
| Otimista           | favoritos: `onMutate` cancela a query e aplica; `onError` restaura o snapshot; `onSettled` revalida                                               |
| Invalidação        | após mutations (cart → quote; perfil → session; pedido confirmado → cart + nfts) e eventos                                                        |

## 7. Reconciliação tempo real ↔ REST

`RealtimeGuard` descarta `eventId` repetidos e versões ≤ última aplicada por recurso.
`apply-events.ts` aplica o evento em todas as entradas do cache que contêm o recurso (detalhe,
listas, destaques, favoritos, carrinho) comparando `version`; se uma busca estiver em voo, a
query é invalidada para que a resposta antiga não vença. Mudanças em itens do carrinho invalidam
a cotação; o checkout compara `quoteVersion` com a versão revisada e bloqueia a confirmação até o
usuário clicar "Revisei os novos valores". Na reconexão, queries ativas de catálogo, carrinho e
dados privados são revalidadas via REST. O servidor também revalida tudo no `POST /orders`.

## 8. Idempotência e estados do pedido

`POST /orders` exige `Idempotency-Key`. Mesma chave + mesmo hash do payload → mesmo pedido (200);
mesma chave + payload diferente → 409. A chave é gerada uma vez por tentativa e reutilizada em
retries; cliques repetidos compartilham a chave. No cenário `order-timeout` o pedido é criado antes
do atraso de resposta, o Axios estoura em 15 s e a nova tentativa recupera o pedido.
Estados: `pending` → `confirmed` | `rejected` (terminais). A liquidação roda em timer server-side
retomado no boot; só na confirmação o estoque é baixado e as quantidades compradas saem do carrinho.
O recibo guarda o snapshot dos itens e valores.

## 9. Decisões de UX

- Estado do catálogo na URL legível (`category=games&page=2`), página reiniciada ao filtrar,
  página fora do intervalo vai para a última; filtros em drawer no mobile.
- Skeletons com shimmer e dimensões do conteúdo; `prefers-reduced-motion` respeitado.
- Toasts (`role=status`) + live regions para mutations e eventos; eventos de estoque causados
  pela própria compra não geram toast.
- Formulários validam em `onTouched` (evita perda de clique por layout shift ao sumir a mensagem).
- Links fora do escopo (central de ajuda, estúdio do criador…) seguem o rodapé do Figma como texto
  não navegável, com `aria-disabled` e dica "fora do escopo", sem fingir navegação.

## 10. Figma, assets e desvios

- Figma lido pelo MCP remoto oficial: variáveis de cor, estilos de texto e o design context do
  frame "Desktop / Início" alimentam `globals.css`, os primitivos de UI e os componentes da home;
  os demais frames capturados (detalhe, carrinho, pagamento, confirmação, carteiras, pagamento
  mobile) foram reproduzidos a partir das referências em `docs/figma-comparison/figma-reference/`.
- A cota do plano Starter (20 chamadas/mês) esgotou após 7 frames; os outros 8 (login, cadastro,
  perfil e as versões mobile de início, detalhe, carrinho, login e cadastro) foram exportados
  manualmente em PNG 2x e comparados com `scripts/figma-compare.py`. Tudo registrado em
  `docs/FIGMA-AUDIT.md`.
- Abaixo de 1024px a aplicação troca o header pelo chrome mobile dos frames: campo de busca +
  filtros e barra inferior na home, botão de voltar + título nas telas de mercado, tela inteira
  nas telas de autenticação (`src/components/shared/MobileChrome.tsx`, `routes/__root.tsx`).
- Assets: as quatro artes e os ícones do arquivo são convertidos por `scripts/figma-assets.py`
  para `public/assets/` (WebP 320/640/1024 e SVG); o mapeamento id → arte em
  `src/mocks/fixtures/nfts.ts` é replicado no preload de LCP do `index.html`.
- Divergências assumidas para manter a funcionalidade exigida: botão "Adicionar ao carrinho" ao
  lado de "COMPRAR", contagem/disponibilidade nos cards, favorito ao passar o mouse, busca atrás do
  ícone do header, filtro "Disponibilidade" e campos de checkout reais em vez dos campos fictícios
  do design (ENS, código de indicação).

## 11. Limitações técnicas

- Backend inteiramente simulado na página: sem compartilhamento entre abas; reset via URL/painel.
- Lighthouse mobile (modo simulate) 84/81 por limitação do modelo com a pré-renderização
  (detalhes em `lighthouse/README.md`); `bf-cache` inelegível pelo WebSocket aberto.
- Baselines visuais apenas Windows/Chromium.
- Pull requests não abertos automaticamente (sem `gh`/token); ver `docs/BRANCHING.md`.
