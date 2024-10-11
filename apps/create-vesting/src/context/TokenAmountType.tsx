"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";

type TokenAmountType = {
  vestAllFromSwap: boolean;
  setVestAllFromSwap: (vestAllFromSwap: boolean) => void;
};

export const TokenAmountTypeContext = createContext({} as TokenAmountType);

export function TokenAmountTypeProvider({ children }: PropsWithChildren) {
  const [vestAllFromSwap, setVestAllFromSwap] = useState<boolean>(false);

  return (
    <TokenAmountTypeContext.Provider
      value={{
        vestAllFromSwap,
        setVestAllFromSwap,
      }}
    >
      {children}
    </TokenAmountTypeContext.Provider>
  );
}

export function useTokenAmountTypeContext() {
  const context = useContext(TokenAmountTypeContext);

  return context;
}
