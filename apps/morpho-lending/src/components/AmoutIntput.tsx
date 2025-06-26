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
import type { InputFieldName, MaxFieldName } from "#/constants/forms";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { isZeroOrEmpty } from "#/utils/isZeroOrEmpty";

interface AmountInputProps {
  name: InputFieldName;
  label: string;
  maxName: MaxFieldName;
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

// Helper function to validate and format decimal string
const validateDecimalString = (value: string, maxDecimals: number): string => {
  // Remove any non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, ""); // Removed comma from here since you handle it separately

  // Handle multiple decimal points - keep only the first one
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
  }

  // Limit decimal places but preserve trailing decimal point
  if (cleaned.includes(".")) {
    const [integer, decimal] = cleaned.split(".");
    if (decimal.length > maxDecimals) {
      const limitedDecimal = decimal.slice(0, maxDecimals);
      cleaned = `${integer}.${limitedDecimal}`;
    } else {
      // Keep the decimal point even if nothing follows it yet
      cleaned = `${integer}.${decimal}`;
    }
  }

  // Remove leading zeros but preserve "0." for decimals
  if (cleaned.length > 1 && cleaned[0] === "0" && cleaned[1] !== ".") {
    cleaned = cleaned.replace(/^0+/, "") || "0";
  }

  return cleaned;
};

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
  const value = values[name] as string;

  const error = errors[name] as FieldError | undefined;
  const errorMessage = error?.message;

  const handleSetValue = (value: string): string => {
    if (value === "") return "";

    // Replace comma with period for international number formats
    const v = value.replace(",", ".");

    const validatedString = validateDecimalString(v, asset.decimals);
    return validatedString;
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
          "flex flex-col gap-1 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker/60 rounded-xl items-start",
          { "bg-color-paper-darker": value && !isZeroOrEmpty(value) },
        )}
      >
        {label && (
          <div className="flex flex-row gap-x-2 items-center mb-2">
            <Label className="block font-semibold opacity-70">{label}</Label>
          </div>
        )}
        <div className="flex items-center gap-4 w-full justify-between">
          <Input
            type="text"
            inputMode="decimal"
            value={values[name]}
            placeholder="0.0"
            autoComplete="off"
            className="max-w-36 outline-none font-semibold text-xl text-color-text-paper bg-inherit placeholder:opacity-70 text-left p-0 m-0 h-min border-none rounded-none truncate"
            onWheel={(e: React.WheelEvent<HTMLInputElement>) => {
              (e.target as HTMLInputElement).blur();
            }}
            {...register(name, {
              setValueAs: handleSetValue,
              onChange: handleDisableMaxOnUserInput,
            })}
          />
          <div className="rounded-3xl p-1.5 text-color-text-paper bg-color-paper cursor-default flex ">
            {token && (
              <div className="flex flex-1 items-center gap-1.5">
                <span className="flex-shrink-0 flex-grow-0 w-6 h-6">
                  <TokenLogo
                    token={token}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </span>
                <p className="text-lg line-clamp-3">{token.symbol}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <span title={floatBalance} className="opacity-40 text-xs">
            {fiatBalance}
          </span>
          {formattedBalance && token?.symbol && (
            <span className="flex items-center gap-1">
              <span
                title={floatBalance}
                className="opacity-60 text-xs text-color-text-paper"
              >
                {formattedBalance} {token?.symbol}
              </span>
              {!isZeroOrEmpty(floatBalance) && (
                <button
                  type="button"
                  disabled={isZeroOrEmpty(floatBalance)}
                  className={cn(
                    "inline font-semibold text-opacity-60  text-color-text-paper bg-color-paper py-[3px] px-[4px] ml-1  rounded-md text-xs hover:bg-color-primary hover:text-color-button-text transition-all duration-[200ms] ease-in-out [outline:none]",
                    {
                      "bg-color-primary text-color-button-text text-opacity-100":
                        isMaxValue,
                    },
                  )}
                  onClick={() => setValue(maxName, !isMaxValue)}
                >
                  MAX
                </button>
              )}
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
