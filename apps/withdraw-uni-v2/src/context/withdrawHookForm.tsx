"use client";

import { Form } from "@bleu.builders/ui";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { type WithdrawSchemaType, withdrawSchema } from "@bleu/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useSelectedPool } from "#/hooks/useSelectedPool";

export function WithdrawFormContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { context, setHookInfo } = useIFrameContext();
  const getHookInfo = useGetHookInfo();

  const form = useForm<WithdrawSchemaType>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const { control, handleSubmit, setValue } = form;

  const poolId = useWatch({ control, name: "poolId" });

  const selectedPool = useSelectedPool(poolId);

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
  }, [context?.account, setValue]);

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
