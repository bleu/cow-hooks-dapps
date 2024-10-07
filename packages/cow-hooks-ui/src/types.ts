import { BigNumberish } from "ethers";
import { Address } from "viem";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { HookDappContext } from "@cowprotocol/hook-dapp-lib";

export interface BaseTransaction {
  to: string;
  value: bigint;
  callData: string;
}

export interface IHooksInfo {
  txs: BaseTransaction[];
  permitData: {
    tokenAddress: string;
    amount: BigNumberish;
    tokenSymbol: string;
  }[];
}

export interface HookDappContextAdjusted extends HookDappContext {
  account?: Address;
  chainId: SupportedChainId;
}

export interface SignatureStepsProps {
  callback: () => Promise<void>;
  label: string;
  description: string;
  id: string;
}
