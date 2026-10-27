# PR #8 — feat/realtime-integration → develop

## Objetivo e escopo

Tempo real com `socket.io-client` sobre um servidor Socket.IO simulado por MSW
(`@mswjs/socket.io-binding`): eventos `nft.updated` e `order.updated` com identidade, recurso e
versão; proteção contra duplicados/antigos; reconciliação com REST na reconexão; isolamento por
sessão; indicador de conexão. Testes E2E dos grupos 9 e 10.

## Principais decisões técnicas

- **Transporte**: o cliente real (`socket.io-client`, somente WebSocket) abre
  `ws://<origem>/socket.io/?EIO=4&transport=websocket`; o MSW intercepta o WebSocket na página e
  o binding codifica/decodifica os pacotes Socket.IO. Nada passa por setters ou cache diretamente:
  o caminho é store mock → bus interno → servidor Socket.IO mock → `socket.io-client` → handlers.
- **Limitações do binding e contornos** (documentados em `ARCHITECTURE.md`):
  - ele não envia pings: o servidor mock envia `2` a cada 25 s para evitar "ping timeout";
  - ele ignora o payload do CONNECT: o token enviado em `auth` é lido do pacote `40{...}` cru para
    vincular a conexão ao usuário (eventos de pedido só vão ao dono);
  - sem rooms/namespaces: o escopo por usuário é feito filtrando conexões.
- **Padrão do link**: o MSW remove `/socket.io/` da URL do cliente antes de casar o padrão e o
  Chrome codifica `*` no host (`ws://%2A/`), então o único padrão que funciona é `'*'`.
  Conexões que não são Socket.IO (ex.: HMR do Vite) recebem passthrough explícito.
- **Import tardio** de `socket.io-client`: o engine.io captura `globalThis.WebSocket` na
  avaliação do módulo; importar após `worker.start()` garante o construtor interceptável e
  tira o cliente do bundle inicial.
- **Guarda de eventos** (`RealtimeGuard`): dedupe por `eventId` (memória limitada) e versão
  monotônica por recurso; eventos com versão ≤ última aplicada são descartados.
- **Aplicação no cache** (`apply-events.ts`): patch de detalhe, listas, destaques, favoritos e
  carrinho; itens no carrinho invalidam a cotação (o checkout detecta `quoteVersion` diferente e
  exige nova confirmação). `order.updated` atualiza o pedido, lista e, se confirmado, carrinho e
  catálogo.
- **Ciclo de vida**: um socket por sessão; login/logout/expiração destroem o socket (listeners
  removidos, guarda descartada) e abrem outro com as novas credenciais. Na reconexão, queries
  ativas de catálogo, carrinho e dados privados são revalidadas via REST.
- **Pedido pendente**: liquidação server-side continua após refresh (`resumePendingOrders`); o
  evento chega pelo novo socket e o polling (3 s) permanece como fallback.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run build ✔
npx playwright test tests/e2e/realtime.spec.ts (desktop + mobile)
  detalhe/catálogo/carrinho ao vivo; checkout detecta preço alterado via socket e exige nova
  confirmação; eventos duplicados/antigos ignorados; pedido pendente confirmado pelo socket após
  queda de conexão; eventos de sessão anterior não chegam ao próximo usuário; reconexão
  reconcilia o catálogo com REST.
```

## Limitações

- O servidor Socket.IO vive na própria página (MSW); abas diferentes não compartilham eventos.
