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
  isCowShedAuthorizedOnMorpho: boolean | undefined;
}

// Create the context with a default empty value
const MorphoContext = createContext<MorphoContextData>({} as MorphoContextData);

// Custom hook to use the context
export const useMorphoContext = () => useContext(MorphoContext);

export function MorphoContextProvider({ children }: PropsWithChildren) {
  const { context, publicClient } = useIFrameContext();

  // Get markets data from useMorphoMarkets
  const { data: markets } = useMorphoMarkets(
    context?.account,
    publicClient,
    context?.chainId,
  );

  const isCowShedAuthorizedOnMorpho = useIsCowShedAuthorizedOnMorpho();

  // Create the value object to be provided by the context
  const contextValue: MorphoContextData = {
    markets,
    isCowShedAuthorizedOnMorpho,
  };

  return (
    <MorphoContext.Provider value={contextValue}>
      {children}
    </MorphoContext.Provider>
  );
}
