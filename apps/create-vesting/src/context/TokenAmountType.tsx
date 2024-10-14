"use client";

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type TokenAmountType = {
  vestAllFromSwap: boolean;
  setVestAllFromSwap: (vestAllFromSwap: boolean) => void;
  vestAllFromAccount: boolean;
  setVestAllFromAccount: (vestAllFromAccount: boolean) => void;
};

export const TokenAmountTypeContext = createContext({} as TokenAmountType);

export function TokenAmountTypeProvider({ children }: PropsWithChildren) {
  const [vestAllFromSwap, setVestAllFromSwap] = useState<boolean>(false);
  const [vestAllFromAccount, setVestAllFromAccount] = useState<boolean>(false);

  useEffect(() => {
    if (vestAllFromSwap) setVestAllFromAccount(false);
  }, [vestAllFromSwap]);
  useEffect(() => {
    if (vestAllFromAccount) setVestAllFromSwap(false);
  }, [vestAllFromAccount]);

  return (
    <TokenAmountTypeContext.Provider
      value={{
        vestAllFromSwap,
        setVestAllFromSwap,
        vestAllFromAccount,
        setVestAllFromAccount,
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
