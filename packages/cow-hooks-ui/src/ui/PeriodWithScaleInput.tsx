import { InfoTooltip } from "./TooltipBase";
import {
  cn,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bleu/ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { HTMLProps, useState } from "react";
import {
  FieldError,
  RegisterOptions,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";

interface IPeriodWithScaleInput
  extends Omit<HTMLProps<HTMLInputElement>, "name"> {
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
    <div>
      {label && (
        <div className="flex flex-row gap-x-2 items-center mb-2">
          <Label className="ml-2 block text-sm">{label}</Label>
          {tooltipText && <InfoTooltip text={tooltipText} link={tooltipLink} />}
          {extraLabelElement}
        </div>
      )}
      <div className="flex w-48 gap-1">
        <Input
          type="number"
          autoComplete="off"
          className={cn(
            "outline-none text-right w-24 h-10 p-2.5 rounded-l-xl rounded-r-none text-base text-color-text-paper border-color-border bg-color-paper-darker [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          {...register(namePeriodValue, validation)}
          {...props}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="w-full">
            <div className="flex flex-col">
              <div
                className="w-24 h-10 p-2.5 flex items-center justify-between rounded-r-xl text-color-text-paper bg-color-paper-darker"
                onClick={() => setOpen(true)}
              >
                <span className="m-0 p-0 min-h-fit">
                  {period > 1 ? `${periodScale}s` : periodScale}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col w-[100px] bg-color-paper-darker px-0 py-2 border-none">
            {periodScaleOptions.map((periodScale) => {
              return (
                <button
                  key={periodScale}
                  className="text-start p-2 hover:bg-color-paper-darkest"
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
