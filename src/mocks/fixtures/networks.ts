import type { NetworkId, NetworkInfo } from '@/types/api'

export const NETWORKS: Record<NetworkId, NetworkInfo> = {
  ethereum: {
    id: 'ethereum',
    label: 'Ethereum Mainnet',
    feeEth: '0.0025',
    explorerBaseUrl: 'https://explorer.example/eth/tx/',
  },
  polygon: {
    id: 'polygon',
    label: 'Polygon',
    feeEth: '0.0005',
    explorerBaseUrl: 'https://explorer.example/polygon/tx/',
  },
  arbitrum: {
    id: 'arbitrum',
    label: 'Arbitrum One',
    feeEth: '0.001',
    explorerBaseUrl: 'https://explorer.example/arbitrum/tx/',
  },
}

export const NETWORK_LIST = Object.values(NETWORKS)
