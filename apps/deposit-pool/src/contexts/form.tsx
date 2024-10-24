"use client";

import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";

import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Form } from "@bleu/ui";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useTokenBuyPools } from "#/hooks/useTokenBuyPools";
import type { FormType } from "#/types";

export function FormContextProvider({ children }: PropsWithChildren) {
  const { context, setHookInfo } = useIFrameContext();
  const form = useForm<FormType>({});

  const { handleSubmit, setValue, control } = form;

  const router = useRouter();

  const { data: pools } = useTokenBuyPools();

  const { poolId } = useWatch({ control });

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId],
  );

  const getHookInfo = useGetHookInfo(selectedPool);

  const onSubmitCallback = useCallback(
    async (data: FormType) => {
      const hookInfo = await getHookInfo(data);
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      await router.push("/signing");
    },
    [getHookInfo, setHookInfo, router],
  );

  // biome-ignore lint:
  useEffect(() => {
    setValue("poolId", "");
  }, [context?.account]);

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
