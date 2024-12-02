import type { RawTokenData } from "#/types";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { combineTokenLists } from "./combineTokenLists";

// Constants
const STORAGE_KEY = "hookDapp:withdrawUniswapV2Cache:v1" as const;

const buildKey = (chainId: SupportedChainId, account: string) => {
  return `${STORAGE_KEY}:${chainId}-${account.toLowerCase()}`;
};

// Check if window is defined (for SSR compatibility)
const isBrowser = typeof window !== "undefined";

export const storeExtraTokens = (
  newTokens: RawTokenData[],
  chainId: SupportedChainId,
  account: string,
) => {
  if (!isBrowser) return;

  if (!newTokens) {
    console.error("[storePermitCacheAtom] Missing required newTokens");
    return;
  }

  if (!chainId) {
    console.error("[storePermitCacheAtom] Missing required chainId");
    return;
  }

  if (!account) {
    console.error("[storePermitCacheAtom] Missing required account");
    return;
  }

  if (
    chainId !== SupportedChainId.MAINNET &&
    chainId !== SupportedChainId.ARBITRUM_ONE
  ) {
    console.error(`[storePermitCacheAtom] Unsupported chain: ${chainId}`);
    return;
  }

  const cachedTokens = getExtraTokens(chainId, account);

  const newCache = combineTokenLists(cachedTokens, newTokens);

  localStorage.setItem(buildKey(chainId, account), JSON.stringify(newCache));
};

export const getExtraTokens = (chainId: SupportedChainId, account: string) => {
  if (!isBrowser) return [];

  if (!chainId) {
    console.error("[storePermitCacheAtom] Missing required chainId");
    return [];
  }

  if (!account) {
    console.error("[storePermitCacheAtom] Missing required account");
    return [];
  }

  if (
    chainId !== SupportedChainId.MAINNET &&
    chainId !== SupportedChainId.ARBITRUM_ONE
  ) {
    console.error(`[storePermitCacheAtom] Unsupported chain: ${chainId}`);
    return [];
  }

  try {
    const item = localStorage.getItem(buildKey(chainId, account));
    return item !== null ? (JSON.parse(item) as RawTokenData[]) : [];
  } catch (e) {
    console.error("[Storage] Error getting item:", e);
    return [];
  }
};
