import {
  type IBalance,
  type IPool,
  Spinner,
  TokenLogoWithWeight,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { Button, Input, Label, formatNumber } from "@bleu/ui";
import { useCallback, useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { type Address, formatUnits } from "viem";
import { usePoolBalance } from "#/hooks/usePoolBalance";
import type { FormType } from "#/types";
import { calculateProportionalTokenAmounts, getTokenPrice } from "#/utils/math";

export function TokenAmountInput({
  poolBalance,
  tokenPrice,
  updateTokenAmounts,
}: {
  poolBalance: IBalance;
  tokenPrice?: number;
  updateTokenAmounts: (amount: number, address: Address) => void;
}) {
  const { register, control } = useFormContext<FormType>();

  const amount = useWatch({
    control,
    name: `amounts.${poolBalance.token.address.toLowerCase()}`,
  });

  const amountUsd = useMemo(() => {
    if (!amount || !tokenPrice) return 0;

    return amount * tokenPrice;
  }, [amount, tokenPrice]);

  const onChange = useCallback(
    (amount: number) => {
      if (updateTokenAmounts) {
        updateTokenAmounts(amount, poolBalance.token.address as Address);
      }
    },
    [updateTokenAmounts, poolBalance.token.address]
  );

  return (
    <div className="flex flex-row justify-between items-center px-3">
      <TokenLogoWithWeight
        token={poolBalance.token}
        weight={poolBalance.weight}
        className="text-lg"
      />
      <div className="flex flex-col gap-1 text-right">
        <Input
          className="bg-transparent border-transparent text-md text-right placeholder:text-foreground/50 px-0"
          type="number"
          placeholder="0.0"
          {...register(`amounts.${poolBalance.token.address.toLowerCase()}`, {
            onChange: (e) => {
              onChange(Number(e.target.value));
            },
          })}
          onKeyDown={(e) => {
            if (
              ["Enter", "-", "e", "E", "+", "ArrowUp", "ArrowDown"].includes(
                e.key
              )
            )
              e.preventDefault();
          }}
          onWheel={(e) => {
            // @ts-ignore
            e.target.blur();
          }}
          step={`0.${"0".repeat(poolBalance?.token?.decimals - 1)}1`}
        />
        <i className="text-xs text-right font-light">
          ${amountUsd && amountUsd >= 0 ? formatNumber(amountUsd, 2) : "0"}
        </i>
      </div>
    </div>
  );
}
