import { ChainConfig, TokenInfo, QuoteResponse, SwapState, SwapView } from '../types';

type Listener = () => void;

interface TokensState {
  version: number;
  data: Record<string, TokenInfo[]>;
}

interface Store {
  state: SwapState;
  view: SwapView;
  chains: ChainConfig[];
  tokens: Record<string, TokenInfo[]>;
  userTokens: Record<string, TokenInfo[]>;
  tokensState: TokensState;
  listeners: Set<Listener>;
}

const initialState: SwapState = {
  selectedChain: null,
  sellToken: null,
  buyToken: null,
  sellAmount: '',
  quote: null,
  isLoadingQuote: false,
  slippage: 0.5,
  txStatus: 'idle',
  txHash: null,
  error: null,
};

const store: Store = {
  state: { ...initialState },
  view: 'swap',
  chains: [],
  tokens: {},
  userTokens: {},
  tokensState: { version: 0, data: {} },
  listeners: new Set(),
};

function notify() {
  store.listeners.forEach(listener => listener());
}

function updateMergedTokens(chainId: string) {
  const defaultTokens = store.tokens[chainId] || [];
  const userTokens = store.userTokens[chainId] || [];
  store.tokensState = {
    version: store.tokensState.version + 1,
    data: {
      ...store.tokensState.data,
      [chainId]: [...defaultTokens, ...userTokens]
    }
  };
}

export function subscribe(listener: Listener): () => void {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

export function getState(): SwapState {
  return store.state;
}

export function getView(): SwapView {
  return store.view;
}

export function getChains(): ChainConfig[] {
  return store.chains;
}

export function getTokensState(): TokensState {
  return store.tokensState;
}

export function getTokensForChain(chainId: string): TokenInfo[] {
  return store.tokensState.data[chainId] || [];
}

export function setView(view: SwapView) {
  store.view = view;
  notify();
}

export function setChains(chains: ChainConfig[]) {
  store.chains = chains;
  notify();
}

export function setTokens(chainId: string, tokens: TokenInfo[]) {
  store.tokens[chainId] = tokens;
  updateMergedTokens(chainId);
  notify();
}

export function addUserToken(chainId: string, token: TokenInfo) {
  if (!store.userTokens[chainId]) {
    store.userTokens[chainId] = [];
  }
  const exists = store.userTokens[chainId].some(
    t => t.address.toLowerCase() === token.address.toLowerCase()
  );
  if (!exists) {
    store.userTokens[chainId].push({ ...token, isUserAdded: true });
    updateMergedTokens(chainId);
    try {
      localStorage.setItem('lethex_user_tokens', JSON.stringify(store.userTokens));
    } catch {}
    notify();
  }
}

export function loadUserTokens() {
  try {
    const saved = localStorage.getItem('lethex_user_tokens');
    if (saved) {
      store.userTokens = JSON.parse(saved);
      Object.keys(store.userTokens).forEach(chainId => {
        updateMergedTokens(chainId);
      });
      notify();
    }
  } catch (e) {
    console.error('Failed to load user tokens:', e);
  }
}

export function setSelectedChain(chain: ChainConfig | null) {
  store.state = {
    ...store.state,
    selectedChain: chain,
    sellToken: chain?.nativeToken || null,
    buyToken: null,
    quote: null,
    error: null
  };
  notify();
}

export function setSellToken(token: TokenInfo | null) {
  store.state = {
    ...store.state,
    sellToken: token,
    quote: null
  };
  notify();
}

export function setBuyToken(token: TokenInfo | null) {
  store.state = {
    ...store.state,
    buyToken: token,
    quote: null
  };
  notify();
}

export function setSellAmount(amount: string) {
  store.state = {
    ...store.state,
    sellAmount: amount
  };
  notify();
}

export function setQuote(quote: QuoteResponse | null) {
  store.state = {
    ...store.state,
    quote,
    isLoadingQuote: false
  };
  notify();
}

export function setLoadingQuote(loading: boolean) {
  store.state = {
    ...store.state,
    isLoadingQuote: loading
  };
  notify();
}

export function setSlippage(slippage: number) {
  store.state = {
    ...store.state,
    slippage
  };
  notify();
}

export function setTxStatus(status: SwapState['txStatus']) {
  store.state = {
    ...store.state,
    txStatus: status
  };
  notify();
}

export function setTxHash(hash: string | null) {
  store.state = {
    ...store.state,
    txHash: hash
  };
  notify();
}

export function setError(error: string | null) {
  store.state = {
    ...store.state,
    error
  };
  notify();
}

export function swapTokens() {
  const temp = store.state.sellToken;
  store.state = {
    ...store.state,
    sellToken: store.state.buyToken,
    buyToken: temp,
    sellAmount: '',
    quote: null
  };
  notify();
}

export function resetSwap() {
  store.state = {
    ...store.state,
    sellAmount: '',
    quote: null,
    txStatus: 'idle',
    txHash: null,
    error: null,
  };
  notify();
}
