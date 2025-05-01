import { formatNumber } from "@bleu.builders/ui";
import { useMemo } from "react";
import { formatUnits } from "viem";

export const useFormatTokenAmount = ({
  amount,
  decimals,
  priceUsd,
}: {
  amount: bigint | undefined;
  decimals: number | undefined;
  priceUsd?: number;
}) => {
  const fullDecimals = useMemo(
    () =>
      amount !== undefined && decimals !== undefined
        ? formatUnits(amount, decimals)
        : "",
    [amount, decimals],
  );

  const formatted = useMemo(
    () =>
      fullDecimals !== undefined
        ? formatNumber(fullDecimals, 4, "decimal", "compact", 0.0001)
        : "",
    [fullDecimals],
  );

  const usd = useMemo(
    () =>
      fullDecimals && priceUsd !== undefined
        ? Number(fullDecimals) * priceUsd
        : undefined,
    [fullDecimals, priceUsd],
  );

  const usdFormatted = useMemo(
    () => (usd !== undefined ? `≈ $${formatNumber(usd, 2, "decimal")}` : ""),
    [usd],
  );

  return { formatted, fullDecimals, usd, usdFormatted };
};
