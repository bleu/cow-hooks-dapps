import { formatNumber } from "@bleu.builders/ui";
import { useMemo } from "react";

export const useFormatTokenAmount = ({
  amount,
  decimals,
}: {
  amount: bigint | undefined;
  decimals: number | undefined;
}) => {
  const float = useMemo(
    () =>
      amount !== undefined && decimals !== undefined
        ? Number(amount) / 10 ** Number(decimals)
        : undefined,
    [amount, decimals],
  );

  const formatted = useMemo(
    () =>
      float !== undefined
        ? formatNumber(float, 4, "decimal", "standard", 0.0001)
        : "",
    [float],
  );
  return { float, formatted };
};
