import {
  type IBalance,
  TokenLogoWithWeight,
  useReadTokenContract,
} from "@bleu/cow-hooks-ui";
import { Button, Input, cn, formatNumber } from "@bleu/ui";
import { useCallback, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { type Address, formatUnits } from "viem";
import type { FormType } from "#/types";

export function TokenAmountInput({
  poolBalance,
  tokenPrice,
  updateTokenAmounts,
}: {
  poolBalance: IBalance;
  tokenPrice?: number;
  updateTokenAmounts: (amount: string, address: Address) => void;
}) {
  const { register, control, setValue } = useFormContext<FormType>();

  const amount = useWatch({
    control,
    name: `amounts.${poolBalance.token.address.toLowerCase()}`,
  });

  const amountUsd = useMemo(() => {
    if (!amount || !tokenPrice) return 0;

    return Number(amount) * tokenPrice;
  }, [amount, tokenPrice]);

  const onChange = useCallback(
    (amount: string) => {
      if (updateTokenAmounts) {
        updateTokenAmounts(amount, poolBalance.token.address as Address);
      }
    },
    [updateTokenAmounts, poolBalance.token.address]
  );

  const tokenInfo = useReadTokenContract({
    tokenAddress: poolBalance.token.address as Address,
  });

  return (
    <div className="grid grid-cols-3 w-full gap-2 bg-muted text-muted-foreground rounded-xl p-3">
      <TokenLogoWithWeight
        token={poolBalance.token}
        weight={poolBalance.weight}
        className="text-lg"
      />
      <Input
        className="bg-transparent col-span-2 border-transparent text-xl text-right placeholder:text-foreground/50 px-0"
        type="number"
        placeholder="0.0"
        {...register(`amounts.${poolBalance.token.address.toLowerCase()}`, {
          onChange: (e) => {
            onChange(e.target.value);
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
      <div>
        {tokenInfo && (
          <div className="flex gap-1">
            <span
              className={cn("text-xs font-normal", !tokenInfo && "sr-only")}
            >
              Balance{" "}
              {tokenInfo &&
                formatNumber(
                  formatUnits(
                    tokenInfo.userBalance || BigInt(0),
                    tokenInfo.tokenDecimals || 18
                  )
                )}
            </span>
            {tokenInfo.userBalance &&
              tokenInfo.tokenDecimals &&
              formatUnits(tokenInfo.userBalance, tokenInfo.tokenDecimals) !==
                amount && (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-sm text-xs py-0 px-1 bg-background text-foreground/50 hover:bg-primary hover:text-primary-foreground h-fit"
                  onClick={() => {
                    if (!tokenInfo.userBalance || !tokenInfo.tokenDecimals)
                      return;
                    const maxValue = formatUnits(
                      tokenInfo.userBalance,
                      tokenInfo.tokenDecimals
                    );
                    setValue(
                      `amounts.${poolBalance.token.address.toLowerCase()}`,
                      maxValue
                    );
                    onChange(maxValue);
                  }}
                >
                  Max
                </Button>
              )}
          </div>
        )}
      </div>
      <span className="text-xs text-right font-normal col-span-2">
        ${amountUsd && amountUsd >= 0 ? formatNumber(amountUsd, 2) : "0"}
      </span>
    </div>
  );
}
