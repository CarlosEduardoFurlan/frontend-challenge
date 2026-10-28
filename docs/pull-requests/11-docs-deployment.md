# PR #11 — docs/deployment → develop

## Objetivo e escopo

Documentação final da solução (README, ARCHITECTURE, fluxo de branches, matriz de
rastreabilidade), capturas de tela nos três viewports e preparação do deploy.

## Conteúdo

- `README.md`: visão geral, stack, instalação, variáveis, comandos, mocks, credenciais, cenários e
  reset, testes/auditorias, reprodução de fluxos, deploy, decisões e limitações.
- `ARCHITECTURE.md`: camadas, contratos REST, eventos Socket.IO, sessão, carrinho, cache/retries,
  reconciliação, idempotência, UX, desvios do Figma, limitações.
- `docs/BRANCHING.md`, `docs/REQUIREMENTS-MATRIX.md`, `docs/screenshots/` (390/768/1440).
- Deploy: `vercel.json` validado com o build; instruções para Vercel/Netlify/Cloudflare.

## Deploy

Não executado: sem credenciais/CLI da Vercel no ambiente. A configuração está pronta; a URL deve
ser adicionada ao README após a publicação a partir da `main`.

## Testes executados

```
npm run typecheck ✔  npm run lint ✔  npm run format:check ✔  npm run build ✔
```
