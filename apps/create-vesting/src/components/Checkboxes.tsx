import { Input, Label } from "@bleu/ui";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const Checkbox = ({
  name,
  label,
  isSelectedMessage,
  unselectTrigger,
  radius = 14,
}: {
  name: string;
  label?: string;
  isSelectedMessage?: string;
  unselectTrigger?: boolean;
  radius?: number;
}) => {
  const { register, control, setValue } = useFormContext();
  const isSelected = useWatch({ control })[name];

  useEffect(() => {
    if (unselectTrigger === true) setValue(name, false);
  }, [unselectTrigger, setValue, name]);

  return (
    <div className="flex flex-col items-start justify-start">
      <div className="flex items-center">
        <div className="relative p-1">
          <Input
            type="checkbox"
            id={name}
            checked={isSelected}
            {...register(name)}
            className="sr-only" // This hides the input visually but keeps it accessible
          />
          <label
            htmlFor={name}
            style={{
              width: `${radius}px`,
              height: `${radius}px`,
            }}
            className={`
            flex items-center justify-center rounded-full border-none cursor-pointer
            bg-color-primary-lighter hover:bg-color-primary [&>span>span]:hover:bg-color-primary
          `}
          >
            <span
              // It's weird, but tailwind classes don't work for this
              style={{
                width: `${(radius * 3) / 4}px`,
                height: `${(radius * 3) / 4}px`,
              }}
              className={`
              flex items-center justify-center rounded-full bg-color-paper
              transition-opacity duration-200 ease-in-out
            `}
            >
              <span
                style={{
                  width: `${(radius * 3) / 8}px`,
                  height: `${(radius * 3) / 8}px`,
                }}
                className={`
              block rounded-full bg-color-primary-lighter
              transition-opacity duration-200 ease-in-out
              ${isSelected ? "opacity-100" : "opacity-0"}
            `}
              />
            </span>
          </label>
        </div>
        <Label>{label}</Label>
      </div>
      {isSelected && isSelectedMessage && (
        <span className="flex items-center ml-4 pt-1 pb-2 font-normal text-xs text-mono text-color-alert-text">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          {isSelectedMessage}
        </span>
      )}
    </div>
  );
};

export const VestAllFromSwapCheckbox = () => {
  const { control } = useFormContext();
  const { vestAllFromAccount } = useWatch({ control });

  return (
    <Checkbox
      name="vestAllFromSwap"
      label="Use all tokens from swap"
      unselectTrigger={vestAllFromAccount}
      isSelectedMessage="The token buy amount may vary after the swap due to price changes."
    />
  );
};

export const VestAllFromAccountCheckbox = () => {
  const { control } = useFormContext();
  const { vestAllFromSwap } = useWatch({ control });

  return (
    <Checkbox
      name="vestAllFromAccount"
      label="Use all your tokens after swap"
      unselectTrigger={vestAllFromSwap}
      isSelectedMessage="The token buy amount may vary after the swap due to price changes."
    />
  );
};
