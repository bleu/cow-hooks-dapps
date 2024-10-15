"use client";

import {
  ButtonPrimary,
  ContentWrapper,
  type HookDappContextAdjusted,
  Input,
  PeriodWithScaleInput,
  Spinner,
  TokenAmountInput,
  Wrapper,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { Token } from "@uniswap/sdk-core";

import { Form } from "@bleu/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

import {
  type CreateVestingFormData,
  createVestingSchema,
  periodScaleOptions,
} from "#/utils/schema";

import { useReadTokenContract } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import {
  VestAllFromAccountCheckbox,
  VestAllFromSwapCheckbox,
} from "#/components/Checkboxes";
import { useTokenAmountTypeContext } from "#/context/TokenAmountType";
import { useGetHooksTransactions } from "#/hooks/useGetHooksTransactions";
import { vestingFactoriesMapping } from "#/utils/vestingFactoriesMapping";

export default function Page() {
  const { vestAllFromSwap, vestAllFromAccount } = useTokenAmountTypeContext();
  const { context, setHookInfo } = useIFrameContext();
  const router = useRouter();

  const form = useForm<CreateVestingFormData>({
    resolver: zodResolver(createVestingSchema),
    defaultValues: {
      period: 1,
      periodScale: "Day",
      vestAllFromSwap: false,
    },
  });

  const getHooksTransactions = useGetHooksTransactions();
  const tokenAddress = context?.orderParams?.buyTokenAddress as
    | `0x${string}`
    | undefined;

  const { tokenSymbol, tokenDecimals } = useReadTokenContract({ tokenAddress });

  const token = useMemo(
    () =>
      context?.chainId && tokenAddress && tokenDecimals
        ? new Token(context.chainId, tokenAddress, tokenDecimals, tokenSymbol)
        : undefined,
    [context?.chainId, tokenAddress, tokenDecimals, tokenSymbol],
  );

  const vestingEscrowFactoryAddress = useMemo(() => {
    return context?.chainId
      ? vestingFactoriesMapping[context.chainId]
      : undefined;
  }, [context?.chainId]);

  const onSubmitCallback = useCallback(
    async (data: CreateVestingFormData) => {
      if (!context?.account || !token || !vestingEscrowFactoryAddress) return;
      const hookInfo = await getHooksTransactions({
        token,
        vestingEscrowFactoryAddress,
        formData: data,
      });
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [
      context?.account,
      token,
      vestingEscrowFactoryAddress,
      router.push,
      setHookInfo,
      getHooksTransactions,
    ],
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback],
  );

  if (!context)
    // For some reason we had a bug with spinner being rendered without styling. Please use null here
    return null;

  if (!context.account)
    return <span className="mt-10 text-center">Connect your wallet</span>;

  if (!context?.orderParams?.buyTokenAddress)
    return (
      <span className="mt-10 text-center">Provide a buy token in swap</span>
    );

  return (
    <Form {...form} onSubmit={onSubmit} className="contents">
      <Wrapper>
        <ContentWrapper>
          <Input
            name="recipient"
            label="Recipient"
            placeholder="0xabc..."
            autoComplete="off"
            className="h-12 p-2.5 rounded-xl bg-color-paper-darker border-none placeholder:opacity-100"
          />
          <br />
          <div className="flex flex-col w-full xsm:gap-4 xsm:flex-row">
            <PeriodWithScaleInput
              periodScaleOptions={periodScaleOptions}
              namePeriodValue="period"
              namePeriodScale="periodScale"
              type="number"
              step="0.0000001"
              label="Period"
              validation={{ valueAsNumber: true, required: true }}
              onKeyDown={(e) =>
                ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
              }
            />
            <br className="xsm:h-0 xsm:w-0" />
            <TokenAmountInput
              name="amount"
              type="number"
              step={`0.${"0".repeat(tokenDecimals ? tokenDecimals - 1 : 8)}1`}
              token={token}
              label="Amount"
              placeholder="0.0"
              autoComplete="off"
              disabled={vestAllFromSwap || vestAllFromAccount}
              validation={{
                setValueAs: (v) =>
                  v === "" ? undefined : Number.parseInt(v, 10),
                required: !(vestAllFromAccount || vestAllFromSwap),
              }}
              onKeyDown={(e) =>
                ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
              }
            />
          </div>
          <br />
          <VestAllFromSwapCheckbox />
          <VestAllFromAccountCheckbox />
          <br />
        </ContentWrapper>
        <ButtonPrimary type="submit">
          <ButtonText context={context} />
        </ButtonPrimary>
      </Wrapper>
    </Form>
  );
}

const ButtonText = ({ context }: { context: HookDappContextAdjusted }) => {
  if (context?.hookToEdit && context?.isPreHook)
    return <span>Update Pre-hook</span>;
  if (context?.hookToEdit && !context?.isPreHook)
    return <span>Update Post-hook</span>;
  if (!context?.hookToEdit && context?.isPreHook)
    return <span>Add Pre-hook</span>;
  if (!context?.hookToEdit && !context?.isPreHook)
    return <span>Add Post-hook</span>;
};
