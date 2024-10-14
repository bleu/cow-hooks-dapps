import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import { BigNumberish } from "ethers";
import { Address } from "viem";
import { BaseTransaction } from "@bleu/cow-hooks-ui";

export interface HookDappContextAdjusted extends HookDappContext {
  account?: Address;
  chainId: SupportedChainId;
}

export interface IHooksInfo {
  txs: BaseTransaction[];
  permitData: {
    tokenAddress: string;
    amount: BigNumberish;
    tokenSymbol: string;
  }[];
}
