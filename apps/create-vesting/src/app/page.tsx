"use client";

import {
  ButtonPrimary,
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
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { decodeCalldata } from "#/utils/decodeCalldata";
import { HelpMode } from "#/components/HelpMode";
import { validateRecipient } from "#/utils/validateRecipient";

export default function Page() {
  const { context, setHookInfo, publicClient } = useIFrameContext();
  const router = useRouter();
  const [onHelpMode, setOnHelpMode] = useState(false);
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);

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

  const { control, clearErrors, setError, setValue } = form;
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

      const hookInfo = await getHooksTransactions({
        token,
        vestingEscrowFactoryAddress,
        formData: { ...data, recipient: address },
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
      setError,
      clearErrors,
    ],
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback],
  );

  const loadHookInfo = useCallback(async () => {
    if (
      !context?.hookToEdit ||
      !context.account ||
      !publicClient ||
      !tokenDecimals ||
      !isEditHookLoading
    )
      return;
    try {
      const data = await decodeCalldata(
        context?.hookToEdit?.hook.callData as `0x${string}`,
        publicClient,
        context.account,
        tokenDecimals,
      );
      if (data) {
        setValue("vestUserInput", data.vestUserInput);
        setValue("vestAllFromSwap", data.vestAllFromSwap);
        setValue("vestAllFromAccount", data.vestAllFromAccount);
        setValue("recipient", data.recipient);
        setValue("period", data.period);
        setValue("amount", data.amount);
        setIsEditHookLoading(false);
      }
    } catch {}
  }, [
    context?.hookToEdit,
    context?.account,
    publicClient,
    tokenDecimals,
    setValue,
    isEditHookLoading,
  ]);

  if (context?.hookToEdit && isEditHookLoading) {
    loadHookInfo();
  }

  if (!context)
    return (
      <div className="flex items-center justify-center w-full h-full bg-transparent text-color-text-paper">
        <Spinner size="lg" style={{ color: "gray" }} />
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

  if (onHelpMode) {
    return <HelpMode setOnHelpMode={setOnHelpMode} />;
  }

  const amountPreview = vestAllFromSwap
    ? formattedSwapAmount
    : formattedAllAfterSwap;
  const amountPreviewFullDecimals = vestAllFromSwap
    ? String(swapAmountFloat)
    : String(allAfterSwapFloat);

  const isOutOfFunds =
    !!vestUserInput &&
    !!amount &&
    !!allAfterSwapFloat &&
    amount > allAfterSwapFloat;

  return (
    <>
      <Form {...form} onSubmit={onSubmit} className="contents">
        <Wrapper>
          <div className="flex flex-col flex-grow py-4 gap-4 items-start justify-start text-center">
            <Input
              name="recipient"
              label="Vesting Recipient"
              placeholder="Address or ENS name"
              autoComplete="off"
              className="h-12 p-2.5 rounded-xl bg-color-paper-darker border-none"
            />
            <PeriodWithScaleInput
              periodScaleOptions={periodScaleOptions}
              namePeriodValue="period"
              namePeriodScale="periodScale"
              type="number"
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
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
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
          <ButtonPrimary type="submit" disabled={isOutOfFunds}>
            <ButtonText context={context} isOutOfFunds={isOutOfFunds} />
          </ButtonPrimary>
        </Wrapper>
      </Form>
      <button
        className="rounded-xl p-2 mt-2 bg-color-paper-darker text-color-text-paper hover:text-color-button-text hover:bg-color-primary"
        type="button"
        onClick={() => setOnHelpMode(true)}
      >
        How Can I access my contract later?
      </button>
    </>
  );
}

const ButtonText = ({
  context,
  isOutOfFunds,
}: { context: HookDappContextAdjusted; isOutOfFunds: boolean }) => {
  if (isOutOfFunds)
    return (
      <span className="flex items-center justify-center gap-2">
        <ExclamationTriangleIcon className="w-6 h-6" />
        You won't have enough funds
      </span>
    );

  if (context?.hookToEdit && context?.isPreHook)
    return <span>Update Pre-hook</span>;
  if (context?.hookToEdit && !context?.isPreHook)
    return <span>Update Post-hook</span>;
  if (!context?.hookToEdit && context?.isPreHook)
    return <span>Add Pre-hook</span>;
  if (!context?.hookToEdit && !context?.isPreHook)
    return <span>Add Post-hook</span>;
};
