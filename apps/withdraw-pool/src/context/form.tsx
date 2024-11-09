"use client";

import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";

import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Form } from "@bleu.builders/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { type WithdrawSchemaType, withdrawSchema } from "#/utils/schema";
import { useUserPoolContext } from "./userPools";

export function FormContextProvider({ children }: PropsWithChildren) {
  const { context, setHookInfo } = useIFrameContext();

  const form = useForm<WithdrawSchemaType>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const { control, handleSubmit, setValue } = form;

  const {
    userPoolSwr: { data: pools },
  } = useUserPoolContext();

  const poolId = useWatch({ control, name: "poolId" });

  const selectedPool = useMemo(() => {
    return pools?.find(
      (pool) => pool.id.toLowerCase() === poolId?.toLowerCase()
    );
  }, [pools, poolId]);

  const getHooksTransactions = useGetHookInfo(selectedPool);

  const router = useRouter();

  const onSubmitCallback = useCallback(
    async (data: WithdrawSchemaType) => {
      const hookInfo = await getHooksTransactions(data.withdrawPct);
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [getHooksTransactions, setHookInfo, router]
  );

  // biome-ignore lint:
  useEffect(() => {
    setValue("poolId", "");
  }, [context?.account]);

  return (
    <Form
      className="w-full justify-center flex h-full"
      {...form}
      onSubmit={handleSubmit(onSubmitCallback)}
    >
      {children}
    </Form>
  );
}
