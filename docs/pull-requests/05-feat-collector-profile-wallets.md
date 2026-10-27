# PR #5 — feat/collector-profile-wallets → develop

## Objetivo e escopo

Perfil do colecionador (dados, avatar, senha) e carteiras (principal e secundária) com
validação no cliente e na API simulada, persistência após refresh e tratamento de erros.
Inclui testes E2E do grupo 8 e dois ajustes transversais encontrados durante os testes.

## Principais decisões técnicas

- **Schemas Zod compartilhados** (`features/profile/schemas.ts`, `features/wallets/schemas.ts`)
  usados pelo react-hook-form e pelos handlers MSW; erros 409/422 são mapeados para os campos.
- **Avatar**: o arquivo é recortado em quadrado e reduzido para 256 px em WebP no cliente
  (`createImageBitmap` + canvas) antes de ir para a API como data URL (limite de 300 KB).
- **Senha**: hash SHA-256 + salt novo a cada troca; a senha atual é conferida no handler.
- **Carteiras**: `PUT /wallets/:kind` (upsert). Regras: endereço `0x` + 40 hex, secundária só
  após a principal, endereços distintos entre as duas (409).
- **Cache**: `['private', userId, 'profile'|'wallets']`; atualização de perfil também sincroniza
  `['session']` (nome/avatar do header).
- **Correção de UX**: formulários passaram de `mode: 'onBlur'` para `mode: 'onTouched'`.
  Com `onBlur`, a mensagem de erro sumia no blur disparado pelo clique em "Salvar", deslocando
  o botão para cima e perdendo o clique (reproduzido com Playwright).
- **Expiração de sessão em páginas públicas** agora só avisa (toast) e mantém o visitante
  navegando; em rotas privadas redireciona com `reason=expired`. O guard `requireAuth` também
  usa `reason=expired` quando a sessão expirou há menos de 5 min.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run build ✔
npx playwright test (desktop + mobile)  74 passed
  profile-wallets.spec.ts: perfil, username (cliente + 409), avatar upload/remoção,
  senha (atual incorreta + troca válida + login com a nova), 422 do cenário
  "validation-errors", carteiras (formato, principal → secundária, duplicidade, edição).
```

## Requisitos atendidos

- Perfil: consulta e atualização de dados, avatar e senha, persistência e erros da API.
- Carteiras: consulta, cadastro e edição da principal e secundária com as validações.
- Mobile: layout da área da conta com navegação horizontal.

## Limitações

- Não há exclusão de carteira (fora do escopo: "cadastro e edição").
