"use client";

import {
  ButtonPrimary,
  ClipBoardButton,
  type HookDappContextAdjusted,
  Info,
  Spinner,
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
} from "#/utils/schema";

import { useReadTokenContract } from "@bleu/cow-hooks-ui";
import { useRouter } from "next/navigation";
import { useGetHooksTransactions } from "#/hooks/useGetHooksTransactions";
import { vestingFactoriesMapping } from "#/utils/vestingFactoriesMapping";
import { useFormatVariables } from "#/hooks/useFormatVariables";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import type { Address } from "viem";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { decodeCalldata } from "#/utils/decodeCalldata";
import { validateRecipient } from "#/utils/validateRecipient";
import { VestUserInputCheckbox } from "#/components/VestUserInputCheckbox";
import { VestAllFromSwapCheckbox } from "#/components/VestAllFromSwapCheckbox";
import { VestAllFromAccountCheckbox } from "#/components/VestAllFromAccountCheckbox";
import { RecipientInput } from "#/components/RecipientInput";
import { PeriodInput } from "#/components/PeriodInput";
import { AmountInput } from "#/components/AmountInput";

export default function Page() {
  const { context, setHookInfo, publicClient } = useIFrameContext();
  const router = useRouter();
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
            <RecipientInput />
            <PeriodInput />
            <AmountInput
              token={token}
              vestAllFromSwap={vestAllFromSwap}
              vestAllFromAccount={vestAllFromAccount}
              amountPreview={amountPreview}
              amountPreviewFullDecimals={amountPreviewFullDecimals}
              formattedUserBalance={formattedUserBalance}
              userBalanceFloat={userBalanceFloat}
            />
            <div className="flex flex-col gap-y-2">
              <VestUserInputCheckbox />
              <VestAllFromSwapCheckbox />
              <VestAllFromAccountCheckbox />
            </div>
          </div>
          <Info content={<InfoContent />} />
          <ButtonPrimary type="submit" disabled={isOutOfFunds}>
            <ButtonText context={context} isOutOfFunds={isOutOfFunds} />
          </ButtonPrimary>
        </Wrapper>
      </Form>
    </>
  );
}

const InfoContent = () => {
  return (
    <span className="cursor-default">
      To access Vesting Post-hook contract after swap, connect with the
      recipient wallet at{" "}
      <ClipBoardButton
        buttonText="llamapay.io/vesting"
        contentToCopy="https://llamapay.io/vesting"
        className="flex items-center justify-center gap-1 cursor-pointer"
      />
    </span>
  );
};

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
