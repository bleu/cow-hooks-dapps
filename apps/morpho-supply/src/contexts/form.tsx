"use client";

import { type PropsWithChildren, useCallback } from "react";

import { Form } from "@bleu.builders/ui";
import { type MorphoMarket, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { OperationType } from "#/constants/forms";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";

export interface MorphoSupplyFormData {
  market: MorphoMarket;

  // Supply/Borrow fields
  supplyAmount: number;
  borrowAmount: number;
  isMaxSupply: boolean;
  isMaxBorrow: boolean;

  // Repay/Withdraw fields
  repayAmount: number;
  withdrawAmount: number;
  isMaxRepay: boolean;
  isMaxWithdraw: boolean;

  operationType: OperationType;
}

export function FormContextProvider({ children }: PropsWithChildren) {
  const { setHookInfo } = useIFrameContext();
  const form = useForm<MorphoSupplyFormData>({
    defaultValues: {
      isMaxBorrow: false,
      isMaxSupply: false,
      operationType: OperationType.SupplyBorrow,
    },
  });

  const router = useRouter();

  const { handleSubmit, getValues } = form;

  const { market } = getValues();

  const getHookInfo = useGetHookInfo(market);

  const onSubmitCallback = useCallback(
    async (data: MorphoSupplyFormData) => {
      const formData = { ...data };

      // Process data based on operation type
      if (data.operationType === "supply-borrow") {
        // Use supplyAmount and borrowAmount fields
        // Ignore repay and withdraw fields
      } else {
        // Use repayAmount and withdrawAmount fields
        // Ignore supply and borrow fields

        // Map to the expected structure if needed
        formData.supplyAmount = data.repayAmount;
        formData.borrowAmount = data.withdrawAmount;
        formData.isMaxSupply = data.isMaxRepay;
        formData.isMaxBorrow = data.isMaxWithdraw;
      }

      const hookInfo = await getHookInfo(formData);
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [getHookInfo, setHookInfo, router],
  );

  return (
    <Form
      className="w-full justify-center flex h-full"
      onSubmit={handleSubmit(onSubmitCallback)}
      {...form}
    >
      {children}
    </Form>
  );
}
