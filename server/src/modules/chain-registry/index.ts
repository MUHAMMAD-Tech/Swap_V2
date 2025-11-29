import { RPC_URLS, CHAIN_IDS } from '../../config/constants.js';

export interface ChainConfig {
  id: string;
  chainId: number | string;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
  logoUrl: string;
  type: 'evm' | 'solana' | 'sui';
  isTestnet: boolean;
  nativeToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logoUrl: string;
  };
}

const CHAINS: ChainConfig[] = [
  {
    id: 'ethereum',
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: RPC_URLS.ethereum,
    explorerUrl: 'https://etherscan.io',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    type: 'evm',
    isTestnet: false,
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    }
  },
  {
    id: 'arbitrum',
    chainId: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: RPC_URLS.arbitrum,
    explorerUrl: 'https://arbiscan.io',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
    type: 'evm',
    isTestnet: false,
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    }
  },
  {
    id: 'optimism',
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: RPC_URLS.optimism,
    explorerUrl: 'https://optimistic.etherscan.io',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
    type: 'evm',
    isTestnet: false,
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    }
  },
  {
    id: 'base',
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: RPC_URLS.base,
    explorerUrl: 'https://basescan.org',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    type: 'evm',
    isTestnet: false,
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    }
  },
  {
    id: 'linea',
    chainId: 59144,
    name: 'Linea',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: RPC_URLS.linea,
    explorerUrl: 'https://lineascan.build',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png',
    type: 'evm',
    isTestnet: false,
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    }
  },
  {
    id: 'solana',
    chainId: 'solana-mainnet',
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    rpcUrl: RPC_URLS.solana,
    explorerUrl: 'https://solscan.io',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    type: 'solana',
    isTestnet: false,
    nativeToken: {
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      address: 'So11111111111111111111111111111111111111112',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png'
    }
  },
  {
    id: 'sui',
    chainId: 'sui-mainnet',
    name: 'Sui',
    symbol: 'SUI',
    decimals: 9,
    rpcUrl: RPC_URLS.sui,
    explorerUrl: 'https://suiscan.xyz',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png',
    type: 'sui',
    isTestnet: false,
    nativeToken: {
      symbol: 'SUI',
      name: 'Sui',
      decimals: 9,
      address: '0x2::sui::SUI',
      logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png'
    }
  }
];

export class ChainRegistry {
  private chains: Map<string, ChainConfig> = new Map();

  constructor() {
    CHAINS.forEach(chain => {
      this.chains.set(chain.id, chain);
    });
  }

  getChain(chainId: string): ChainConfig | undefined {
    return this.chains.get(chainId);
  }

  getChainByChainId(chainId: number | string): ChainConfig | undefined {
    return Array.from(this.chains.values()).find(c => c.chainId === chainId);
  }

  getAllChains(): ChainConfig[] {
    return Array.from(this.chains.values());
  }

  getEVMChains(): ChainConfig[] {
    return this.getAllChains().filter(c => c.type === 'evm');
  }

  getSolanaChains(): ChainConfig[] {
    return this.getAllChains().filter(c => c.type === 'solana');
  }

  getSuiChains(): ChainConfig[] {
    return this.getAllChains().filter(c => c.type === 'sui');
  }

  isEVMChain(chainId: string): boolean {
    const chain = this.getChain(chainId);
    return chain?.type === 'evm';
  }
}

export const chainRegistry = new ChainRegistry();
