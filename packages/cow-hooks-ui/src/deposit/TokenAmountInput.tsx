import { Button, Input, formatNumber } from "@bleu.builders/ui";

import { type DepositFormType, constraintStringToBeNumeric } from "@bleu/utils";
import { useCallback, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";
import { TokenLogoWithWeight } from "../TokenLogoWithWeight";
import { useIFrameContext } from "../context";
import { useSwapAmount } from "../hooks/useSwapAmount";
import { useTokenBalanceAfterSwap } from "../hooks/useTokenBalanceAfterSwap";
import type { IBalance } from "../types";
import { InfoTooltip } from "../ui/TooltipBase";

export function TokenAmountInputDeposit({
  poolBalance,
  tokenPrice,
  updateTokenAmounts,
}: {
  poolBalance: IBalance;
  tokenPrice?: number;
  updateTokenAmounts: (amount: string, address: Address) => void;
}) {
  const { context } = useIFrameContext();
  const { register, control, setValue } = useFormContext<DepositFormType>();

  const amount = useWatch({
    control,
    name: `amounts.${poolBalance.token.address.toLowerCase()}`,
  });

  const {
    float: tokenBalanceAfterSwapFloat,
    formatted: formattedTokenBalanceAfterSwap,
  } = useTokenBalanceAfterSwap(poolBalance.token.address);

  const isTokenBuy = useMemo(() => {
    return (
      context?.orderParams?.buyTokenAddress.toLowerCase() ===
      poolBalance.token.address.toLowerCase()
    );
  }, [context?.orderParams?.buyTokenAddress, poolBalance.token.address]);

  const { buyAmount } = useSwapAmount();

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

  const maxButtonDisabled = useMemo(() => {
    return (
      tokenBalanceAfterSwapFloat &&
      (tokenBalanceAfterSwapFloat <= 0 ||
        Number(amount) === tokenBalanceAfterSwapFloat)
    );
  }, [tokenBalanceAfterSwapFloat, amount]);

  const buyAmountDisabled = useMemo(() => {
    return !isTokenBuy || Number(buyAmount) <= 0 || amount === buyAmount;
  }, [isTokenBuy, buyAmount, amount]);

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
          {tokenBalanceAfterSwapFloat !== undefined && (
            <div className="flex flex-col xsm:flex-row gap-2">
              <div className="flex items-center">
                <InfoTooltip
                  className="opacity-70"
                  text="Estimated balance, it might change depending of order and fee update."
                />

                <span className="ml-1 inline text-xs font-normal opacity-70 w-fit">
                  Balance: {formattedTokenBalanceAfterSwap}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!maxButtonDisabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-sm text-xs py-0 px-1 bg-background text-foreground/50 hover:bg-primary hover:text-primary-foreground h-fit inline"
                    onClick={() => {
                      setValue(
                        `amounts.${poolBalance.token.address.toLowerCase()}`,
                        tokenBalanceAfterSwapFloat.toString(),
                      );
                      onChange(tokenBalanceAfterSwapFloat.toString());
                    }}
                  >
                    Max
                  </Button>
                )}
                {!buyAmountDisabled && buyAmount && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-sm text-xs py-0 px-1 bg-background text-foreground/50 hover:bg-primary hover:text-primary-foreground h-fit inline"
                    onClick={() => {
                      setValue(
                        `amounts.${poolBalance.token.address.toLowerCase()}`,
                        buyAmount,
                      );
                      onChange(buyAmount);
                    }}
                  >
                    Buy amount
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs text-right font-normal pr-0">
            $
            {amountUsd && amountUsd >= 0
              ? formatNumber(amountUsd, 2, "decimal", "standard", 0.01)
              : "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
