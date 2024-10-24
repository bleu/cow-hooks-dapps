"use client";

import { Info, Spinner, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useCallback, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { AmountInput } from "#/components/AmountInput";
import { Button } from "#/components/Button";
import { InfoContent } from "#/components/InfoContent";
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
  const { isSubmitting, isSubmitSuccessful } = useFormState({ control });

  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });
  const amount = useWatch({ control, name: "amount" });
  const recipient = useWatch({ control, name: "recipient" });
  const period = useWatch({ control, name: "period" });

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
        setValue("periodScale", data.periodScale);
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
    return (
      <div className="flex items-center justify-center w-full h-full bg-transparent text-color-text-paper">
        <Spinner size="lg" style={{ color: "gray" }} />
      </div>
    );
  }

  if (!context)
    return (
      <div className="flex items-center justify-center w-full h-full bg-transparent text-color-text-paper">
        <Spinner size="lg" style={{ color: "gray" }} />
      </div>
    );

  if (!context.account)
    return (
      <span className="block w-full mt-10 text-center">
        Connect your wallet first
      </span>
    );

  if (!context?.orderParams?.buyAmount || !context?.orderParams?.buyAmount)
    return (
      <span className="block w-full mt-10 text-center">
        Please specify your swap order first
      </span>
    );

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return (
      <span className="block w-full mt-10 text-center">Unsupported chain</span>
    );
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

  const buttonDisabled =
    isOutOfFunds ||
    !recipient ||
    !period ||
    (!amount && vestUserInput) ||
    isSubmitting ||
    isSubmitSuccessful;

  const isBuildingHook = isSubmitting || isSubmitSuccessful;

  return (
    <div className="flex flex-col flex-wrap w-full flex-grow gap-4">
      <div className="w-full flex flex-col flex-grow gap-4 items-start justify-start text-center">
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
          shouldEnableMaxSelector={vestUserInput}
        />
        <div className="w-full flex flex-col gap-y-2">
          <VestAllFromSwapCheckbox />
          <VestAllFromAccountCheckbox />
          <VestUserInputCheckbox />
        </div>
      </div>
      <Info content={<InfoContent />} />
      <Button
        context={context}
        isOutOfFunds={isOutOfFunds}
        isBuildingHook={isBuildingHook}
        disabled={buttonDisabled}
        tokenSymbol={token?.symbol}
      />
    </div>
  );
}
