"use client";

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

type TokenLogosContextType = {
  getTokenLogoSrcIndex: (address: string) => number;
  setTokenLogoSrcIndex: (address: string, index: number) => void;
};

export const TokenLogoContext = createContext({} as TokenLogosContextType);

export function TokenLogoContextProvider({ children }: PropsWithChildren) {
  const [tokenLogos, setTokenLogos] = useState<Record<string, number>>({});

  const getTokenLogoSrcIndex = (address: string) => {
    return tokenLogos[address.toLowerCase()] || 0;
  };

  const setTokenLogoSrcIndex = (address: string, index: number) => {
    setTokenLogos((prev) => ({
      ...prev,
      [address.toLowerCase()]: index,
    }));
  };

  return (
    <TokenLogoContext.Provider
      value={{
        getTokenLogoSrcIndex,
        setTokenLogoSrcIndex,
      }}
    >
      {children}
    </TokenLogoContext.Provider>
  );
}

export function useTokenLogoContext() {
  const context = useContext(TokenLogoContext);

  return context;
}
