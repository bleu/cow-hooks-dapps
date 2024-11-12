import { Button, Input, formatNumber } from "@bleu.builders/ui";
import { type IBalance, TokenLogoWithWeight } from "@bleu/cow-hooks-ui";
import { useCallback, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";
import { useTokenBalanceAfterSwap } from "#/hooks/useTokenBalanceAfterSwap";
import type { FormType } from "#/types";
import { constraintStringToBeNumeric } from "#/utils/constraintStringToBeNumeric";

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
  const amountFromSwap = useWatch({
    control,
    name: "amountFromSwap",
  });
  const amountFromAccount = useWatch({
    control,
    name: "amountFromAccount",
  });

  const tokenBalanceAfterSwap = useTokenBalanceAfterSwap(
    poolBalance.token.address,
  );

  const amountUsd = useMemo(() => {
    if (!amount || !tokenPrice) return 0;

    return Number(amount) * tokenPrice;
  }, [amount, tokenPrice]);

  const onChange = useCallback(
    (amount: string) => {
      if (updateTokenAmounts) {
        updateTokenAmounts(
          constraintStringToBeNumeric(amount),
          poolBalance.token.address as Address,
        );
      }
    },
    [updateTokenAmounts, poolBalance.token.address],
  );

  const disabled = amountFromSwap || amountFromAccount;

  const buttonDisabled =
    disabled ||
    Number(tokenBalanceAfterSwap) <= 0 ||
    amount === tokenBalanceAfterSwap;

  return (
    <div className="grid grid-cols-2 min-h-24 w-full bg-muted text-muted-foreground rounded-xl p-3">
      <div className="flex items-center justify-start">
        <TokenLogoWithWeight
          token={poolBalance.token}
          weight={poolBalance.weight}
          className="text-md xsm:text-lg h-10"
        />
      </div>
      <div className="flex items-center justify-end">
        <Input
          className="flex bg-transparent items-center border-none text-xl text-right placeholder:text-foreground/50 p-0 truncate disabled:text-foreground/50 disabled:opacity-100 disabled:cursor-default font-semibold"
          type="text"
          placeholder="0.0"
          autoComplete="off"
          disabled={disabled}
          title={amount}
          {...register(`amounts.${poolBalance.token.address.toLowerCase()}`, {
            onChange: (e) => {
              onChange(e.target.value);
              setValue(
                `amounts.${poolBalance.token.address.toLowerCase()}`,
                constraintStringToBeNumeric(e.target.value),
              );
            },
          })}
          onWheel={(e) => {
            // @ts-ignore
            e.target.blur();
          }}
          step={`0.${"0".repeat(poolBalance?.token?.decimals - 1)}1`}
        />
      </div>
      <div className="flex items-center justify-between col-span-2">
        <div className="flex items-center justify-start">
          {tokenBalanceAfterSwap && (
            <span>
              <span className="ml-1 text-xs font-normal opacity-70">
                Balance:{" "}
                {formatNumber(
                  tokenBalanceAfterSwap,
                  4,
                  "decimal",
                  "standard",
                  0.0001,
                ).replace(/\.?0+$/, "")}
              </span>
              {!buttonDisabled && (
                <Button
                  type="button"
                  variant="ghost"
                  className="ml-1 rounded-sm text-xs py-0 px-1 bg-background text-foreground/50 hover:bg-primary hover:text-primary-foreground h-fit inline"
                  onClick={() => {
                    setValue(
                      `amounts.${poolBalance.token.address.toLowerCase()}`,
                      tokenBalanceAfterSwap,
                    );
                    onChange(tokenBalanceAfterSwap);
                  }}
                >
                  Max
                </Button>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs text-right font-normal pr-0">
            ${amountUsd && amountUsd >= 0 ? formatNumber(amountUsd, 2) : "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
