export const FEE_PERCENT = 0.0008;

export const FEE_WALLETS = {
  evmDefault: '0xBB9aFDf086B0d33421086b1D464DaEA1CB197D7E',
  solana: 'HeNZH4vEc2htjYSPU9drniGkjbm9h1LotSKkVnb3VWed',
  sui: '0xb493de737f46082a2020ab1f6f06dbb07be074b67b6fb152a4eb169cbbba01ac'
} as const;

export const RPC_URLS: Record<string, string> = {
  ethereum: 'https://eth.llamarpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  base: 'https://mainnet.base.org',
  linea: 'https://rpc.linea.build',
  solana: 'https://api.mainnet-beta.solana.com',
  sui: 'https://fullnode.mainnet.sui.io'
};

export const CHAIN_IDS: Record<string, number | string> = {
  ethereum: 1,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  linea: 59144,
  solana: 'solana-mainnet',
  sui: 'sui-mainnet'
};

export const ZERO_X_API_URLS: Record<number, string> = {
  1: 'https://api.0x.org',
  42161: 'https://arbitrum.api.0x.org',
  10: 'https://optimism.api.0x.org',
  8453: 'https://base.api.0x.org',
  59144: 'https://linea.api.0x.org'
};

export const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';
