import { useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import type { Address } from "viem";
import { useTokensAfterSwap } from "../hooks/useTokensAfterSwap";
import { DepositFormType } from "@bleu/utils";
import { useIFrameContext } from "../context";
import { IBalance } from "../types";
import { ButtonPrimary } from "../ButtonPrimary";

export function FormButton({ poolBalances }: { poolBalances: IBalance[] }) {
  const { context } = useIFrameContext();
  const tokenAddresses = useMemo(
    () =>
      poolBalances.map(
        (poolBalance) => poolBalance.token.address.toLowerCase() as Address
      ),
    [poolBalances]
  );
  const poolTokens = useTokensAfterSwap(tokenAddresses);

  const { control } = useFormContext<DepositFormType>();

  const { isSubmitting } = useFormState({
    control,
  });
  const amounts = useWatch({ control, name: "amounts" });

  const referenceTokenAddress = useWatch({
    control,
    name: "referenceTokenAddress",
  });

  const referenceAmount = useMemo(() => {
    if (!referenceTokenAddress || !amounts) return;
    return amounts[referenceTokenAddress.toLowerCase()];
  }, [amounts, referenceTokenAddress]);

  const insufficientTokenSymbols = useMemo(() => {
    return tokenAddresses
      .map((tokenAddress) => {
        const token = poolTokens[tokenAddress];
        if (!token || !amounts) return;
        const amount = amounts[tokenAddress];
        if (!amount) return;
        const tokenBalance = Number(token.balance);
        const tokenAmount = Number(amount);
        if (tokenBalance < tokenAmount) return token.symbol;
      })
      .filter((symbol) => symbol) as string[];
  }, [amounts, poolTokens, tokenAddresses]);

  const zeroAmount = useMemo(() => {
    return tokenAddresses
      .map((tokenAddress) => amounts[tokenAddress])
      .some((amount) => Number(amount) <= 0);
  }, [amounts, tokenAddresses]);

  const shouldDisableButton = useMemo(() => {
    if (insufficientTokenSymbols.length) return true;
    if (Number(referenceAmount || "0") <= 0) return true;
    if (zeroAmount) return true;
    if (isSubmitting) return true;
    return false;
  }, [insufficientTokenSymbols, isSubmitting, referenceAmount, zeroAmount]);

  const buttonMessage = useMemo(() => {
    if (Number(referenceAmount || "0") <= 0) return "Enter an amount";
    if (zeroAmount) return "Enter a larger amount";
    if (insufficientTokenSymbols.length === 1) {
      return `Insufficient ${insufficientTokenSymbols[0]} balance`;
    }
    if (insufficientTokenSymbols.length > 1) {
      return "Insufficient balance for multiple tokens";
    }
    if (isSubmitting) return "Creating hook...";
    if (context?.hookToEdit) return "Update post-hook";
    return "Add post-hook";
  }, [
    zeroAmount,
    insufficientTokenSymbols,
    isSubmitting,
    referenceAmount,
    context?.hookToEdit,
  ]);

  return (
    <ButtonPrimary
      className="mt-3"
      type="submit"
      disabled={shouldDisableButton}
    >
      {buttonMessage}
    </ButtonPrimary>
  );
}
