# PR #4 — feat/authentication → develop

## Objetivo e escopo

Conta e sessão: cadastro, login, consulta de sessão, logout e expiração via API simulada;
proteção de rotas privadas com retorno ao fluxo anterior; favoritos persistidos por usuário com
atualização otimista e rollback. Testes E2E dos grupos 3 e 4.

## Principais decisões técnicas

- **Sessão** = token bearer + id do usuário em `localStorage` (`sessionStore`); o perfil fica no
  cache do TanStack Query (`['session']`). Senhas nunca são armazenadas: o mock guarda SHA-256
  com salt.
- **Interceptors Axios**: request anexa `Authorization` e `X-Guest-Cart-Id`; response converte
  401 (`session_expired`/`unauthorized`) em evento `expired`. `SessionWatcher` limpa o cache
  privado, avisa (toast) e redireciona para `/login?redirect=<url>&reason=expired`.
- **Guards** em `beforeLoad` (`requireAuth`) para `/favorites`, `/account/*` e, depois,
  `/checkout`; `sanitizeRedirect` só aceita caminhos same-origin.
- **Isolamento por usuário**: chaves privadas vivem sob `['private', userId]`; login com outro
  usuário remove as chaves do anterior; logout remove `private` + `cart`, rotaciona o id de
  carrinho de visitante e zera a sessão.
- **Validação compartilhada**: os schemas Zod de login/cadastro são usados pelo formulário
  (react-hook-form) e pelo handler MSW; erros 409/422 da API são mapeados para os campos
  (`applyApiErrors`).
- **Favoritos otimistas**: `onMutate` cancela a query, aplica o snapshot e anuncia via live
  region; `onError` restaura e exibe toast destrutivo; `onSettled` revalida.
- Controle `window.__mock.expireSessions()` / `POST /api/__mock/session/expire` para simular
  expiração determinística nos testes.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run build ✔
npx playwright test tests/e2e/auth.spec.ts tests/e2e/favorites.spec.ts (desktop + mobile)
  22 passed
```

## Requisitos atendidos

- Login/cadastro com validação, conflito (409), credenciais inválidas, retorno ao fluxo.
- Sessão recuperável após refresh; expiração durante a navegação; logout; troca de usuário sem
  vazamento de dados.
- Favoritos persistidos para o usuário autenticado; atualização otimista com rollback.

## Limitações

- Expiração "durante o checkout" é coberta na branch de checkout (o rascunho do checkout é
  preservado em `sessionStorage`).
