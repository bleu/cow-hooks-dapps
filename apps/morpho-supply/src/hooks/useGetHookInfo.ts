import type { IHooksInfo } from "@bleu/cow-hooks-ui";
import { useCallback } from "react";
import type { Address } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useGetBorrowHookInfo } from "./useGetBorrowHookInfo";
import { useGetSupplyHookInfo } from "./useGetSupplyHookInfo";

export interface DepositMorphoHookParams {
  assetAddress: Address;
  assetSymbol: string;
  vaultAddress: Address;
  amount: bigint;
  minShares: bigint;
}

export const useGetHookInfo = () => {
  const getSupplyHookInfo = useGetSupplyHookInfo();
  const getBorrowHookInfo = useGetBorrowHookInfo();

  return useCallback(
    async (formData: MorphoSupplyFormData): Promise<IHooksInfo | undefined> => {
      const supplyHookInfo = await getSupplyHookInfo(formData);
      const borrowHookInfo = await getBorrowHookInfo(formData);

      if (!supplyHookInfo && !borrowHookInfo) return;

      const txs = [
        ...(supplyHookInfo?.txs ?? []),
        ...(borrowHookInfo?.txs ?? []),
      ];
      const permitData = [
        ...(supplyHookInfo?.permitData ?? []),
        ...(borrowHookInfo?.permitData ?? []),
      ];

      return { txs, permitData };
    },
    [getSupplyHookInfo, getBorrowHookInfo],
  );
};
