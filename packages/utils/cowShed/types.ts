import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import type { Address } from "viem";

export interface HookDappContextAdjusted extends HookDappContext {
  account?: Address;
  chainId: SupportedChainId;
}

export interface BaseTransaction {
  to: string;
  value: bigint;
  callData: string;
}
