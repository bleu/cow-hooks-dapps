"use client";

import { type PropsWithChildren, useCallback, useMemo } from "react";

import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Form } from "@bleu.builders/ui";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useTokenBuyPools } from "#/hooks/useTokenBuyPools";
import type { FormType } from "#/types";
import { formDefaultValues } from "#/utils/formDefaultValues";

export function FormContextProvider({ children }: PropsWithChildren) {
  const { setHookInfo } = useIFrameContext();
  const form = useForm<FormType>({
    defaultValues: formDefaultValues,
  });

  const { handleSubmit, control } = form;

  const router = useRouter();

  const { data: pools } = useTokenBuyPools();

  const { poolId } = useWatch({ control });

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );

  const getHookInfo = useGetHookInfo(selectedPool);

  const onSubmitCallback = useCallback(
    async (data: FormType) => {
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
