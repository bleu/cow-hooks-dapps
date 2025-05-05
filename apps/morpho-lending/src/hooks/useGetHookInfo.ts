import type { IHooksInfo, MorphoMarket } from "@bleu/cow-hooks-ui";
import { useCallback } from "react";
import type { Address } from "viem";
import { OperationType } from "#/constants/forms";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useGetBorrowHookInfo } from "./useGetBorrowHookInfo";
import { useGetRepayHookInfo } from "./useGetRepayHookInfo";
import { useGetSupplyHookInfo } from "./useGetSupplyHookInfo";
import { useGetWithdrawHookInfo } from "./useGetWithdrawHookInfo";

export interface DepositMorphoHookParams {
  assetAddress: Address;
  assetSymbol: string;
  vaultAddress: Address;
  amount: bigint;
  minShares: bigint;
}

export const useGetHookInfo = (market: MorphoMarket | undefined) => {
  const getSupplyHookInfo = useGetSupplyHookInfo();
  const getBorrowHookInfo = useGetBorrowHookInfo(market);
  const getRepayHookInfo = useGetRepayHookInfo();
  const getWithdrawHookInfo = useGetWithdrawHookInfo();

  return useCallback(
    async (formData: MorphoSupplyFormData): Promise<IHooksInfo | undefined> => {
      if (formData.operationType === OperationType.SupplyBorrow) {
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
      }

      const repayHookInfo = await getRepayHookInfo(formData);
      const withdrawHookInfo = await getWithdrawHookInfo(formData);

      if (!repayHookInfo && !withdrawHookInfo) return;

      const txs = [
        ...(repayHookInfo?.txs ?? []),
        ...(withdrawHookInfo?.txs ?? []),
      ];
      const permitData = [
        ...(repayHookInfo?.permitData ?? []),
        ...(withdrawHookInfo?.permitData ?? []),
      ];
      return { txs, permitData };
    },
    [
      getSupplyHookInfo,
      getBorrowHookInfo,
      getRepayHookInfo,
      getWithdrawHookInfo,
    ],
  );
};
