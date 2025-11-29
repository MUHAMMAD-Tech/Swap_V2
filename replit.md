# Lethex - Multi-chain Swap Platform

## Overview
Lethex is a production-ready multi-chain token swap application that supports same-chain swaps across multiple blockchain ecosystems. The platform integrates with major DEX aggregators and applies a 0.08% trading fee.

**Tech Stack:**
- Frontend: React 19, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Wallet: Reown AppKit (formerly WalletConnect)
- State: Custom store with useSyncExternalStore
- DEX Aggregators: Uniswap (EVM), Jupiter (Solana)

**Supported Chains:**
- EVM: Ethereum, Arbitrum, Optimism, Base, Linea
- Non-EVM: Solana, Sui (coming soon)

**Current Status:** Running - Frontend on port 5000, Backend on port 3001

## Project Structure
```
├── server/                    # Backend Express server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── chain-registry/   # Chain configuration
│   │   │   ├── token-registry/   # Token lists
│   │   │   ├── fee-engine/       # 0.08% fee calculation
│   │   │   ├── swap-core/        # Swap execution
│   │   │   └── history-service/  # Transaction history
│   │   ├── config/
│   │   │   └── constants.ts      # Fee wallets, amounts
│   │   └── index.ts              # Server entry
│   └── package.json
├── src/                       # Frontend React app
│   ├── components/
│   │   ├── common/              # Layout, Modal
│   │   ├── swap/                # SwapPage, TokenSelector, ChainSelector
│   │   └── dashboard/           # Dashboard component
│   ├── hooks/                   # useStore hooks
│   ├── store/                   # swapStore (state management)
│   ├── services/                # API service layer
│   ├── config/                  # AppKit configuration
│   └── types/                   # TypeScript interfaces
├── vite.config.ts             # Vite with API proxy
└── package.json               # Concurrent dev scripts
```

## Recent Changes (Nov 29, 2025)
- Complete architecture with modular backend/frontend
- Implemented fee engine with 0.08% fee (FEE_PERCENT = 0.0008)
- Configured fee wallets:
  - EVM: 0xBB9aFDf086B0d33421086b1D464DaEA1CB197D7E
  - Solana: HeNZH4vEc2htjYSPU9drniGkjbm9h1LotSKkVnb3VWed
  - Sui: 0xb493de737f46082a2020ab1f6f06dbb07be074b67b6fb152a4eb169cbbba01ac
- WalletConnect integration with projectId d8e3dff41439cfcce2d989139519cd49
- Token selector with search and custom token validation
- Dashboard for swap history and statistics
- Fixed infinite loop issues in React hooks using proper memoization

## Development Setup

### Running the Application
Both frontend and backend start concurrently:
```bash
npm run dev
```
- Frontend: http://localhost:5000 (Vite dev server)
- Backend: http://localhost:3001 (Express API)

### API Endpoints
- GET /api/chains - List supported chains
- GET /api/tokens/:chainId - Get tokens for chain
- POST /api/tokens/validate - Validate custom token
- POST /api/quote - Get swap quote with fee
- POST /api/swap - Execute swap
- GET /api/history - Get swap history
- GET /api/stats - Get aggregated statistics

### Environment Variables
- WalletConnect projectId is hardcoded for development
- For production: Register domain at https://dashboard.reown.com

## Architecture Notes
- Backend handles fee calculations server-side for security
- Vite proxy forwards /api requests to backend
- Custom store pattern avoids Redux complexity
- Token lists cached with user tokens in localStorage
- Chain registry supports easy addition of new chains

## Fee Configuration
- Fee Percent: 0.08% (0.0008)
- Minimum Fee: Chain-specific (configurable)
- Maximum Fee: Chain-specific (configurable)
- Fee collected before swap execution

## User Preferences
None documented yet.
