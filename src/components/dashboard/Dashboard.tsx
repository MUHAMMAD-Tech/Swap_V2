import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { api } from '../../services/api';
import { SwapRecord } from '../../types';
import { formatTimestamp, truncateAddress } from '../../utils/format';
import './Dashboard.css';

interface WalletStats {
  totalSwaps: number;
  byChain: Record<string, number>;
}

export function Dashboard() {
  const [history, setHistory] = useState<SwapRecord[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    async function loadData() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const [historyData, statsData] = await Promise.all([
          api.getSwapHistory(address),
          api.getSwapStats(address),
        ]);
        setHistory(historyData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="dashboard">
        <div className="dashboard-connect">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to view swap history</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loader" />
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="wallet-address">{truncateAddress(address || '')}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Swaps</span>
          <span className="stat-value">{stats?.totalSwaps || 0}</span>
        </div>
        {stats?.byChain && Object.entries(stats.byChain).map(([chain, count]) => (
          <div key={chain} className="stat-card">
            <span className="stat-label">{chain}</span>
            <span className="stat-value">{count} swaps</span>
          </div>
        ))}
      </div>

      <div className="history-section">
        <h2>Swap History</h2>
        
        {history.length === 0 ? (
          <div className="no-history">
            <p>No swaps yet</p>
            <p className="no-history-sub">Your swap history will appear here</p>
          </div>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <span>Time</span>
              <span>From</span>
              <span>To</span>
              <span>Fee</span>
              <span>Status</span>
            </div>
            
            {history.map(swap => (
              <div key={swap.id} className="history-row">
                <span className="history-time">
                  {formatTimestamp(swap.timestamp)}
                </span>
                <span className="history-token">
                  <strong>{swap.fromToken.amountFormatted}</strong>
                  <span className="token-symbol">{swap.fromToken.symbol}</span>
                </span>
                <span className="history-token">
                  <strong>{swap.toToken.amountFormatted}</strong>
                  <span className="token-symbol">{swap.toToken.symbol}</span>
                </span>
                <span className="history-fee">
                  {swap.feeFormatted}
                </span>
                <span className={`history-status status-${swap.status}`}>
                  {swap.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
