"use client";

import { withdrawSchema, WithdrawSchemaType } from "@bleu/utils";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useIFrameContext } from "./iframe";
import { useUserPools } from "../hooks/useUserPools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form } from "@bleu/ui";
import { IHooksInfo, IPool } from "../types";

export function WithdrawFormContextProvider({
  children,
  getHookInfo,
}: {
  children: React.ReactNode;
  getHookInfo: (
    selectedPool: IPool,
    withdrawPct: number
  ) => Promise<IHooksInfo | undefined>;
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

  const { data: pools } = useUserPools(context?.chainId, context?.account);

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
    [getHookInfo, setHookInfo, router]
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
