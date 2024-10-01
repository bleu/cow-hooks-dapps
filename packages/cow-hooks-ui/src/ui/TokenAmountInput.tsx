import { InfoTooltip } from "./TooltipBase";
import { cn, Input, Label } from "@bleu/ui";
import { HTMLProps } from "react";
import {
  FieldError,
  RegisterOptions,
  useFormContext,
  useFormState,
} from "react-hook-form";

interface IPeriodWithScaleInput
  extends Omit<HTMLProps<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
  tooltipText?: string;
  tooltipLink?: string;
  extraLabelElement?: React.ReactNode;
  validation?: RegisterOptions;
}

export function TokenAmountInput({
  name,
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
    <div>
      {label && (
        <div className="flex flex-row gap-x-2 items-center mb-2">
          <Label className="ml-2 block text-sm">{label}</Label>
          {tooltipText && <InfoTooltip text={tooltipText} link={tooltipLink} />}
          {extraLabelElement}
        </div>
      )}
      <div className="flex items-center justify-between h-12 py-2.5 px-1.5 bg-color-paper-darker rounded-xl">
        <div className="w-20 h-8 p-2.5 flex items-center justify-start gap-2 rounded-xl text-color-text-paper bg-color-paper">
          <span>@</span>
          <span className="m-0 p-0 min-h-fit">ETH</span>
        </div>
        <Input
          type="number"
          autoComplete="off"
          className={cn(
            "outline-none text-right w-full max-h-10 px-2.5 py-0 border-none rounded-l-xl text-base text-color-text-paper bg-inherit [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
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
