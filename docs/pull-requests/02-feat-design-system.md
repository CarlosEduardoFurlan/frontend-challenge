# PR #2 — feat/design-system → develop

## Objetivo e escopo

Design system e layout base: primitivos shadcn/ui adaptados aos tokens, header/footer
responsivos, card de NFT com skeleton shimmer, estados vazio/erro, paginação, stepper,
toasts e live region. Hero da home, esquema Zod da URL do catálogo e placeholders de rotas.

## Principais decisões técnicas

- Paleta extraída do thumbnail público do Figma (API/MCP indisponíveis): fundo `#120b08`,
  superfícies `#1b120d`, texto creme `#f5ede0`, laranja `#e58a3a` para ações primárias.
- Tipografia: **Silkscreen** (display, caixa alta) + **Inter** (texto), self-hosted via
  fontsource. Substituição documentada em `ARCHITECTURE.md`.
- Artes do catálogo geradas proceduralmente (`scripts/generate-artwork.py`), determinísticas,
  em WebP 640/320 px, porque os assets do Figma não eram acessíveis.
- `NativeSelect` para ordenação (nativo, leve, acessível); Radix para Dialog/Sheet/Dropdown/
  Toast (gerenciamento de foco e `aria-live` prontos).
- `Button asChild` renderiza só o filho (Slot exige um único elemento); spinner apenas em
  botões reais.

## Capturas de tela

Home (estrutura com skeletons) validada em 390, 768 e 1440 px sem overflow horizontal.
As capturas finais são versionadas em `docs/screenshots/` no PR de testes visuais.

## Testes executados

```
npm run typecheck ✔   npm run lint ✔ (0 erros)   npm run build ✔
node scripts/screenshot.mjs http://localhost:4173 <out> /   (sem overflow nos 3 viewports)
Playwright smoke (4 testes) ✔
```

## Requisitos atendidos

- Tokens de design, componentes shadcn/ui adaptados, layout responsivo, foco visível,
  skeleton com shimmer e `prefers-reduced-motion`.

## Limitações

- Fidelidade pixel a pixel ao Figma **não verificada**: apenas o thumbnail de 800 px estava
  acessível. Ver seção "Figma" em `ARCHITECTURE.md`.
