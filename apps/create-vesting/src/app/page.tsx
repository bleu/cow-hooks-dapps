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
import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  VestUserInputCheckbox,
} from "#/components/Checkboxes";
import { useGetHooksTransactions } from "#/hooks/useGetHooksTransactions";
import { vestingFactoriesMapping } from "#/utils/vestingFactoriesMapping";
import { useFormatVariables } from "#/hooks/useFormatVariables";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import type { Address } from "viem";

export default function Page() {
  const { context, setHookInfo } = useIFrameContext();
  const router = useRouter();
  // const [amountPreview, setAmountPreview] = useState<string | undefined>(
  //   undefined,
  // );
  // const [amountPreviewFullDecimals, setAmountPreviewFullDecimals] = useState<
  //   string | undefined
  // >(undefined);

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

  const { control } = form;
  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });
  const amount = useWatch({ control, name: "amount" });

  const getHooksTransactions = useGetHooksTransactions();
  const tokenAddress = context?.orderParams?.buyTokenAddress as
    | Address
    | undefined;

  const { tokenSymbol, tokenDecimals, userBalance } = useReadTokenContract({
    tokenAddress,
  });

  const {
    userBalanceFloat,
    swapAmountFloat,
    allAfterSwapFloat,
    formattedUserBalance,
    formattedSwapAmount,
    formattedAllAfterSwap,
  } = useFormatVariables({
    userBalance,
    tokenDecimals,
  });

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
      console.log("data", data);
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
    return (
      <div className="flex items-center justify-center w-full h-full ">
        <Spinner size="lg" />
      </div>
    );

  if (!context.account)
    return <span className="mt-10 text-center">Connect your wallet first</span>;

  if (!context?.orderParams?.buyTokenAddress)
    return (
      <span className="mt-10 text-center">Provide a buy token in swap</span>
    );

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  const amountPreview = vestAllFromSwap
    ? formattedSwapAmount
    : formattedAllAfterSwap;
  const amountPreviewFullDecimals = vestAllFromSwap
    ? String(swapAmountFloat)
    : String(allAfterSwapFloat);

  return (
    <Form {...form} onSubmit={onSubmit} className="contents">
      <Wrapper>
        <div className="flex flex-col flex-grow py-4 gap-4 items-start justify-start text-center">
          <Input
            name="recipient"
            label="Vesting Recipient Address"
            placeholder="0xabc..."
            autoComplete="off"
            className="h-12 p-2.5 rounded-xl bg-color-paper-darker border-none"
          />
          <PeriodWithScaleInput
            periodScaleOptions={periodScaleOptions}
            namePeriodValue="period"
            namePeriodScale="periodScale"
            type="number"
            step="0.0000001"
            label="Lock-up Period"
            validation={{ valueAsNumber: true, required: true }}
            onKeyDown={(e) =>
              ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
            }
          />
          <TokenAmountInput
            name="amount"
            type="number"
            step={`0.${"0".repeat(tokenDecimals ? tokenDecimals - 1 : 8)}1`}
            token={token}
            label="Vesting Amount"
            placeholder="0.0"
            autoComplete="off"
            disabled={vestAllFromSwap || vestAllFromAccount}
            disabledValue={amountPreview}
            disabledValueFullDecimals={amountPreviewFullDecimals}
            userBalance={formattedUserBalance}
            userBalanceFullDecimals={String(userBalanceFloat)}
            validation={{
              setValueAs: (v) =>
                v === "" ? undefined : Number.parseInt(v, 10),
              required: !(vestAllFromAccount || vestAllFromSwap),
            }}
            onKeyDown={(e) =>
              ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
            }
          />
          <div className="flex flex-col gap-y-2">
            <VestUserInputCheckbox />
            <VestAllFromSwapCheckbox />
            <VestAllFromAccountCheckbox />
          </div>
        </div>
        {vestUserInput &&
          amount &&
          allAfterSwapFloat &&
          amount < allAfterSwapFloat && (
            <span className="text-center text-destructive py-2">
              You won't have enough funds after swap. Transaction is likely to
              fail
            </span>
          )}
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
