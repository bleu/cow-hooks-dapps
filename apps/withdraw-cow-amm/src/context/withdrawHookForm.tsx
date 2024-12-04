"use client";

import { useBalancerUserPools } from "@bleu/cow-hooks-ui";
import { type WithdrawSchemaType, withdrawSchema } from "@bleu/utils";
import { useCallback, useEffect, useMemo } from "react";

import { Form } from "@bleu.builders/ui";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";

export function WithdrawFormContextProvider({
  children,
  poolTypeIn,
}: {
  children: React.ReactNode;
  poolTypeIn: "COW_AMM" | "WEIGHTED";
}) {
  const getHookInfo = useGetHookInfo();
  const { context, setHookInfo } = useIFrameContext();

  const form = useForm<WithdrawSchemaType>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const { control, handleSubmit, setValue } = form;

  const { data: pools } = useBalancerUserPools(poolTypeIn);

  const poolId = useWatch({ control, name: "poolId" });

  const selectedPool = useMemo(() => {
    return pools?.find(
      (pool) => pool.id.toLowerCase() === poolId?.toLowerCase()
    );
  }, [pools, poolId]);

  const router = useRouter();

  const onSubmitCallback = useCallback(
    async (data: WithdrawSchemaType) => {
      if (!selectedPool) return;
      const hookInfo = await getHookInfo(selectedPool, data.withdrawPct);
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [getHookInfo, setHookInfo, router, selectedPool]
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
