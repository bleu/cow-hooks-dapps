import type { Token } from "@uniswap/sdk-core";
import { BigNumberish } from "ethers";
import { BaseTransaction } from "@bleu/cow-hooks-ui";

export interface SignatureStepsProps {
  callback: () => Promise<void>;
  label: string;
  description: string;
  id: string;
  tooltipText?: string;
}

export interface IHooksInfo {
  txs: BaseTransaction[];
  permitData: {
    tokenAddress: string;
    amount: BigNumberish;
    tokenSymbol: string;
  }[];
}
