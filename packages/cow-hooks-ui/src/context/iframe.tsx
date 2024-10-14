"use client";

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { RPC_URL_MAPPING } from "@bleu/utils/transactionFactory";
import { CowShedHooks } from "@cowprotocol/cow-sdk";
import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import type { Signer } from "ethers";
import type { Address, PublicClient } from "viem";
import type { HookDappContextAdjusted, IHooksInfo } from "../types";
import { publicClientMapping } from "../utils/clients";

type IFrameContextType = {
  context?: HookDappContextAdjusted;
  setContext: (context: HookDappContextAdjusted) => void;
  publicClient?: PublicClient;
  cowShedProxy?: Address;
  cowShed?: CowShedHooks;
  actions?: CoWHookDappActions;
  signer?: Signer;
  hookInfo?: IHooksInfo;
  setHookInfo: (info: IHooksInfo) => void;
  jsonRpcProvider?: JsonRpcProvider;
};

export const IFrameContext = createContext({} as IFrameContextType);

export function IFrameContextProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<HookDappContextAdjusted>();
  const [actions, setActions] = useState<CoWHookDappActions>();
  const [signer, setSigner] = useState<Signer>();
  const [hookInfo, setHookInfo] = useState<IHooksInfo>();

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({
      onContext: setContext as (args: HookDappContext) => void,
    });

    setActions(actions);

    // TODO: refactor to use viem
    const web3Provider = new Web3Provider(provider);
    setSigner(web3Provider.getSigner());
  }, []);

  const jsonRpcProvider = useMemo(() => {
    if (!context?.chainId) return;
    return new JsonRpcProvider(RPC_URL_MAPPING[context.chainId]);
  }, [context?.chainId]);

  const cowShed = useMemo(() => {
    if (!context?.chainId) return;
    return new CowShedHooks(context.chainId);
  }, [context?.chainId]);

  const cowShedProxy = useMemo(() => {
    if (!context?.account || !cowShed) return;
    return cowShed.proxyOf(context.account);
  }, [context?.account, cowShed]) as Address | undefined;

  const publicClient = useMemo(() => {
    if (!context?.chainId) return;
    return publicClientMapping[context.chainId];
  }, [context?.chainId]);

  useEffect(() => {
    const newTheme = context?.isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [context?.isDarkMode]);

  return (
    <IFrameContext.Provider
      value={{
        context,
        setContext,
        publicClient,
        cowShedProxy,
        cowShed,
        hookInfo,
        setHookInfo,
        signer,
        actions,
        jsonRpcProvider,
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
