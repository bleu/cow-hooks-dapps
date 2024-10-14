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

interface IPeriodWithScaleInput
  extends Omit<HTMLProps<HTMLInputElement>, "name"> {
  name: string;
  token?: Token | undefined;
  label?: string;
  tooltipText?: string;
  tooltipLink?: string;
  extraLabelElement?: React.ReactNode;
  validation?: RegisterOptions;
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
  ...props
}: IPeriodWithScaleInput) {
  const { register, control } = useFormContext();

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
      <div className="flex items-center justify-between w-full h-12 py-2.5 px-1.5 bg-color-paper-darker rounded-xl">
        {token && (
          <div className="w-min h-8 p-2.5 flex items-center justify-start gap-2 rounded-xl text-color-text-paper bg-color-paper">
            <div className="w-4 h-4">
              <TokenLogo token={token} height={16} width={16} alt="" />
            </div>
            <span className="m-0 p-0 min-h-fit">{token?.symbol}</span>
          </div>
        )}
        <Input
          // autoComplete="off"
          className={cn(
            "outline-none text-right w-full max-h-10 px-2.5 py-0 border-none rounded-l-xl text-base text-color-text-paper bg-inherit [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className,
          )}
          {...register(name, validation)}
          {...props}
        />
      </div>
      {errorMessage && (
        <div className="mt-1 ml-2 text-start text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
