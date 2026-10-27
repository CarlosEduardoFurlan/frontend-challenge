# PR #1 — chore/project-setup → develop

## Objetivo e escopo

Criar a fundação do projeto a partir de um repositório vazio: toolchain, qualidade de código,
roteamento, estado remoto, cliente HTTP, camada de mocks e esqueleto de testes/CI.

## Principais decisões técnicas

- **Vite 7 + React 19 + TypeScript 5.9 (strict, `noUncheckedIndexedAccess`)**.
- **Tailwind CSS v4** com tokens em CSS variables mapeados via `@theme inline`, seguindo a
  paleta quente/escura do Figma. `components.json` do shadcn/ui aponta para esses tokens.
- **TanStack Router** com file-based routing (`src/routes`) e `routeTree.gen.ts` versionado
  (regenerado pelo plugin do Vite em dev/build; o typecheck funciona em checkout limpo).
- **TanStack Query** com política documentada: `staleTime` 30s, `gcTime` 5min, retry apenas
  em falhas transitórias (rede/5xx/429), mutations sem retry automático.
- **Axios** em instância única (`src/services/api/client.ts`) com `ApiError` normalizado.
- **MSW** iniciado antes do render; service worker em `public/` para o build de demonstração.
- **Playwright** executa contra o `vite preview` do build de produção (mesmo caminho do deploy).
- **Fontes self-hosted** (Inter + Silkscreen via fontsource) em vez de Google Fonts remoto.

## Testes executados

```
npm run typecheck   ✔
npm run lint        ✔
npm run build       ✔
npx playwright test --project=chromium-desktop --project=chromium-mobile
  4 passed (8.1s)  — smoke: home via MSW (/health) e rota inexistente
```

## Requisitos atendidos

- Stack obrigatória instalada e já participando do bootstrap (Router, Query, Axios, MSW, Tailwind).
- Comandos de dev, build, preview, typecheck, lint e testes disponíveis.
- CI (GitHub Actions) com typecheck, lint, format, build e E2E.
- Configuração de deploy Vercel (`vercel.json`) com rewrite SPA e cache do service worker.

## Limitações / pendências

- O Figma não pôde ser inspecionado via API (403 sem token; sem MCP Figma no ambiente).
  Apenas o thumbnail público foi analisado. Ver `ARCHITECTURE.md` quando publicado.
- PRs não puderam ser abertos automaticamente (sem `gh` CLI/token). Este arquivo registra o
  conteúdo do PR; a branch foi integrada em `develop` com merge `--no-ff`.
