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
  supplyAmount: string;
  borrowAmount: string;
  isMaxSupply: boolean;
  isMaxBorrow: boolean;

  // Repay/Withdraw fields
  repayAmount: string;
  withdrawAmount: string;
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
      isMaxRepay: false,
      isMaxWithdraw: false,
      operationType: OperationType.SupplyBorrow,
    },
  });

  const router = useRouter();

  const { handleSubmit } = form;

  const getHookInfo = useGetHookInfo();

  const onSubmitCallback = useCallback(
    async (data: MorphoSupplyFormData) => {
      const hookInfo = await getHookInfo(data);
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
