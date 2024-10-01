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
      <div className="flex items-center justify-center w-[200px] h-10 p-2.5 bg-color-paper-darker rounded-xl">
        <Input
          type="number"
          autoComplete="off"
          className={cn(
            "outline-none text-right w-24 max-h-10 px-2.5 py-0 border-none rounded-l-xl text-base text-color-text-paper bg-inherit [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          {...register(namePeriodValue, validation)}
          {...props}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="w-full">
            <div
              className="w-24 h-8 p-2.5 flex items-center justify-between rounded-xl text-color-text-paper bg-color-paper-darkest"
              onClick={() => setOpen(true)}
            >
              <span className="m-0 p-0 min-h-fit">
                {period > 1 ? `${periodScale}s` : periodScale}
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col relative top-[-40px] left-[4px] w-[100px] bg-color-paper-darker px-0 py-1 rounded-xl border-none">
            {periodScaleOptions.map((periodScale) => {
              return (
                <button
                  key={periodScale}
                  className="w-24 h-8 p-2.5 flex justify-center items-center rounded-xl hover:bg-color-paper-darkest"
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
