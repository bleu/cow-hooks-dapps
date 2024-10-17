"use client";

import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";

import { useForm, useWatch } from "react-hook-form";
import { Form } from "@bleu/ui";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useTokenBuyPools } from "#/hooks/useTokenBuyPools";
import { FormType } from "#/types";

export function FormContextProvider({ children }: PropsWithChildren) {
  const { context, setHookInfo } = useIFrameContext();
  const form = useForm<FormType>({});

  const { handleSubmit, setValue, control } = form;

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
      await router.push("/signing");
    },
    [context?.account, getHookInfo, setHookInfo, router]
  );

  useEffect(() => {
    setValue("poolId", "");
  }, [context?.account, setValue]);

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
