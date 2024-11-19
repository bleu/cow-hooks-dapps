export interface SignatureStepsProps {
  callback: () => Promise<void>;
  label: string;
  description: string;
  id: string;
  tooltipText?: string;
}

export type AmountType = "userInput" | "allFromSwap" | "allFromAccount";

export type FormType = {
  poolId: string;
  amounts: Record<string, string>;
  referenceTokenAddress: string;
  amountType: AmountType;
};
