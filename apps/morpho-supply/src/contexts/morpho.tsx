"use client";

import { type PropsWithChildren, createContext, useContext } from "react";

import {
  type MorphoMarket,
  useIFrameContext,
  useMorphoMarkets,
} from "@bleu/cow-hooks-ui";

export interface MorphoContextData {
  markets: MorphoMarket[] | undefined;
}

// Create the context with a default empty value
const MorphoContext = createContext<MorphoContextData>({
  markets: undefined,
});

// Custom hook to use the context
export const useMorphoContext = () => useContext(MorphoContext);

export function MorphoContextProvider({ children }: PropsWithChildren) {
  const { context } = useIFrameContext();

  // Get markets data from useMorphoMarkets
  const { data: markets } = useMorphoMarkets(
    {},
    context?.chainId,
    context?.account,
  );

  // Create the value object to be provided by the context
  const contextValue: MorphoContextData = {
    markets,
  };

  return (
    <MorphoContext.Provider value={contextValue}>
      {children}
    </MorphoContext.Provider>
  );
}
