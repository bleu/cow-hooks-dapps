"use client";

import { type PropsWithChildren, useCallback } from "react";

import { Form } from "@bleu.builders/ui";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useSelectedPool } from "#/hooks/useSelectedPool";
import type { FormType } from "#/types";
// import { formDefaultValues } from "#/utils/formDefaultValues";

export function FormContextProvider({ children }: PropsWithChildren) {
  const { setHookInfo } = useIFrameContext();
  const form = useForm<FormType>({
    // defaultValues: formDefaultValues,
  });

  const { handleSubmit } = form;

  const router = useRouter();

  const selectedPool = useSelectedPool();

  const getHookInfo = useGetHookInfo(selectedPool);

  const onSubmitCallback = useCallback(
    async (data: FormType) => {
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
