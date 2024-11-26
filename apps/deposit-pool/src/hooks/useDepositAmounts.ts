import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { parseUnits } from "viem";
import type { FormType } from "#/types";
import { useSelectedPool } from "./useSelectedPool";

export function useDepositAmounts(): Record<string, bigint> {
  const { control } = useFormContext<FormType>();
  const amounts = useWatch({ control, name: "amounts" });
  const selectedPool = useSelectedPool();

  return useMemo(() => {
    if (!selectedPool) return {};

    return Object.fromEntries(
      Object.entries(amounts).map(([key, value]) => {
        const token = selectedPool.allTokens.find(
          (token) => token.address.toLowerCase() === key.toLowerCase(),
        );
        if (!token) return [key, parseUnits(value, 18)];

        return [key, parseUnits(value, token.decimals)];
      }),
    );
  }, [selectedPool, amounts]);
}
