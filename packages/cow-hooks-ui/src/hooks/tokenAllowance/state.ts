import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { PermitHookData } from "@cowprotocol/permit-utils";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

// Types
export interface PermitCacheKeyParams {
  chainId: SupportedChainId;
  tokenAddress: string;
  account?: string;
  nonce?: number;
  spender: string;
}

export type StorePermitCacheParams = PermitCacheKeyParams & {
  hookData: PermitHookData;
};

export interface CachedPermitData {
  hookData: PermitHookData;
  nonce?: number;
}

export type PermitCache = Record<string, string>;

// Constants
const STORAGE_KEY = "hookDapp:userPermitCache:v1" as const;

// Check if window is defined (for SSR compatibility)
const isBrowser = typeof window !== "undefined";

// Create a storage that's SSR-safe
const storage = createJSONStorage<PermitCache>(() => ({
  getItem: (key) => {
    if (!isBrowser) return null;

    try {
      const item = localStorage.getItem(key);
      return item;
    } catch (e) {
      console.error("[Storage] Error getting item:", e);
      return null;
    }
  },
  setItem: (key, value) => {
    if (!isBrowser) return;

    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("[Storage] Error setting item:", e);
    }
  },
  removeItem: (key) => {
    if (!isBrowser) return;

    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("[Storage] Error removing item:", e);
    }
  },
}));

// Helper functions
const safeJsonParse = <T>(str: string): T | undefined => {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    console.error("[PermitCache] Failed to parse JSON:", e);
    return undefined;
  }
};

const safeJsonStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error("[PermitCache] Failed to stringify data:", e);
    return "{}";
  }
};

const buildKey = ({
  chainId,
  tokenAddress,
  account,
  spender,
}: PermitCacheKeyParams): string => {
  if (!tokenAddress || !spender) {
    throw new Error(
      "Required parameters missing: tokenAddress and spender are required",
    );
  }

  const base = `${chainId}-${tokenAddress.toLowerCase()}-${spender.toLowerCase()}`;
  return account ? `${base}-${account.toLowerCase()}` : base;
};

const removePermitCacheBuilder =
  (key: string) =>
  (permitCache: PermitCache): PermitCache => {
    const { [key]: _, ...newPermitCache } = { ...permitCache };
    return newPermitCache;
  };

export const getStoredPermitCache = (): PermitCache => {
  if (!isBrowser) return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed;
  } catch (e) {
    console.error("[PermitCache] Failed to read from storage:", e);
    return {};
  }
};

// Atoms
export const userPermitCacheAtom = atomWithStorage<PermitCache>(
  STORAGE_KEY,
  getStoredPermitCache(), // Initialize with current storage value
  storage,
  {
    getOnInit: true,
  },
);

export const storePermitCacheAtom = atom(
  null,
  (get, set, params: StorePermitCacheParams) => {
    if (!params?.hookData) {
      console.error("[storePermitCacheAtom] Missing required hookData");
      return;
    }

    const key = buildKey(params);
    const dataToCache: CachedPermitData = {
      hookData: params.hookData,
      nonce: params.nonce,
    };

    const currentCache = get(userPermitCacheAtom);

    const newCache = {
      ...currentCache,
      [key]: safeJsonStringify(dataToCache),
    };
    set(userPermitCacheAtom, newCache);
  },
);

export const getPermitCacheAtom = atom(
  null,
  (get, set, params: PermitCacheKeyParams) => {
    const permitCache = get(userPermitCacheAtom);

    const key = buildKey(params);
    const cachedData = permitCache[key];

    if (!cachedData) {
      return undefined;
    }

    try {
      const parsedData = safeJsonParse<CachedPermitData>(cachedData);

      if (!parsedData) {
        set(userPermitCacheAtom, removePermitCacheBuilder(key));
        return undefined;
      }

      const { hookData, nonce: storedNonce } = parsedData;

      // Check nonce validity for user-specific permits
      if (
        params.account &&
        params.nonce !== undefined &&
        storedNonce !== undefined
      ) {
        if (storedNonce < params.nonce) {
          set(userPermitCacheAtom, removePermitCacheBuilder(key));
          return undefined;
        }
      }

      return hookData;
    } catch (e) {
      console.error("[getPermitCacheAtom] Failed to parse cached data:", e);
      set(userPermitCacheAtom, removePermitCacheBuilder(key));
      return undefined;
    }
  },
);
