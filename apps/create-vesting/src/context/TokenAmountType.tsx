"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type TokenAmountType = {
  vestAllFromSwap: boolean;
  setVestAllFromSwap: (vestAllFromSwap: boolean) => void;
  vestAll: boolean;
  setVestAll: (vestAll: boolean) => void;
};

export const TokenAmountTypeContext = createContext({} as TokenAmountType);

export function TokenAmountTypeProvider({ children }: PropsWithChildren) {
  const [vestAllFromSwap, setVestAllFromSwap] = useState<boolean>(false);
  const [vestAll, setVestAll] = useState<boolean>(false);

  useEffect(() => {
    if (vestAllFromSwap) setVestAll(false);
  }, [vestAllFromSwap]);
  useEffect(() => {
    if (vestAll) setVestAllFromSwap(false);
  }, [vestAll]);

  return (
    <TokenAmountTypeContext.Provider
      value={{
        vestAllFromSwap,
        setVestAllFromSwap,
        vestAll,
        setVestAll,
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
