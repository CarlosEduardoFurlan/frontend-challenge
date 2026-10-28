# NFT Marketplace — Desafio Frontend (Jungle Gaming)

Marketplace de NFTs em React + TypeScript com descoberta, compra e conta do colecionador,
backend inteiramente simulado na camada de rede (MSW) e tempo real via Socket.IO. O enunciado
original está preservado em [`docs/CHALLENGE.md`](docs/CHALLENGE.md); as decisões de
arquitetura, contratos e limitações estão em [`ARCHITECTURE.md`](ARCHITECTURE.md).

- **Aplicação publicada:** <https://jungle-frontend-challenge-snowy.vercel.app/>
- **Repositório:** <https://github.com/CarlosEduardoFurlan/frontend-challenge>

## Visão geral

| Tela                  | Rota                  | Destaques                                                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| Início                | `/`                   | Destaques, catálogo com busca, filtros combináveis, ordenação e paginação na URL            |
| Detalhe do NFT        | `/nft/:id`            | Galeria, edições, limite de quantidade, favorito, adicionar/comprar                         |
| Carrinho              | `/cart`               | Quantidades, remoção, cupom, subtotal/desconto/taxa/total da API, persistência do visitante |
| Pagamento             | `/checkout`           | Dados do colecionador, carteira cadastrada, rede, conexão simulada, revisão com revalidação |
| Confirmação do pedido | `/orders/:id`         | Pendente → confirmado/recusado via Socket.IO, recibo imutável, recuperação após refresh     |
| Login / Cadastro      | `/login`, `/register` | Validação, erros da API, retorno ao fluxo anterior, conflito de e-mail                      |
| Perfil                | `/account/profile`    | Dados, avatar (recorte no cliente), troca de senha                                          |
| Carteiras             | `/account/wallets`    | Principal e secundária com validações                                                       |
| Pedidos               | `/account/orders`     | Histórico com status                                                                        |

## Stack

React 19 · TypeScript 5.9 (strict) · Vite 7 · TanStack Router (file-based, estado na URL) ·
TanStack Query · Axios · Socket.IO client · MSW 2 (REST + WebSocket via
`@mswjs/socket.io-binding`) · Tailwind CSS v4 · shadcn/ui (Radix) · Zod · decimal.js ·
react-hook-form · Playwright · Lighthouse · ESLint + Prettier.

## Pré-requisitos e instalação

- Node.js ≥ 20 (desenvolvido com 24) e npm ≥ 10.
- Python 3 + Pillow apenas para reconverter os assets do Figma (`scripts/figma-assets.py`) ou
  gerar as folhas de comparação (`scripts/figma-compare.py`).

```bash
npm ci                      # dependências (lockfile versionado)
npx playwright install chromium   # navegador dos testes (uma vez)
cp .env.example .env        # opcional: os defaults já funcionam
npm run dev                 # http://localhost:5173 com mocks ativos
```

## Variáveis de ambiente (`.env.example`)

| Variável             | Default   | Função                                                                |
| -------------------- | --------- | --------------------------------------------------------------------- |
| `VITE_API_URL`       | `/api`    | Base do Axios (interceptada pelo MSW)                                 |
| `VITE_SOCKET_URL`    | `/`       | Origem do Socket.IO (WebSocket interceptado pelo MSW)                 |
| `VITE_ENABLE_MOCKS`  | `true`    | Liga a camada MSW (REST + Socket.IO). Mantenha `true` na demonstração |
| `VITE_MOCK_SCENARIO` | `default` | Cenário inicial quando nenhum foi escolhido por URL/painel            |

Nenhuma variável contém segredo; o build de demonstração roda sem `.env`.

## Comandos

| Comando                                    | O que faz                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| `npm run dev`                              | Servidor de desenvolvimento com mocks                                            |
| `npm run build` / `npm run preview`        | Build de produção (gera a árvore de rotas, typecheck, Vite) / preview em `:4173` |
| `npm run typecheck`                        | `tsr generate && tsc -b`                                                         |
| `npm run lint` / `npm run format:check`    | ESLint / Prettier                                                                |
| `npm run test:e2e`                         | Playwright E2E em Chromium desktop (1440) e mobile (390), contra o build         |
| `npm run test:visual`                      | Regressão visual (início, detalhe, carrinho, pagamento; desktop e mobile)        |
| `npm run test:visual:update`               | Regenera as baselines visuais                                                    |
| `npm run test:a11y`                        | Apenas a suíte de acessibilidade (teclado, foco, formulários, axe-core)          |
| `npm run test:all` / `npm run test:report` | Tudo / abre o relatório HTML                                                     |
| `npm run lighthouse`                       | Auditoria Lighthouse (3 execuções, medianas, relatórios em `lighthouse/`)        |
| `npm run mocks:init`                       | Reinstala `public/mockServiceWorker.js` (após atualizar o MSW)                   |

## Execução com mocks

Os mocks são a única fonte de dados: `GET/POST /api/*` são respondidos pelo MSW no navegador e o
`socket.io-client` conecta a um servidor Socket.IO simulado sobre WebSocket interceptado. O estado
(catálogo, usuários, carrinhos, favoritos, carteiras, pedidos) é persistido em `localStorage`
(`nftm.mock.db.v1`) para sobreviver ao refresh e mantém consistência entre REST e eventos.

### Credenciais fictícias

| Usuário        | E-mail              | Senha       | Observações                                     |
| -------------- | ------------------- | ----------- | ----------------------------------------------- |
| Ana Ribeiro    | `ana@example.com`   | `Senha@123` | 2 carteiras cadastradas, 2 favoritos            |
| Bruno Carvalho | `bruno@example.com` | `Senha@123` | Sem carteiras (exercita o cadastro no checkout) |

Cupons: `BEMVINDO10` (10%), `JUNGLE20` (20%, subtotal ≥ 1 ETH), `FIXO005` (0,05 ETH, subtotal ≥
0,1 ETH), `EXPIRADO` (expirado). Senhas são armazenadas como hash SHA-256 com salt.

### Seleção e reset de cenários

| Forma                 | Como                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL                   | `/?mock-scenario=slow-network` (persiste), `/?mock-reset=1` (restaura)                                                                                                |
| Painel na interface   | Botão flutuante (frasco) no canto inferior esquerdo, em qualquer build                                                                                                |
| API de controle (MSW) | `POST /api/__mock/scenario {id}`, `POST /api/__mock/reset`, `GET /api/__mock/status`                                                                                  |
| Testes                | `window.__mock.setScenario(id)`, `reset()`, `expireSessions()`, `updatePrice()`, `updateAvailability()`, `settlePendingOrders()`, `dropSockets()`, `replayNftEvent()` |

Cenários disponíveis (`src/mocks/scenarios/index.ts`): `default`, `empty-catalog`,
`slow-network`, `variable-latency` (respostas fora de ordem), `network-error`,
`catalog-network-error-once`, `server-error`, `favorites-fail`, `session-expired` (sessão de
15 s), `unauthorized`, `register-conflict`, `validation-errors`, `coupon-invalid`,
`coupon-expired`, `price-changed`, `sold-out`, `order-timeout`, `payment-rejected`,
`order-pending-long`, `wallet-rejected`, `wallet-disconnect`.

### Reproduzindo fluxos de sucesso e falha

- **Compra completa**: login (Ana) → NFT → "Adicionar ao carrinho" → carrinho → "Ir para o
  pagamento" → CPF (ex.: `529.982.247-25`) → "Conectar carteira" → aceitar termos → "Confirmar
  pedido" → página do pedido muda de Pendente para Confirmado pelo evento `order.updated`.
- **Pagamento recusado**: cenário `payment-rejected` antes de confirmar; os itens ficam no carrinho.
- **Timeout após criar o pedido**: cenário `order-timeout`; o cliente estoura em 15 s e recupera o
  mesmo pedido pela chave de idempotência (um único pedido).
- **Preço alterado durante o checkout**: no checkout, painel → "nft.updated: preço de nft-001 →
  0,09 ETH" (ou cenário `price-changed`); o resumo é atualizado e a confirmação exige revisão.
- **Edição esgotada**: painel → "esgotar edição padrão de nft-002" com o item no carrinho.
- **Queda de conexão com pedido pendente**: cenário `order-pending-long`, confirmar, painel →
  "Interromper conexão Socket.IO"; reconecta sozinho; "liquidar pedidos pendentes" confirma via socket.
- **Sessão expirada**: cenário `session-expired` (15 s) ou `window.__mock.expireSessions()`; em
  rotas privadas redireciona para login preservando a URL e o rascunho do checkout.
- **Skeletons e erros**: `slow-network` (shimmer), `catalog-network-error-once` (erro + tentar
  novamente), `network-error`.

## Testes e auditorias

- **Playwright**: 144 testes E2E (12 grupos do enunciado) + 10 visuais, executados contra o build
  de produção (`vite preview`) para exercitar o service worker e o WebSocket como no deploy.
  Relatório HTML em `playwright-report/`, traces em falhas (`test-results/`).
  Baselines visuais versionadas em `tests/visual/__snapshots__/<projeto>/win32/` (ver limitação).
- **Lighthouse**: `npm run lighthouse` (modo simulate) e `npm run lighthouse -- --throttling=devtools`.
  Resultados, versões e análise em [`lighthouse/README.md`](lighthouse/README.md).
- **CI** (GitHub Actions): typecheck, lint, format, build, E2E desktop+mobile e renderização visual.

## Deploy

A aplicação está pronta para a Vercel (`vercel.json` com rewrite SPA, cache do service worker
e dos assets). Passos: importar o repositório na Vercel → framework Vite → build `npm run build`
→ output `dist` → sem variáveis obrigatórias. Netlify/Cloudflare Pages funcionam com o mesmo
build (configure o rewrite `/* → /index.html`).

**URL pública:** <https://jungle-frontend-challenge-snowy.vercel.app> (projeto
`jungle-frontend-challenge`, publicado pela CLI da Vercel a partir da `main`). A camada MSW e o
binding Socket.IO fazem parte do build, então o ambiente publicado é autossuficiente.

**Versão publicada (2026-10-28):** commit `cc805f6` da `main` (merge do PR #2), deployment
`dpl_5aAFpQ6CxgUFfXQKKd5JSkX27Lmm` (`jungle-frontend-challenge-hctuax0as.vercel.app`), alias de
produção apontando para ele. Verificado contra o build local do mesmo commit: `index.html`
idêntico, os 35 chunks JS byte a byte iguais, CSS inlined (nenhum `<link rel="stylesheet">`),
`mockServiceWorker.js`, fontes e artes servidos com 200, rotas diretas e refresh funcionando.

Fluxo de publicação (nenhum segredo passa pelo chat; a CLI guarda a sessão em
`%APPDATA%\com.vercel.cli`):

1. `npx vercel login` (abre o navegador).
2. Preview da branch: `npx vercel`. Produção: `npx vercel --prod` (ou `npx vercel promote <url>`
   para promover um preview já validado). O `vercel.json` define framework, build, saída, rewrite
   da SPA e os headers do service worker.
3. Validar a URL com as mesmas suítes e com a verificação de runtime:

   ```bash
   REMOTE_BASE_URL=https://<deploy>.vercel.app npx playwright test --config=playwright.remote.config.ts
   REMOTE_BASE_URL=https://<deploy>.vercel.app node scripts/dev/remote-check.mjs
   ```

   (no PowerShell, `$env:REMOTE_BASE_URL = "https://<deploy>.vercel.app"` antes dos comandos; no
   CMD, `set "REMOTE_BASE_URL=https://<deploy>.vercel.app"`). O relatório HTML fica em
   `playwright-report-remote/`.

Validação da versão publicada (2026-10-28, `playwright.remote.config.ts`, Chromium desktop +
mobile, 6 workers, 1 retry):

| Execução | Total | Aprovados | Falhos | Ignorados | Retries                                |
| -------- | ----: | --------: | -----: | --------: | -------------------------------------- |
| 1ª       |   144 |       144 |      0 |         0 | 3 (aprovados na 2ª tentativa, "flaky") |
| 2ª       |   144 |       144 |      0 |         0 | 0                                      |

Os três casos instáveis da 1ª execução (compra completa e reconexão do socket no desktop;
carrinho de visitante no mobile) falharam na primeira tentativa com uma única requisição POST
respondida com `net::ERR_FAILED` em ~10 ms enquanto as requisições vizinhas eram mockadas
normalmente; o cenário `network-error` (que falha todas) não estava ativo e um _passthrough_
para a Vercel devolveria `405`, não um erro de rede. Repetidos 6 vezes cada, isolados e sem
retries, passaram 36/36; a 2ª execução completa passou sem retries. Classificação:
intermitência do caminho service worker → página sob carga paralela, não um defeito da
aplicação; nenhum teste foi alterado. A verificação de runtime (`scripts/dev/remote-check.mjs`)
não registrou erros de console, requisições falhas ou HTTP ≥ 400; service worker do MSW ativo,
Socket.IO `connected` e Roboto Mono carregada em todas as rotas.

Observações da primeira validação pública (2026-10-28, deploy anterior a partir da branch):

- Os deployments de **preview** do projeto estão atrás da Vercel Authentication (redirecionam
  para `vercel.com/sso-api`), então a suíte remota só roda contra produção ou com a proteção
  desativada/bypass configurado em _Project Settings → Deployment Protection_.
- O primeiro deploy foi feito com uma saída de build anterior no diretório de trabalho, e a
  detecção automática de fontes do Tailwind a incluiu no scan: o CSS passou de 66 KB para 77 KB e
  deixou de ser inlined. As fontes do Tailwind agora são fixas (`src/` e `index.html`), ver
  `src/app/styles/globals.css`.

A versão publicada deve corresponder ao commit da branch `main` após o merge do PR final.

## Principais decisões e limitações

- **Figma**: inspecionado pelo MCP oficial do Figma (arquivo "Frontend Challenge (Copy)"). Tokens,
  tipografia e assets vêm das variáveis e exports do arquivo. Os 15 frames foram comparados lado
  a lado: 7 capturados pelo MCP (início, detalhe, carrinho, pagamento, confirmação, carteiras e
  pagamento mobile) e 8 exportados manualmente do Figma depois que o plano Starter esgotou a cota
  de 20 chamadas/mês do MCP (login, cadastro, perfil e os mobiles de início, detalhe, carrinho,
  login e cadastro). Detalhes, comparações e divergências assumidas em
  [`docs/FIGMA-AUDIT.md`](docs/FIGMA-AUDIT.md).
- **Fontes**: Roboto Mono (400/500/700), única família do arquivo, local em `public/fonts`
  (subconjunto Latin). Artes e ícones originais em `public/assets/`.
- **Socket.IO sobre MSW**: ver limitações do binding e contornos em `ARCHITECTURE.md`.
- **Lighthouse mobile** atinge a meta nos dois modos (simulate 92/90, devtools 95/92) depois que
  o React passou a adotar a imagem pré-renderizada; a margem do detalhe mobile simulado é de
  poucos pontos (`lighthouse/README.md`).
- **Regressão visual** com baselines versionadas apenas para Windows/Chromium; o CI renderiza em
  Linux e guarda as baselines como artefato.
- **Histórico Git**: branches de funcionalidade integradas em `develop` com merge `--no-ff`;
  correção de fidelidade visual integrada pelo PR #1 (`fix/figma-fidelity` → `develop`) e entrega
  final pelo PR #2 (`develop` → `main`), preservando os commits. Os registros anteriores estão em
  `docs/pull-requests/`. Ver [`docs/BRANCHING.md`](docs/BRANCHING.md).
