"use client";

import { type PropsWithChildren, useCallback } from "react";

import { Form } from "@bleu.builders/ui";
import { type MorphoMarket, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";

export interface MorphoSupplyFormData {
  market: MorphoMarket;
  supplyAmount: string;
  borrowAmount: string;
  isMaxSupply: boolean;
  isMaxBorrow: boolean;
}

export function FormContextProvider({ children }: PropsWithChildren) {
  const { setHookInfo } = useIFrameContext();
  const form = useForm<MorphoSupplyFormData>({
    defaultValues: { isMaxBorrow: false, isMaxSupply: false },
  });

  const router = useRouter();

  const { handleSubmit, getValues } = form;

  const { market } = getValues();

  const getHookInfo = useGetHookInfo(market);

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
