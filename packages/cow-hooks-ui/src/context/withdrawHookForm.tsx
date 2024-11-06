"use client";

import { Form } from "@bleu/ui";
import { type WithdrawSchemaType, withdrawSchema } from "@bleu/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useUserPools } from "../hooks/useUserPools";
import type { IHooksInfo, IPool } from "../types";
import { useIFrameContext } from "./iframe";

export function WithdrawFormContextProvider({
  children,
  getHookInfo,
  poolTypeIn,
}: {
  children: React.ReactNode;
  getHookInfo: (
    selectedPool: IPool,
    withdrawPct: number
  ) => Promise<IHooksInfo | undefined>;
  poolTypeIn: "COW_AMM" | "WEIGHTED";
}) {
  const { context, setHookInfo } = useIFrameContext();

  const form = useForm<WithdrawSchemaType>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const { control, handleSubmit, setValue } = form;

  const { data: pools } = useUserPools(poolTypeIn);

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
      console.log({ selectedPool });
      const hookInfo = await getHookInfo(selectedPool, data.withdrawPct);
      console.log({ hookInfo });
      if (!hookInfo) return;
      console.log("oi");
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
