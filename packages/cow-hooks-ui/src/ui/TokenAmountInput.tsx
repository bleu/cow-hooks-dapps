import { Input, Label, cn } from "@bleu/ui";
import type { Token } from "@uniswap/sdk-core";
import type { HTMLProps } from "react";
import {
  type FieldError,
  type RegisterOptions,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { TokenLogo } from "../TokenLogo";
import { InfoTooltip } from "./TooltipBase";

export interface ITokenAmountInput
  extends Omit<HTMLProps<HTMLInputElement>, "name"> {
  name: string;
  token?: Token | undefined;
  label?: string;
  tooltipText?: string;
  tooltipLink?: string;
  extraLabelElement?: React.ReactNode;
  validation?: RegisterOptions;
  disabled?: boolean;
  disabledValue?: string | undefined;
  disabledValueFullDecimals?: string | undefined;
  userBalance?: string | undefined;
  userBalanceFullDecimals?: string | undefined;
  shouldEnableMaxSelector?: boolean;
  shouldDisplayApprox?: boolean;
}

export function TokenAmountInput({
  name,
  token,
  label,
  tooltipText,
  tooltipLink,
  extraLabelElement,
  validation,
  className,
  disabled,
  disabledValue,
  disabledValueFullDecimals,
  userBalance,
  userBalanceFullDecimals,
  shouldEnableMaxSelector,
  shouldDisplayApprox,
  ...props
}: ITokenAmountInput) {
  const { register, control, setValue } = useFormContext();

  const { errors } = useFormState({ control });

  const error = errors[name] as FieldError | undefined;
  const errorMessage = error?.message;

  return (
    <div className="w-full">
      {label && (
        <div className="flex flex-row gap-x-2 items-center mb-2">
          <Label className="ml-2 block text-sm">{label}</Label>
          {tooltipText && <InfoTooltip text={tooltipText} link={tooltipLink} />}
          {extraLabelElement}
        </div>
      )}
      <div className="flex items-center justify-between w-full min-h-24 py-4 px-6 bg-color-paper-darker rounded-xl">
        <div className="rounded-xl text-color-text-paper bg-color-paper cursor-default">
          {token && (
            <div className="min-w-30 w-fit h-12 px-4 flex items-center justify-center gap-2">
              <div className="w-6 h-6">
                <TokenLogo token={token} height={24} width={24} alt="" />
              </div>
              <span className="m-0 p-0 min-h-fit">{token?.symbol}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between items-end h-full">
          {disabled ? (
            <span
              title={disabledValueFullDecimals}
              className="outline-none text-right p-0 m-0 border-none text-xl text-color-text-paper bg-inherit placeholder:opacity-70 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-default font-semibold"
            >
              {shouldDisplayApprox && "≈ "}
              {disabledValue}
            </span>
          ) : (
            <Input
              className={cn(
                "outline-none text-right p-0 m-0 h-min border-none rounded-none text-xl text-color-text-paper bg-inherit placeholder:opacity-70 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-semibold",
                className,
              )}
              {...register(name, validation)}
              {...props}
            />
          )}
          {userBalance && token?.symbol && shouldEnableMaxSelector && (
            <span className="font-normal">
              <button
                type="button"
                className="inline text-color-text-paper bg-color-paper px-1 mr-1 opacity-100 rounded-md text-xs hover:bg-color-primary hover:text-color-button-text transition-all duration-[200ms] ease-in-out [outline:none]"
                onClick={() => setValue(name, Number(userBalanceFullDecimals))}
              >
                MAX
              </button>
              <span
                title={userBalanceFullDecimals}
                className="opacity-40 text-xs cursor-default text-right"
              >
                Balance: {userBalance} {token?.symbol}
              </span>
            </span>
          )}
          {userBalance && token?.symbol && !shouldEnableMaxSelector && (
            <span
              title={userBalanceFullDecimals}
              className="opacity-40 text-xs cursor-default"
            >
              Balance: {userBalance} {token?.symbol}
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
}
