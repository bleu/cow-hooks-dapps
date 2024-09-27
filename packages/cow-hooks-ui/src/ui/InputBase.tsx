import { Input as InputPrimitive, Label, cn } from "@bleu/ui";
import React, { type HTMLProps } from "react";
import {
  type FieldError,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { InfoTooltip } from "./TooltipBase";

interface IInput extends Omit<HTMLProps<HTMLInputElement>, "name"> {
  name: string;
  validation?: RegisterOptions;
  tooltipText?: string;
  tooltipLink?: string;
  extraLabelElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, IInput>(
  ({
    name,
    label,
    validation,
    tooltipText,
    tooltipLink,
    extraLabelElement,
    className,
    ...props
  }: IInput) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    if (!name) {
      throw new Error("Input component requires a name prop");
    }

    const error = errors[name] as FieldError | undefined;
    const errorMessage = error?.message;

    return (
      <div className="flex flex-col w-full">
        {label && (
          <div className="flex flex-row gap-x-2 items-center mb-2">
            <Label className="block text-sm">{label}</Label>
            {tooltipText && (
              <InfoTooltip text={tooltipText} link={tooltipLink} />
            )}
            {extraLabelElement}
          </div>
        )}
        <InputPrimitive
          {...props}
          {...register(name, validation)}
          className={cn(
            "w-full shadow-none rounded-md placeholder:opacity-50 border border-border",
            className,
          )}
        />

        {errorMessage && (
          <div className="mt-1 text-sm text-destructive">{errorMessage}</div>
        )}
      </div>
    );
  },
);
