import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { formatNumber } from "@bleu/ui";
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
      userBalance && tokenDecimals
        ? Number(userBalance) / 10 ** Number(tokenDecimals)
        : undefined,
    [userBalance, tokenDecimals],
  );

  const swapAmountFloat = useMemo(
    () =>
      context?.orderParams?.buyAmount && tokenDecimals
        ? Number(context?.orderParams?.buyAmount) / 10 ** Number(tokenDecimals)
        : undefined,
    [context?.orderParams?.buyAmount, tokenDecimals],
  );

  const allAfterSwapFloat = useMemo(
    () =>
      userBalanceFloat && swapAmountFloat
        ? userBalanceFloat + swapAmountFloat
        : undefined,
    [userBalanceFloat, swapAmountFloat],
  );

  const formattedUserBalance = useMemo(
    () =>
      userBalanceFloat
        ? formatNumber(userBalanceFloat, 6, "decimal", "standard", 0.000001)
        : "",
    [userBalanceFloat],
  );

  const formattedSwapAmount = useMemo(
    () =>
      swapAmountFloat
        ? formatNumber(swapAmountFloat, 6, "decimal", "standard", 0.000001)
        : "",
    [swapAmountFloat],
  );

  const formattedAllAfterSwap = useMemo(
    () =>
      allAfterSwapFloat
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
