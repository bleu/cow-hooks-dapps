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
import { useCallback, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AmountInput } from "#/components/AmountInput";
import { PeriodInput } from "#/components/PeriodInput";
import { RecipientInput } from "#/components/RecipientInput";
import { VestAllFromAccountCheckbox } from "#/components/VestAllFromAccountCheckbox";
import { VestAllFromSwapCheckbox } from "#/components/VestAllFromSwapCheckbox";
import { VestUserInputCheckbox } from "#/components/VestUserInputCheckbox";
import { useTokenContext } from "#/context/token";
import { useFormatVariables } from "#/hooks/useFormatVariables";
import { decodeCalldata } from "#/utils/decodeCalldata";

export default function Page() {
  const { context, publicClient } = useIFrameContext();
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);

  const { token } = useTokenContext();

  const { control, setValue } = useFormContext();

  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });
  const amount = useWatch({ control, name: "amount" });

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
