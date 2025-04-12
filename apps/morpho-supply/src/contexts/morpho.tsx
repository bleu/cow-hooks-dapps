"use client";

import { type PropsWithChildren, createContext, useContext } from "react";

import {
  type MorphoMarket,
  useIFrameContext,
  useMorphoMarkets,
} from "@bleu/cow-hooks-ui";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "./form";

export interface MorphoContextData {
  market: MorphoMarket | undefined;
  markets: MorphoMarket[] | undefined;
}

// Create the context with a default empty value
const MorphoContext = createContext<MorphoContextData>({
  market: undefined,
  markets: undefined,
});

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

  const { control } = useFormContext<MorphoSupplyFormData>();
  const { market: selectedMarket } = useWatch({ control });

  // Create the value object to be provided by the context
  const contextValue: MorphoContextData = {
    market: selectedMarket as MorphoMarket | undefined,
    markets,
  };

  return (
    <MorphoContext.Provider value={contextValue}>
      {children}
    </MorphoContext.Provider>
  );
}
