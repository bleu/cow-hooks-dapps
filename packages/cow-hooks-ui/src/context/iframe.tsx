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
import { getPublicClientWithStateOverride } from "../utils/getPublicClientWithStateOverride";

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
  web3Provider?: Web3Provider;
};

export const IFrameContext = createContext({} as IFrameContextType);

export function IFrameContextProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<HookDappContextAdjusted>();
  const [web3Provider, setWeb3Provider] = useState<Web3Provider>();
  const [actions, setActions] = useState<CoWHookDappActions>();
  const [signer, setSigner] = useState<Signer>();
  const [hookInfo, setHookInfo] = useState<IHooksInfo>();

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({
      onContext: setContext as (args: HookDappContext) => void,
    });

    setActions(actions);

    const web3Provider = new Web3Provider(provider);
    setWeb3Provider(web3Provider);
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

  //@ts-ignore
  const stateDiff = context?.stateDiff;

  const stateOverride = useMemo(() => {
    const addressGroups: Record<
      string,
      { slot: `0x${string}`; value: `0x${string}` }[]
    > = {};

    for (const diff of stateDiff ?? []) {
      const address = diff.address as Address;

      if (!addressGroups[address]) {
        addressGroups[address] = [];
      }

      for (const rawDiff of diff.raw) {
        addressGroups[address].push({
          slot: rawDiff.key as `0x${string}`,
          value: rawDiff.dirty as `0x${string}`,
        });
      }
    }

    return Object.entries(addressGroups).map(([address, stateDiff]) => ({
      address: address as Address,
      stateDiff,
    }));
  }, [stateDiff]);

  const publicClient = useMemo(() => {
    if (!context?.chainId) return;
    return getPublicClientWithStateOverride(
      publicClientMapping[context.chainId],
      stateOverride,
    );
  }, [context?.chainId, stateOverride]);

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
        web3Provider,
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
