"use client";

import { type PropsWithChildren, useCallback } from "react";

import { Form } from "@bleu.builders/ui";
import { useIFrameContext, type MorphoMarket } from "@bleu/cow-hooks-ui";
import { useForm } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useRouter } from "next/navigation";

export interface MorphoSupplyFormData {
  market: MorphoMarket;
  amount: string;
}

export function FormContextProvider({ children }: PropsWithChildren) {
  const { setHookInfo } = useIFrameContext();
  const form = useForm<MorphoSupplyFormData>({});

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
    [getHookInfo, setHookInfo, router]
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
