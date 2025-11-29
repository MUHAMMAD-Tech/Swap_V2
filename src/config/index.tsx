import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, optimism, base, linea, solana } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

export const projectId = 'd8e3dff41439cfcce2d989139519cd49'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const metadata = {
  name: 'Lethex',
  description: 'Multi-chain Swap Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://lethex.app',
  icons: ['https://raw.githubusercontent.com/MUHAMMAD-Tech/let/refs/heads/main/favicon.svg']
}

export const networks = [mainnet, arbitrum, optimism, base, linea, solana] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const solanaWeb3JsAdapter = new SolanaAdapter()

export const config = wagmiAdapter.wagmiConfig

export const CHAIN_ID_TO_NAME: Record<number | string, string> = {
  1: 'ethereum',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
  59144: 'linea',
  'solana': 'solana',
  'solana-mainnet': 'solana'
}

export const NAME_TO_CHAIN_ID: Record<string, number | string> = {
  'ethereum': 1,
  'arbitrum': 42161,
  'optimism': 10,
  'base': 8453,
  'linea': 59144,
  'solana': 'solana'
}
