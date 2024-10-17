export interface SignatureStepsProps {
  callback: () => Promise<void>;
  label: string;
  description: string;
  id: string;
  tooltipText?: string;
}

export type FormType = {
  poolId: string;
  amounts: Record<string, number>;
  referenceTokenAddress: string;
};
