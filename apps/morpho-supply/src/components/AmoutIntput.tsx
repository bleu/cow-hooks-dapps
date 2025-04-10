import { Input, Label, cn } from "@bleu.builders/ui";
import { InfoTooltip, TokenLogo } from "@bleu/cow-hooks-ui";
import { Token } from "@uniswap/sdk-core";
import {
  type FieldError,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import type { Address } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";

interface AmountInputProps {
  name: "supplyAmount" | "borrowAmount";
  label: string;
  maxName: "isMaxSupply" | "isMaxBorrow";
  asset: {
    address: Address;
    decimals: number;
    name: string;
    symbol: string;
    priceUsd: number;
    logoURI: string;
  };
  chainId: number;
  formattedBalance: string;
  floatBalance: number;
  fiatBalance: string;
}

export const AmountInput = ({
  name,
  label,
  maxName,
  asset,
  chainId,
  formattedBalance,
  floatBalance,
  fiatBalance,
}: AmountInputProps) => {
  const { register, control, setValue } =
    useFormContext<MorphoSupplyFormData>();

  const { errors } = useFormState({ control });
  const values = useWatch({ control });

  const isMaxValue = values[maxName] as boolean;

  const error = errors[name] as FieldError | undefined;
  const errorMessage = error?.message;

  const handleSetValue = (value: string) => {
    if (value === "") return undefined;
    if (typeof value === "number") return value;

    let v = value;
    v = v.replace(",", ".");
    const inputedDecimals = v.includes(".") && v.split(".").at(-1);
    if (inputedDecimals && inputedDecimals.length > asset.decimals)
      return Number(v.slice(0, -(inputedDecimals.length - asset.decimals)));
    return Number(v);
  };

  const tooltipText = undefined;
  const tooltipLink = undefined;
  const extraLabelElement = undefined;

  const token = new Token(chainId, asset.address, asset.decimals, asset.symbol);

  const userBalance = formattedBalance;
  const userBalanceFullDecimals = String(floatBalance);
  const fiatAmount = fiatBalance;

  const className = "";
  const validation = { setValueAs: handleSetValue };

  return (
    <div className="w-full">
      {label && (
        <div className="flex flex-row gap-x-2 items-center mb-2">
          <Label className="ml-2 block text-sm">{label}</Label>
          {tooltipText && <InfoTooltip text={tooltipText} link={tooltipLink} />}
          {extraLabelElement}
        </div>
      )}
      <div className="flex flex-col gap-1 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker rounded-xl items-start">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="rounded-xl text-color-text-paper bg-color-paper cursor-default">
            {token && (
              <div className="w-fit py-2 px-4 flex items-center justify-center gap-2">
                <div className="w-6 h-6">
                  <TokenLogo token={token} height={24} width={24} alt="" />
                </div>
                <span className="m-0 p-0 min-h-fit">{token?.symbol}</span>
              </div>
            )}
          </div>
          <Input
            type="number"
            inputMode="decimal"
            step={`0.${"0".repeat(asset.decimals - 1)}1`}
            max="1000000000000"
            placeholder="0.0"
            autoComplete="off"
            className={cn(
              "outline-none font-semibold text-xl text-color-text-paper bg-inherit placeholder:opacity-70 text-right p-0 m-0 h-min border-none rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none truncate",
              className,
            )}
            onKeyDown={(e) =>
              ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
            }
            {...register(name, validation)}
          />
        </div>
        <div className="flex w-full justify-between items-center">
          {userBalance && token?.symbol && (
            <span className="font-normal pl-1">
              <span
                title={userBalanceFullDecimals}
                className="opacity-40 text-xs"
              >
                Max: {userBalance} {token?.symbol}
              </span>
              <button
                type="button"
                className={cn(
                  "inline text-color-text-paper bg-color-paper px-1 ml-1 opacity-100 rounded-md text-xs hover:bg-color-primary hover:text-color-button-text transition-all duration-[200ms] ease-in-out [outline:none]",
                  {
                    "bg-color-primary text-color-button-text": isMaxValue,
                  },
                )}
                onClick={() => setValue(maxName, !isMaxValue)}
              >
                MAX
              </button>
            </span>
          )}
          <span title={userBalanceFullDecimals} className="opacity-40 text-xs">
            {fiatAmount}
          </span>
        </div>
      </div>
      {errorMessage && (
        <div className="mt-1 ml-2 text-start text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
