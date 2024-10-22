"use client";

import {
  ButtonPrimary,
  type HookDappContextAdjusted,
  Info,
  Spinner,
  Wrapper,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useCallback, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import {
  ArrowTopRightIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { AmountInput } from "#/components/AmountInput";
import { PeriodInput } from "#/components/PeriodInput";
import { RecipientInput } from "#/components/RecipientInput";
import { VestAllFromAccountCheckbox } from "#/components/VestAllFromAccountCheckbox";
import { VestAllFromSwapCheckbox } from "#/components/VestAllFromSwapCheckbox";
import { VestUserInputCheckbox } from "#/components/VestUserInputCheckbox";
import { useTokenContext } from "#/context/token";
import { useFormatVariables } from "#/hooks/useFormatVariables";
import { decodeCalldata } from "#/utils/decodeCalldata";
import type { CreateVestingFormData } from "#/utils/schema";

export default function Page() {
  const { context, publicClient } = useIFrameContext();
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
  const { token } = useTokenContext();
  const { control, setValue } = useFormContext<CreateVestingFormData>();
  const { isSubmitting } = useFormState({ control });

  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });
  const amount = useWatch({ control, name: "amount" });
  const recipient = useWatch({ control, name: "recipient" });

  const {
    userBalanceFloat,
    swapAmountFloat,
    allAfterSwapFloat,
    formattedUserBalance,
    formattedSwapAmount,
    formattedAllAfterSwap,
  } = useFormatVariables({
    userBalance: token?.userBalance,
    tokenDecimals: token?.decimals,
  });

  const loadHookInfo = useCallback(async () => {
    if (
      !context?.hookToEdit ||
      !context.account ||
      !publicClient ||
      !token?.decimals ||
      !isEditHookLoading
    )
      return;
    try {
      const data = await decodeCalldata(
        context?.hookToEdit?.hook.callData as `0x${string}`,
        token.decimals,
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
    token?.decimals,
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
      <span className="mt-10 text-center">Provide a buy amount in swap</span>
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
    <Wrapper>
      <div className="flex flex-col flex-grow py-4 gap-4 items-start justify-start text-center">
        <RecipientInput value={recipient} />
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
          <VestAllFromSwapCheckbox />
          <VestAllFromAccountCheckbox />
          <VestUserInputCheckbox />
        </div>
      </div>
      <Info content={<InfoContent />} />
      <ButtonPrimary
        type="submit"
        disabled={
          isOutOfFunds ||
          !recipient ||
          (!amount && vestUserInput) ||
          isSubmitting
        }
      >
        <ButtonText context={context} isOutOfFunds={isOutOfFunds} />
      </ButtonPrimary>
    </Wrapper>
  );
}

const InfoContent = () => {
  return (
    <span className="cursor-default">
      To access Vesting Post-hook contract after swap, connect with the
      recipient wallet at{" "}
      <a
        href="https://llamapay.io/vesting"
        target="_blank"
        rel="noreferrer"
        className="text-color-link underline"
      >
        llamapay.io/vesting
        <ArrowTopRightIcon className="size-4 shrink-0 inline" />
      </a>
    </span>
  );
};

const ButtonText = ({
  context,
  isOutOfFunds,
}: {
  context: HookDappContextAdjusted;
  isOutOfFunds: boolean;
}) => {
  if (isOutOfFunds)
    return (
      <span className="flex items-center justify-center gap-2">
        <ExclamationTriangleIcon className="w-6 h-6" />
        You won't have enough funds
      </span>
    );

  if (context?.hookToEdit && context?.isPreHook)
    return <span>Update pre-hook</span>;
  if (context?.hookToEdit && !context?.isPreHook)
    return <span>Update post-hook</span>;
  if (!context?.hookToEdit && context?.isPreHook)
    return <span>Add pre-hook</span>;
  if (!context?.hookToEdit && !context?.isPreHook)
    return <span>Add post-hook</span>;
};
