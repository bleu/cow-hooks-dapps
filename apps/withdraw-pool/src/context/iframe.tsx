"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CoWHookDappActions,
  HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";
import { publicClientMapping, PublicClientType } from "#/utils/clients";
import { CowShedHooks } from "@cowprotocol/cow-sdk";
import { Address } from "viem";
import { HookDappContextAdjusted } from "#/types";
import { useUserPools } from "#/hooks/useUserPools";
import { Signer } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { BaseTransaction } from "#/utils/transactionFactory/types";

type IFrameContextType = {
  context?: HookDappContextAdjusted;
  setContext: (context: HookDappContextAdjusted) => void;
  publicClient?: PublicClientType;
  cowShedProxy?: Address;
  cowShed?: CowShedHooks;
  userPoolSwr: ReturnType<typeof useUserPools>;
  actions?: CoWHookDappActions;
  signer?: Signer;
  cowShedTransactions: BaseTransaction[];
  setCowShedTransactions: (txs: BaseTransaction[]) => void;
};

export const IFrameContext = createContext({} as IFrameContextType);

export function IFrameContextProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<HookDappContextAdjusted>();
  const [actions, setActions] = useState<CoWHookDappActions>();
  const [signer, setSigner] = useState<Signer>();
  const [cowShedTransactions, setCowShedTransactions] = useState<
    BaseTransaction[]
  >([]);

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({
      onContext: setContext as (args: HookDappContext) => void,
    });

    setActions(actions);

    // TODO: refactor to use viem
    const web3Provider = new Web3Provider(provider);
    setSigner(web3Provider.getSigner());
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
        cowShed,
        cowShedTransactions,
        setCowShedTransactions,
        signer,
        actions,
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
