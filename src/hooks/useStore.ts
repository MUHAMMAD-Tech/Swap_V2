import { useSyncExternalStore, useMemo } from 'react';
import * as swapStore from '../store/swapStore';
import { TokenInfo } from '../types';

const emptyTokens: TokenInfo[] = [];

export function useSwapState() {
  return useSyncExternalStore(
    swapStore.subscribe,
    swapStore.getState,
    swapStore.getState
  );
}

export function useView() {
  return useSyncExternalStore(
    swapStore.subscribe,
    swapStore.getView,
    swapStore.getView
  );
}

export function useChains() {
  return useSyncExternalStore(
    swapStore.subscribe,
    swapStore.getChains,
    swapStore.getChains
  );
}

export function useTokensState() {
  return useSyncExternalStore(
    swapStore.subscribe,
    swapStore.getTokensState,
    swapStore.getTokensState
  );
}

export function useTokens(chainId: string | undefined): TokenInfo[] {
  const tokensState = useTokensState();
  return useMemo(() => {
    if (!chainId) return emptyTokens;
    return tokensState.data[chainId] || emptyTokens;
  }, [tokensState, chainId]);
}

const actions = {
  setView: swapStore.setView,
  setChains: swapStore.setChains,
  setTokens: swapStore.setTokens,
  addUserToken: swapStore.addUserToken,
  loadUserTokens: swapStore.loadUserTokens,
  setSelectedChain: swapStore.setSelectedChain,
  setSellToken: swapStore.setSellToken,
  setBuyToken: swapStore.setBuyToken,
  setSellAmount: swapStore.setSellAmount,
  setQuote: swapStore.setQuote,
  setLoadingQuote: swapStore.setLoadingQuote,
  setSlippage: swapStore.setSlippage,
  setTxStatus: swapStore.setTxStatus,
  setTxHash: swapStore.setTxHash,
  setError: swapStore.setError,
  swapTokens: swapStore.swapTokens,
  resetSwap: swapStore.resetSwap,
};

export function useSwapActions() {
  return actions;
}
