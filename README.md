# KURIO — NFT Marketplace

Marketplace de NFTs desenvolvido para o desafio técnico de Desenvolvedor Frontend da Jungle
Gaming. Cobre descoberta, compra e conta do colecionador, nas versões desktop e mobile do Figma,
com backend inteiramente simulado na camada de rede (MSW) e atualizações em tempo real via
Socket.IO. 

## Demonstração

- **Aplicação publicada:** <https://jungle-frontend-challenge-snowy.vercel.app/>
- **Repositório:** <https://github.com/CarlosEduardoFurlan/frontend-challenge>

A versão publicada é autossuficiente: os mocks e o servidor Socket.IO simulado fazem parte do
build, então todos os fluxos funcionam na URL pública, inclusive acesso direto e refresh das
rotas.

## Tecnologias

| Responsabilidade        | Tecnologia                                                  |
| ----------------------- | ----------------------------------------------------------- |
| Interface e linguagem   | React 19, TypeScript 5.9 (strict), Vite 7                   |
| Roteamento e estado     | TanStack Router (file-based, estado na URL), TanStack Query |
| HTTP e tempo real       | Axios, socket.io-client                                     |
| Mocking                 | MSW 2 (REST e WebSocket via `@mswjs/socket.io-binding`)     |
| Estilo e componentes    | Tailwind CSS v4, shadcn/ui (Radix), Roboto Mono local       |
| Formulários e validação | react-hook-form, Zod                                        |
| Valores monetários      | decimal.js (ETH como string decimal)                        |
| Testes e auditoria      | Playwright (E2E, visual, axe-core), Lighthouse              |
| Qualidade e entrega     | ESLint, Prettier, GitHub Actions, Vercel                    |

## Funcionalidades

| Tela                  | Rota                  | O que faz                                                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| Início                | `/`                   | Destaques, catálogo com busca, filtros combináveis, ordenação e paginação na URL            |
| Detalhe do NFT        | `/nft/:id`            | Galeria, edições, limite de quantidade, favorito, adicionar ao carrinho e compra direta     |
| Carrinho              | `/cart`               | Quantidades, remoção, cupom, totais calculados pela API, persistência do visitante          |
| Pagamento             | `/checkout`           | Dados do colecionador, carteira cadastrada, rede, conexão simulada, revisão com revalidação |
| Confirmação do pedido | `/orders/:id`         | Pendente → confirmado/recusado via Socket.IO, recibo imutável, recuperação após refresh     |
| Login e cadastro      | `/login`, `/register` | Validação, erros da API, retorno ao fluxo anterior, conflito de e-mail                      |
| Perfil                | `/account/profile`    | Dados, avatar com recorte no cliente, troca de senha                                        |
| Carteiras             | `/account/wallets`    | Carteira principal e secundária com validações                                              |
| Pedidos               | `/account/orders`     | Histórico de pedidos com status                                                             |
| Favoritos             | `/favorites`          | Lista de interesse por usuário, com atualização otimista e rollback em caso de falha        |

Também estão implementados: sessão recuperável e expiração com retomada do checkout, isolamento
de dados por usuário, idempotência dos pedidos, tolerância a eventos duplicados ou antigos,
reconciliação REST ↔ Socket.IO após reconexão, skeletons com shimmer, navegação por teclado e
feedback acessível.

## Como executar

Pré-requisitos: Node.js 20 ou superior (desenvolvido com 24) e npm 10 ou superior.

```bash
npm ci                            # dependências (lockfile versionado)
npx playwright install chromium   # navegador dos testes (uma vez)
npm run dev                       # http://localhost:5173 com mocks ativos
```

| Comando                                    | O que faz                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`                              | Servidor de desenvolvimento com mocks                                     |
| `npm run build` / `npm run preview`        | Build de produção / preview do build em `http://localhost:4173`           |
| `npm run typecheck`                        | Gera a árvore de rotas e roda o `tsc`                                     |
| `npm run lint` / `npm run format:check`    | ESLint / Prettier                                                         |
| `npm run test:e2e`                         | Playwright E2E em Chromium desktop (1440 px) e mobile (390 px)            |
| `npm run test:visual`                      | Regressão visual de início, detalhe, carrinho e pagamento                 |
| `npm run test:a11y`                        | Apenas a suíte de acessibilidade (teclado, foco, formulários, axe)        |
| `npm run test:all` / `npm run test:report` | Todas as suítes / abre o relatório HTML                                   |
| `npm run lighthouse`                       | Auditoria Lighthouse (3 execuções, medianas, relatórios em `lighthouse/`) |

Os testes e o Lighthouse rodam contra o build de produção servido por `vite preview`, para
exercitar o service worker e o WebSocket exatamente como no deploy.

## Variáveis de ambiente

Nenhuma variável é obrigatória e nenhuma contém segredo; `.env.example` documenta os defaults.

| Variável             | Default   | Função                                                        |
| -------------------- | --------- | ------------------------------------------------------------- |
| `VITE_API_URL`       | `/api`    | Base do Axios (interceptada pelo MSW)                         |
| `VITE_SOCKET_URL`    | `/`       | Origem do Socket.IO (WebSocket interceptado pelo MSW)         |
| `VITE_ENABLE_MOCKS`  | `true`    | Liga a camada de mocks; mantenha `true` na demonstração       |
| `VITE_MOCK_SCENARIO` | `default` | Cenário inicial quando nenhum foi escolhido por URL ou painel |

## Credenciais de teste

| Usuário        | E-mail              | Senha       | Observações                                     |
| -------------- | ------------------- | ----------- | ----------------------------------------------- |
| Ana Ribeiro    | `ana@example.com`   | `Senha@123` | Duas carteiras cadastradas e dois favoritos     |
| Bruno Carvalho | `bruno@example.com` | `Senha@123` | Sem carteiras (exercita o cadastro no checkout) |

Cupons: `BEMVINDO10` (10 %), `JUNGLE20` (20 %, subtotal ≥ 1 ETH), `FIXO005` (0,05 ETH, subtotal
≥ 0,1 ETH) e `EXPIRADO` (expirado). CPF válido para o checkout: `529.982.247-25`. As senhas são
armazenadas como hash SHA-256 com salt.

## Mocks e cenários

Toda chamada `GET/POST /api/*` é respondida pelo MSW no navegador e o `socket.io-client` conecta
a um servidor Socket.IO simulado sobre WebSocket interceptado. O estado (catálogo, usuários,
carrinhos, favoritos, carteiras, pedidos) é persistido em `localStorage` (`nftm.mock.db.v1`) para
sobreviver ao refresh e mantém consistência entre as respostas REST e os eventos.

### Seleção e reset de cenários

| Forma               | Como                                                                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL                 | `/?mock-scenario=slow-network` (persiste até trocar), `/?mock-reset=1` (restaura o estado inicial)                                                                    |
| Painel na interface | Botão flutuante (frasco) no canto inferior esquerdo, disponível em qualquer build                                                                                     |
| API de controle     | `POST /api/__mock/scenario {id}`, `POST /api/__mock/reset`, `GET /api/__mock/status`                                                                                  |
| Testes              | `window.__mock.setScenario(id)`, `reset()`, `expireSessions()`, `updatePrice()`, `updateAvailability()`, `settlePendingOrders()`, `dropSockets()`, `replayNftEvent()` |

Cenários (`src/mocks/scenarios/index.ts`): `default`, `empty-catalog`, `slow-network`,
`variable-latency` (respostas fora de ordem), `network-error`, `catalog-network-error-once`,
`server-error`, `favorites-fail`, `session-expired` (sessão de 15 s), `unauthorized`,
`register-conflict`, `validation-errors`, `coupon-invalid`, `coupon-expired`, `price-changed`,
`sold-out`, `order-timeout`, `payment-rejected`, `order-pending-long`, `wallet-rejected` e
`wallet-disconnect`.

### Reproduzindo os fluxos

- **Compra completa:** entrar como Ana → abrir um NFT → "Adicionar ao carrinho" → carrinho →
  "Ir para o pagamento" → informar o CPF → "Conectar carteira" → aceitar os termos → "Confirmar
  pedido". A página do pedido passa de Pendente para Confirmado pelo evento `order.updated`.
- **Pagamento recusado:** ativar `payment-rejected` antes de confirmar; os itens permanecem no
  carrinho.
- **Preço alterado durante o checkout:** no checkout, usar o painel ("nft.updated: preço de
  nft-001") ou o cenário `price-changed`; o resumo é atualizado e a confirmação exige nova
  revisão.
- **Edição esgotada:** painel → "esgotar edição padrão de nft-002" com o item no carrinho.
- **Timeout após criar o pedido:** cenário `order-timeout`; o cliente estoura em 15 s e a nova
  tentativa recupera o mesmo pedido pela chave de idempotência (um único pedido é criado).
- **Queda de conexão com pedido pendente:** cenário `order-pending-long`, confirmar, painel →
  "Interromper conexão Socket.IO"; o cliente reconecta sozinho e "liquidar pedidos pendentes"
  confirma o pedido pelo socket.
- **Sessão expirada:** cenário `session-expired` (15 s) ou `window.__mock.expireSessions()`; nas
  rotas privadas redireciona para o login preservando a URL e o rascunho do checkout.
- **Falhas de rede e carregamento:** `slow-network` (skeletons com shimmer),
  `catalog-network-error-once` (erro com "Tentar novamente"), `network-error` (toda requisição
  falha), `server-error` (HTTP 5xx).

## Testes e qualidade

- **Playwright:** 144 testes E2E cobrindo os 12 grupos do enunciado, executados em Chromium
  desktop e mobile, mais 10 testes de regressão visual com baselines versionadas em
  `tests/visual/__snapshots__/`. Relatório HTML em `playwright-report/` e traces das falhas em
  `test-results/`.
- **Lighthouse:** início e detalhe do NFT, perfis mobile e desktop, três execuções por
  combinação. Medianas, LCP/CLS/TBT, versões das ferramentas e análise em
  [`lighthouse/README.md`](lighthouse/README.md); relatórios HTML/JSON em `lighthouse/reports/`.
- **GitHub Actions:** typecheck, lint, formatação, build, E2E desktop e mobile e renderização
  visual em cada push e pull request.
- **Ambiente publicado:** a mesma suíte E2E pode rodar contra a URL pública com
  `playwright.remote.config.ts`, e `scripts/dev/remote-check.mjs` verifica console, requisições,
  service worker, Socket.IO e fontes nas rotas principais:

  ```bash
  REMOTE_BASE_URL=https://jungle-frontend-challenge-snowy.vercel.app npx playwright test --config=playwright.remote.config.ts
  REMOTE_BASE_URL=https://jungle-frontend-challenge-snowy.vercel.app node scripts/dev/remote-check.mjs
  ```

  No PowerShell, defina `$env:REMOTE_BASE_URL = "..."` antes dos comandos. A última execução
  completa contra a produção aprovou 144/144 testes sem retries.

## Deploy

A aplicação está publicada na Vercel a partir da branch `main` (`vercel.json` define o build,
o rewrite da SPA e os headers do service worker; nenhuma variável de ambiente é necessária).
O deploy corresponde ao commit de integração final do código da aplicação; os commits feitos
depois dele na `main` alteram apenas documentação, portanto a versão publicada é idêntica ao
código atual.

Para republicar: `npx vercel login` e, no diretório do projeto, `npx vercel --prod`. Netlify e
Cloudflare Pages funcionam com o mesmo build (`npm run build`, saída `dist`, rewrite
`/* → /index.html`).

## Arquitetura e limitações

- [`ARCHITECTURE.md`](ARCHITECTURE.md): organização por features, contratos REST e eventos,
  sessão, carrinho, cache e retries, reconciliação em tempo real, idempotência, decisões de UX,
  desvios do Figma e limitações da simulação.
- [`docs/FIGMA-AUDIT.md`](docs/FIGMA-AUDIT.md): auditoria de fidelidade ao Figma (tokens,
  tipografia, assets, 15 frames), com as referências e comparações lado a lado em
  `docs/figma-comparison/`.
- [`docs/REQUIREMENTS-MATRIX.md`](docs/REQUIREMENTS-MATRIX.md): cada requisito do enunciado com a
  implementação, o teste que o valida e a evidência.
- [`lighthouse/README.md`](lighthouse/README.md): resultados e análise de performance.

Limitações conhecidas: o backend simulado vive na página (sem compartilhamento entre abas; o
reset é feito por URL ou painel); as baselines visuais foram geradas em Windows/Chromium (o CI
renderiza em Linux e guarda as capturas como artefato); dos 15 frames do Figma, 8 foram comparados
a partir de exportações manuais porque a cota mensal do MCP do Figma esgotou, e as divergências
assumidas por funcionalidade estão listadas na auditoria.

O histórico Git usa branches por funcionalidade integradas com merge commits (`develop` → `main`
pelos pull requests #1, #2 e #3) e mensagens no padrão Conventional Commits.
