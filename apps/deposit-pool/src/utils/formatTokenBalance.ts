import { formatNumber } from "@bleu/ui";

export const formatTokenBalance = (
  balance: bigint,
  tokenDecimals: number,
  swapAmount: string | null,
) => {
  const balanceNowFloat = Number(balance) / 10 ** Number(tokenDecimals);
  const swapAmountFloat =
    swapAmount !== null ? Number(swapAmount) / 10 ** Number(tokenDecimals) : 0;
  const balanceAfterSwapFloat = balanceNowFloat + swapAmountFloat;

  const balanceNowFormatted = formatNumber(
    balanceAfterSwapFloat,
    4,
    "decimal",
    "standard",
    0.0001,
  );

  const balanceAfterSwapFormatted = formatNumber(
    balanceAfterSwapFloat,
    4,
    "decimal",
    "standard",
    0.0001,
  );

  return {
    balanceNow: balanceNowFloat,
    balanceAfterSwap: balanceAfterSwapFloat,
    balanceNowFormatted,
    balanceAfterSwapFormatted,
  };
};
