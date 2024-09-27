"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { HookDappContext, initCoWHookDapp } from "@cowprotocol/hook-dapp-lib";
import { useTheme } from "@bleu/ui";
import { publicClientMapping, PublicClientType } from "#/utils/clients";
import { CowShedHooks } from "@cowprotocol/cow-sdk";
import { Address } from "viem";
import { HookDappContextAdjusted } from "#/types";
import { useUserPools } from "#/hooks/useUserPools";

type IFrameContextType = {
  context?: HookDappContextAdjusted;
  setContext: (context: HookDappContextAdjusted) => void;
  publicClient?: PublicClientType;
  cowShedProxy?: Address;
  userPoolSwr: ReturnType<typeof useUserPools>;
};

export const IFrameContext = createContext({} as IFrameContextType);

export function IFrameContextProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<HookDappContextAdjusted>();
  useEffect(() => {
    initCoWHookDapp({
      onContext: setContext as (args: HookDappContext) => void,
    });
  }, []);

  const cowShed = useMemo(() => {
    if (!context) return;
    return new CowShedHooks(context.chainId);
  }, [context?.chainId]);

  const cowShedProxy = useMemo(() => {
    if (!context?.account || !cowShed) return;
    return cowShed.proxyOf(context.account);
  }, [context?.account, cowShed]) as Address | undefined;

  const publicClient = useMemo(() => {
    if (!context) return;
    return publicClientMapping[context.chainId];
  }, [context?.chainId]);

  useEffect(() => {
    const newTheme = context?.isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [context?.isDarkMode]);

  const userPoolSwr = useUserPools(context?.chainId, context?.account);

  return (
    <IFrameContext.Provider
      value={{
        context,
        setContext,
        publicClient,
        cowShedProxy,
        userPoolSwr,
      }}
    >
      {children}
    </IFrameContext.Provider>
  );
}

export function useIFrameContext() {
  const context = useContext(IFrameContext);

  return context;
}
