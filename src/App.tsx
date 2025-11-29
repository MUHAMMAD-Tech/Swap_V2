import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from './config'
import { Layout } from './components/common/Layout'
import { SwapPage } from './components/swap/SwapPage'
import { Dashboard } from './components/dashboard/Dashboard'
import { useView } from './hooks/useStore'
import './App.css'

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: 'dark' as const,
  features: {
    analytics: true
  },
  themeVariables: {
    '--w3m-accent': '#6366f1',
    '--w3m-border-radius-master': '12px'
  }
}

createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  ...generalConfig,
})

function AppContent() {
  const view = useView()

  return (
    <Layout>
      {view === 'swap' && <SwapPage />}
      {view === 'dashboard' && <Dashboard />}
    </Layout>
  )
}

export function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
