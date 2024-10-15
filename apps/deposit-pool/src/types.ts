import type { BaseTransaction } from "@bleu/cow-hooks-ui";
import type { BigNumberish } from "ethers";

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
