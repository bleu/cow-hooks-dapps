"use client";

import { type PropsWithChildren, useCallback } from "react";

import { Form } from "@bleu.builders/ui";
import { type MorphoVault, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";

export interface DepositMorphoFormData {
  vault: MorphoVault;
  amount: string;
}

export function FormContextProvider({ children }: PropsWithChildren) {
  const { setHookInfo } = useIFrameContext();
  const form = useForm<DepositMorphoFormData>({});

  const { vault, amount } = useWatch({ control: form.control });

  const { handleSubmit } = form;

  const router = useRouter();

  const getHookInfo = useGetHookInfo({
    vault: vault as MorphoVault,
    amount: amount as string,
  });

  const onSubmitCallback = useCallback(
    async (data: DepositMorphoFormData) => {
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
