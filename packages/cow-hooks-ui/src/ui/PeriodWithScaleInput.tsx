import {
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@bleu/ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { type HTMLProps, useState } from "react";
import {
  type FieldError,
  type RegisterOptions,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { InfoTooltip } from "./TooltipBase";

interface IPeriodWithScaleInput extends HTMLProps<HTMLInputElement> {
  periodScaleOptions: string[];
  namePeriodValue: string;
  namePeriodScale: string;
  label?: string;
  tooltipText?: string;
  tooltipLink?: string;
  extraLabelElement?: React.ReactNode;
  validation?: RegisterOptions;
}

export function PeriodWithScaleInput({
  periodScaleOptions,
  namePeriodValue,
  namePeriodScale,
  label,
  tooltipText,
  tooltipLink,
  extraLabelElement,
  validation,
  className,
  ...props
}: IPeriodWithScaleInput) {
  const [open, setOpen] = useState(false);

  const { register, control, setValue } = useFormContext();

  const { errors } = useFormState({ control });
  const { period, periodScale } = useWatch({ control });

  const error = errors[namePeriodValue] as FieldError | undefined;
  const errorMessage = error?.message;

  return (
    <div className="flex flex-col flex-grow items-start justify-start text-center">
      {label && (
        <div className="flex flex-row gap-x-2 items-center mb-2">
          <Label className="ml-2 block text-sm">{label}</Label>
          {tooltipText && <InfoTooltip text={tooltipText} link={tooltipLink} />}
          {extraLabelElement}
        </div>
      )}
      <div className="flex items-center justify-start h-12 px-1 py-2.5 bg-color-paper-darker rounded-xl">
        <input
          className={cn(
            "outline-none text-left w-36 max-h-10 px-2.5 py-0 border-none rounded-l-xl text-base text-color-text-paper bg-inherit [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className,
          )}
          {...register(namePeriodValue, validation)}
          {...props}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="px-1.5">
            <div
              className="w-[100px] h-8 p-2.5 flex items-center justify-between rounded-xl text-color-text-paper bg-color-paper hover:bg-color-primary hover:text-color-button-text transition-all duration-[200ms] ease-in-out"
              onClick={() => setOpen(true)}
            >
              <span className="m-0 p-0 min-h-fit">
                {period > 1 ? `${periodScale}s` : periodScale}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col relative top-[-44px] left-[0px] w-[120px] bg-color-paper-darkest px-[10px] py-[8px] rounded-xl border-none">
            {periodScaleOptions.map((periodScale) => {
              return (
                <button
                  key={periodScale}
                  type="button"
                  className="w-[100px] h-8 p-2.5 flex justify-start items-center rounded-xl hover:bg-color-primary hover:text-color-button-text transition-all duration-[200ms] ease-in-out"
                  onClick={() => {
                    setOpen(false);
                    setValue(namePeriodScale, periodScale);
                  }}
                >
                  {period > 1 ? `${periodScale}s` : periodScale}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>
      {errorMessage && (
        <div className="mt-1 ml-2 text-start text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
