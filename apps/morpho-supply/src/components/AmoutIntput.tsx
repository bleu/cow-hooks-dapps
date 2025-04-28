import { Input, Label, cn } from "@bleu.builders/ui";
import { TokenLogo } from "@bleu/cow-hooks-ui";
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
  floatBalance: string;
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
  const value = values[name];

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

  const handleDisableMaxOnUserInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isMaxValue && e.isTrusted) {
      setValue(maxName, false);
    }
  };

  const token = new Token(chainId, asset.address, asset.decimals, asset.symbol);

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex flex-col gap-1 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker rounded-xl items-start",
          { "bg-color-paper-darker-hover": value },
        )}
      >
        {label && (
          <div className="flex flex-row gap-x-2 items-center mb-2">
            <Label className="block font-semibold opacity-70">{label}</Label>
          </div>
        )}
        <div className="flex w-full items-center justify-between gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step={`0.${"0".repeat(asset.decimals - 1)}1`}
            max="1000000000000"
            placeholder="0.0"
            autoComplete="off"
            className="outline-none font-semibold text-xl text-color-text-paper bg-inherit placeholder:opacity-70 text-left p-0 m-0 h-min border-none rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none truncate"
            onKeyDown={(e) =>
              ["e", "E", "+", "-", "ArrowUp", "ArrowDown"].includes(e.key) &&
              e.preventDefault()
            }
            onWheel={(e: React.WheelEvent<HTMLInputElement>) => {
              (e.target as HTMLInputElement).blur();
            }}
            {...register(name, {
              setValueAs: handleSetValue,
              onChange: handleDisableMaxOnUserInput,
            })}
          />
          <div className="rounded-full text-color-text-paper bg-color-paper cursor-default">
            {token && (
              <div className="w-fit py-1 px-2 flex items-center justify-center gap-2">
                <div className="w-6 h-6">
                  <TokenLogo token={token} height={24} width={24} alt="" />
                </div>
                <span className="m-0 p-0 min-h-fit text-lg">
                  {token?.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <span title={floatBalance} className="opacity-40 text-xs">
            {fiatBalance}
          </span>
          {formattedBalance && token?.symbol && (
            <span className="font-normal pl-1">
              <span title={floatBalance} className="opacity-40 text-xs">
                {formattedBalance} {token?.symbol}
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
