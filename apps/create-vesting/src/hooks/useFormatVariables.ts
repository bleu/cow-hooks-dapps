import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { formatNumber } from "@bleu/ui";

export const useFormatVariables = ({
  userBalance,
  tokenDecimals,
}: {
  userBalance: bigint | undefined;
  tokenDecimals: number | undefined;
}) => {
  const { context } = useIFrameContext();

  const userBalanceFloat =
    userBalance && tokenDecimals
      ? Number(userBalance) / 10 ** Number(tokenDecimals)
      : undefined;

  const swapAmountFloat =
    context?.orderParams?.buyAmount && tokenDecimals
      ? Number(context?.orderParams?.buyAmount) / 10 ** Number(tokenDecimals)
      : undefined;

  const allAfterSwapFloat =
    userBalanceFloat && swapAmountFloat
      ? userBalanceFloat + swapAmountFloat
      : undefined;

  const formattedUserBalance = userBalanceFloat
    ? formatNumber(userBalanceFloat, 6, "decimal", "standard", 0.000001)
    : "";

  const formattedSwapAmount = swapAmountFloat
    ? formatNumber(swapAmountFloat, 6, "decimal", "standard", 0.000001)
    : "";

  const formattedAllAfterSwap = allAfterSwapFloat
    ? formatNumber(allAfterSwapFloat, 6, "decimal", "standard", 0.000001)
    : "";

  return {
    userBalanceFloat,
    swapAmountFloat,
    allAfterSwapFloat,
    formattedUserBalance,
    formattedSwapAmount,
    formattedAllAfterSwap,
  };
};
