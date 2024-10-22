"use client";

import { type PropsWithChildren, useCallback, useMemo } from "react";

import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Form } from "@bleu/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useGetHooksTransactions } from "#/hooks/useGetHooksTransactions";
import {
  type CreateVestingFormData,
  createVestingSchema,
} from "#/utils/schema";
import { validateRecipient } from "#/utils/validateRecipient";
import { vestingFactoriesMapping } from "#/utils/vestingFactoriesMapping";
import { useTokenContext } from "./token";

export function FormContextProvider({ children }: PropsWithChildren) {
  const { context, setHookInfo } = useIFrameContext();

  const form = useForm<CreateVestingFormData>({
    resolver: zodResolver(createVestingSchema),
    defaultValues: {
      period: 1,
      periodScale: "Day",
      vestUserInput: false,
      vestAllFromSwap: true,
      vestAllFromAccount: false,
    },
  });

  const { clearErrors, setError } = form;

  const getHooksTransactions = useGetHooksTransactions();

  const router = useRouter();

  const vestingEscrowFactoryAddress = useMemo(() => {
    return context?.chainId
      ? vestingFactoriesMapping[context.chainId]
      : undefined;
  }, [context?.chainId]);

  const { token } = useTokenContext();

  const onSubmitCallback = useCallback(
    async (data: CreateVestingFormData) => {
      if (!context?.account || !token || !vestingEscrowFactoryAddress) return;

      // Validate ENS name and get address
      clearErrors("recipient");
      let address: string;
      try {
        address = await validateRecipient(data.recipient);
      } catch (error) {
        if (error instanceof Error) {
          setError("recipient", {
            type: "manual",
            message: error.message,
          });
        } else {
          setError("recipient", {
            type: "manual",
            message: "Couldn't verify ENS name",
          });
        }
        return;
      }

      if (address.toLowerCase() === context.account.toLowerCase()) {
        setError("recipient", {
          type: "manual",
          message: "You can't create a vesting to yourself",
        });
        return;
      }

      const hookInfo = await getHooksTransactions({
        token,
        vestingEscrowFactoryAddress,
        formData: { ...data, recipient: address },
      });
      if (!hookInfo) return;

      setHookInfo(hookInfo);
      router.push("/signing");

      // Avoid enabling submit button before signing page loads
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    [
      context?.account,
      token,
      vestingEscrowFactoryAddress,
      router.push,
      setHookInfo,
      getHooksTransactions,
      setError,
      clearErrors,
    ],
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback],
  );

  return (
    <Form className="contents" {...form} onSubmit={onSubmit}>
      {children}
    </Form>
  );
}
