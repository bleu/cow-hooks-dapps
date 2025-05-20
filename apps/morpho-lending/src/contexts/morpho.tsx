"use client";

import { type PropsWithChildren, createContext, useContext } from "react";

import {
  type MorphoMarket,
  useIFrameContext,
  useMorphoMarkets,
} from "@bleu/cow-hooks-ui";
import { useIsCowShedAuthorizedOnMorpho } from "#/hooks/useAllowCowShedOnMorpho";

export interface MorphoContextData {
  markets: MorphoMarket[] | undefined;
  isLoadingMarkets: boolean;
  isLoadingIsCowShedAuthorizedOnMorpho: boolean;
  errorMarkets: Error | undefined;
  isCowShedAuthorizedOnMorpho: boolean | undefined;
  userNonce: bigint | undefined;
}

// Create the context with a default empty value
const MorphoContext = createContext<MorphoContextData>({} as MorphoContextData);

// Custom hook to use the context
export const useMorphoContext = () => useContext(MorphoContext);

export function MorphoContextProvider({ children }: PropsWithChildren) {
  const { context, publicClient } = useIFrameContext();

  // Get markets data from useMorphoMarkets
  const {
    data: markets,
    isLoading: isLoadingMarkets,
    error: errorMarkets,
  } = useMorphoMarkets(context?.account, publicClient, context?.chainId);

  const { data, isLoading: isLoadingIsCowShedAuthorizedOnMorpho } =
    useIsCowShedAuthorizedOnMorpho();
  const { isProxyAuthorized: isCowShedAuthorizedOnMorpho, userNonce } =
    data ?? {};

  // Create the value object to be provided by the context
  const contextValue: MorphoContextData = {
    markets,
    isLoadingMarkets,
    isLoadingIsCowShedAuthorizedOnMorpho,
    errorMarkets,
    isCowShedAuthorizedOnMorpho,
    userNonce,
  };

  return (
    <MorphoContext.Provider value={contextValue}>
      {children}
    </MorphoContext.Provider>
  );
}
