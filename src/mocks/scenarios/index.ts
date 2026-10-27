/**
 * Deterministic mock scenarios. A scenario changes how the MSW handlers behave without
 * touching the UI code. Select one with `?mock-scenario=<id>`, the in-app mock panel,
 * `POST /api/__mock/scenario` or `window.__mock.setScenario(id)` (tests).
 */
export interface FailureRule {
  /** Regex tested against `${method} ${pathname}` (e.g. "GET /api/nfts"). */
  match: RegExp
  status: number
  code: string
  message: string
  /** Fail only the first N matching requests, then succeed (default: always). */
  times?: number
}

export interface ScenarioConfig {
  id: string
  label: string
  description: string
  /** Latency range in ms applied to every REST response. */
  latency: { min: number; max: number }
  /** When true, list responses get randomised extra latency so they may arrive out of order. */
  outOfOrder: boolean
  /** Simulate connection failure (Axios ERR_NETWORK) for matching routes. */
  networkErrorMatch: RegExp | null
  /** HTTP error injection rules. */
  failures: FailureRule[]
  /** Session lifetime in ms (default: 8h). Short values simulate expiration. */
  sessionTtlMs: number
  /** Catalog returns no items. */
  emptyCatalog: boolean
  /** Registration always conflicts (email already registered). */
  registerConflict: boolean
  /** Coupon behaviour override. */
  coupon: 'normal' | 'invalid' | 'expired'
  /** When quoting, mutate the catalog: price up on first line / sold out first line. */
  quoteMutation: 'none' | 'price_changed' | 'sold_out'
  /** How the simulated payment settles. */
  orderOutcome: 'confirmed' | 'rejected' | 'pending'
  /** Delay before the order settles after creation (ms). */
  orderSettleDelayMs: number
  /** Extra delay on POST /orders response (ms). Larger than the Axios timeout => timeout. */
  orderResponseDelayMs: number
  /** Simulated wallet connection outcome at checkout. */
  walletConnection: 'connected' | 'rejected' | 'disconnect_after'
}

const BASE: ScenarioConfig = {
  id: 'default',
  label: 'Padrão',
  description: 'Latência baixa, pagamento confirmado, todos os fluxos funcionam.',
  latency: { min: 120, max: 350 },
  outOfOrder: false,
  networkErrorMatch: null,
  failures: [],
  sessionTtlMs: 8 * 60 * 60 * 1000,
  emptyCatalog: false,
  registerConflict: false,
  coupon: 'normal',
  quoteMutation: 'none',
  orderOutcome: 'confirmed',
  orderSettleDelayMs: 2500,
  orderResponseDelayMs: 0,
  walletConnection: 'connected',
}

function scenario(
  partial: Partial<ScenarioConfig> & Pick<ScenarioConfig, 'id' | 'label' | 'description'>,
): ScenarioConfig {
  return { ...BASE, ...partial }
}

export const SCENARIOS: ScenarioConfig[] = [
  BASE,
  scenario({
    id: 'empty-catalog',
    label: 'Catálogo vazio',
    description: 'A listagem de NFTs retorna zero resultados.',
    emptyCatalog: true,
  }),
  scenario({
    id: 'slow-network',
    label: 'Rede lenta',
    description: 'Latência alta (2 a 4 s) em todas as respostas para observar skeletons.',
    latency: { min: 2000, max: 4000 },
  }),
  scenario({
    id: 'variable-latency',
    label: 'Latência variável',
    description: 'Latência aleatória (100 ms a 3 s) e respostas de listagem fora de ordem.',
    latency: { min: 100, max: 3000 },
    outOfOrder: true,
  }),
  scenario({
    id: 'network-error',
    label: 'Falha de conexão',
    description: 'Toda requisição REST falha como erro de rede.',
    networkErrorMatch: /.*/,
  }),
  scenario({
    id: 'catalog-network-error-once',
    label: 'Falha de rede no catálogo (1x)',
    description:
      'As três primeiras tentativas de listar o catálogo falham com 503; a nova tentativa manual funciona.',
    failures: [
      {
        // Only the catalog list (the featured query starts with `featured=`). Three failures
        // exhaust the automatic retries of TanStack Query so the error state is shown.
        match: /GET \/api\/nfts\?(?!.*featured=true)/,
        status: 503,
        code: 'service_unavailable',
        message: 'Serviço temporariamente indisponível.',
        times: 3,
      },
    ],
  }),
  scenario({
    id: 'server-error',
    label: 'Erro 500',
    description: 'Listagem e detalhe de NFT respondem 500.',
    failures: [
      {
        match: /GET \/api\/nfts/,
        status: 500,
        code: 'internal_error',
        message: 'Erro interno do servidor simulado.',
      },
    ],
  }),
  scenario({
    id: 'favorites-fail',
    label: 'Falha ao favoritar',
    description: 'Mutations de favoritos respondem 500 (testa rollback otimista).',
    failures: [
      {
        match: /(POST|DELETE) \/api\/favorites/,
        status: 500,
        code: 'internal_error',
        message: 'Não foi possível atualizar favoritos.',
      },
    ],
  }),
  scenario({
    id: 'session-expired',
    label: 'Sessão expira rápido',
    description: 'Sessões duram 15 segundos; depois disso as rotas privadas respondem 401.',
    sessionTtlMs: 15_000,
  }),
  scenario({
    id: 'unauthorized',
    label: 'Acesso não autorizado',
    description: 'Rotas privadas respondem 403 mesmo com sessão válida.',
    failures: [
      {
        match: /(GET|POST|PUT|PATCH|DELETE) \/api\/(favorites|orders|profile|wallets)/,
        status: 403,
        code: 'forbidden',
        message: 'Sua conta não tem permissão para esta operação.',
      },
    ],
  }),
  scenario({
    id: 'register-conflict',
    label: 'Conflito no cadastro',
    description: 'Qualquer cadastro responde 409 (e-mail já utilizado).',
    registerConflict: true,
  }),
  scenario({
    id: 'validation-errors',
    label: 'Erros de validação da API',
    description: 'Perfil e carteiras respondem 422 com erros por campo.',
    failures: [
      {
        match: /(PATCH|POST|PUT) \/api\/(profile|wallets)/,
        status: 422,
        code: 'validation_error',
        message: 'Revise os campos destacados.',
      },
    ],
  }),
  scenario({
    id: 'coupon-invalid',
    label: 'Cupom inválido',
    description: 'Qualquer cupom é rejeitado como inexistente.',
    coupon: 'invalid',
  }),
  scenario({
    id: 'coupon-expired',
    label: 'Cupom expirado',
    description: 'Qualquer cupom é rejeitado como expirado.',
    coupon: 'expired',
  }),
  scenario({
    id: 'price-changed',
    label: 'Preço alterado na compra',
    description: 'Ao cotar no checkout, o primeiro item sobe de preço (evento nft.updated).',
    quoteMutation: 'price_changed',
  }),
  scenario({
    id: 'sold-out',
    label: 'Edição esgotada na compra',
    description: 'Ao cotar no checkout, o primeiro item fica esgotado (evento nft.updated).',
    quoteMutation: 'sold_out',
  }),
  scenario({
    id: 'order-timeout',
    label: 'Timeout após criar pedido',
    description:
      'POST /orders demora mais que o timeout do cliente; o pedido existe e é recuperado pela chave de idempotência.',
    orderResponseDelayMs: 20_000,
    orderSettleDelayMs: 4000,
  }),
  scenario({
    id: 'payment-rejected',
    label: 'Pagamento recusado',
    description: 'O pedido é criado e recusado pela simulação de pagamento.',
    orderOutcome: 'rejected',
  }),
  scenario({
    id: 'order-pending-long',
    label: 'Pedido pendente (lento)',
    description: 'O pagamento leva 25 s para confirmar; use para testar desconexão e refresh.',
    orderSettleDelayMs: 25_000,
  }),
  scenario({
    id: 'wallet-rejected',
    label: 'Carteira recusa conexão',
    description: 'A simulação de conexão da carteira é recusada pelo usuário.',
    walletConnection: 'rejected',
  }),
  scenario({
    id: 'wallet-disconnect',
    label: 'Carteira desconecta',
    description: 'A carteira conecta e desconecta alguns segundos depois.',
    walletConnection: 'disconnect_after',
  }),
]

export const DEFAULT_SCENARIO_ID = BASE.id

export function getScenario(id: string | null | undefined): ScenarioConfig {
  return SCENARIOS.find((s) => s.id === id) ?? BASE
}

export function listScenarios() {
  return SCENARIOS.map(({ id, label, description }) => ({ id, label, description }))
}
