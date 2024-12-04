"use client";

import { useIFrameContext } from "@bleu/cow-hooks-ui/src/context/iframe";
import { useUserPools } from "@bleu/cow-hooks-ui/src/hooks/useUserPools";
import { Form } from "@bleu/ui";
import { type WithdrawSchemaType, withdrawSchema } from "@bleu/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
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

  const { data: pools } = useUserPools(poolTypeIn);

  const poolId = useWatch({ control, name: "poolId" });

  const selectedPool = useMemo(() => {
    return pools?.find(
      (pool) => pool.id.toLowerCase() === poolId?.toLowerCase(),
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
    [getHookInfo, setHookInfo, router, selectedPool],
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
