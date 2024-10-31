import { useTokensAfterSwap } from "#/hooks/useTokensAfterSwap";
import { FormType } from "#/types";
import { ButtonPrimary, IBalance, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Address } from "viem";

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

  const { control } = useFormContext<FormType>();

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
        if (!token) return;
        const amount = amounts[tokenAddress];
        if (!amount) return;
        const tokenBalance = Number(token.balance);
        const tokenAmount = Number(amount);
        if (tokenBalance < tokenAmount) return token.symbol;
      })
      .filter((symbol) => symbol) as string[];
  }, [amounts, poolTokens, tokenAddresses]);

  const shouldDisableButton = useMemo(() => {
    if (insufficientTokenSymbols.length) return true;
    if (Number(referenceAmount) <= 0) return true;
    if (isSubmitting) return true;
    return false;
  }, [insufficientTokenSymbols, isSubmitting, referenceAmount]);

  const ButtonMessage = () => {
    if (insufficientTokenSymbols.length) {
      return `Insufficient balance for ${insufficientTokenSymbols.join(", ")}`;
    }
    if (isSubmitting) return "Creating hook...";
    if (context?.hookToEdit) return "Update post-hook";
    return "Add post-hook";
  };
  return (
    <ButtonPrimary
      className="mt-3"
      type="submit"
      disabled={shouldDisableButton}
    >
      <ButtonMessage />
    </ButtonPrimary>
  );
}
