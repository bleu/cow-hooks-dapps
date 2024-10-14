import type { BaseTransaction } from "@bleu/cow-hooks-ui";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import type { BigNumberish } from "ethers";
import type { Address } from "viem";

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
