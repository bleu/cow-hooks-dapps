import { formatNumber } from "@bleu.builders/ui";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";

export const useFormatVariables = ({
  userBalance,
  tokenDecimals,
}: {
  userBalance: bigint | undefined;
  tokenDecimals: number | undefined;
}) => {
  const { context } = useIFrameContext();

  const userBalanceFloat = useMemo(
    () =>
      userBalance !== undefined && tokenDecimals
        ? Number(userBalance) / 10 ** Number(tokenDecimals)
        : undefined,
    [userBalance, tokenDecimals],
  );

  const swapAmountFloat = useMemo(
    () =>
      context?.orderParams?.buyAmount !== undefined && tokenDecimals
        ? Number(context?.orderParams?.buyAmount) / 10 ** Number(tokenDecimals)
        : undefined,
    [context?.orderParams?.buyAmount, tokenDecimals],
  );

  const allAfterSwapFloat = useMemo(
    () =>
      userBalanceFloat !== undefined && swapAmountFloat !== undefined
        ? userBalanceFloat + swapAmountFloat
        : undefined,
    [userBalanceFloat, swapAmountFloat],
  );

  const formattedUserBalance = useMemo(
    () =>
      userBalanceFloat !== undefined
        ? formatNumber(userBalanceFloat, 4, "decimal", "standard", 0.0001)
        : "",
    [userBalanceFloat],
  );

  const formattedSwapAmount = useMemo(
    () =>
      swapAmountFloat !== undefined
        ? formatNumber(swapAmountFloat, 4, "decimal", "standard", 0.0001)
        : "",
    [swapAmountFloat],
  );

  const formattedAllAfterSwap = useMemo(
    () =>
      allAfterSwapFloat !== undefined
        ? formatNumber(allAfterSwapFloat, 6, "decimal", "standard", 0.000001)
        : "",
    [allAfterSwapFloat],
  );

  return {
    userBalanceFloat,
    swapAmountFloat,
    allAfterSwapFloat,
    formattedUserBalance,
    formattedSwapAmount,
    formattedAllAfterSwap,
  };
};
