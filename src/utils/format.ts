export function formatAmount(amount: string, decimals: number): string {
  const value = Number(amount) / Math.pow(10, decimals);
  if (value === 0) return '0';
  if (value < 0.000001) return '<0.000001';
  if (value < 1) return value.toFixed(6);
  if (value < 1000) return value.toFixed(4);
  if (value < 1000000) return value.toFixed(2);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function parseAmount(amount: string, decimals: number): string {
  if (!amount || amount === '0') return '0';
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  const combined = whole + paddedFraction;
  return BigInt(combined).toString();
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatGas(gas: string): string {
  const gasNum = Number(gas);
  if (gasNum < 1000) return gas;
  return `${(gasNum / 1000).toFixed(1)}k`;
}
