import type { RawTokenData } from "#/types";
import { combineTokenLists } from "./combineTokenLists";

// Constants
const STORAGE_KEY = "hookDapp:withdrawUniswapV2Cache:v1" as const;

// Check if window is defined (for SSR compatibility)
const isBrowser = typeof window !== "undefined";

export const storeExtraTokens = (newTokens: RawTokenData[]) => {
  if (!isBrowser) return [];

  if (!newTokens) {
    console.error("[storePermitCacheAtom] Missing required newTokens");
    return;
  }

  const currentExtraTokens = getExtraTokens();

  const newCache = combineTokenLists(currentExtraTokens, newTokens);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newCache));
};

export const getExtraTokens = () => {
  if (!isBrowser) return [];

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item !== null ? (JSON.parse(item) as RawTokenData[]) : [];
  } catch (e) {
    console.error("[Storage] Error getting item:", e);
    return [];
  }
};
