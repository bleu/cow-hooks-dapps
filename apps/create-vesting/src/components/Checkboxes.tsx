import { Input, Label } from "@bleu/ui";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const Checkbox = ({
  name,
  label,
  isSelectedMessage,
  unselectTrigger,
  onSelectSideEffect,
  radius = 14,
  ...props
}: {
  name: string;
  label?: string;
  isSelectedMessage?: string;
  unselectTrigger?: boolean;
  onSelectSideEffect?: () => void;
  radius?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const { register, control, setValue } = useFormContext();
  const isSelected = useWatch({ control, name });

  useEffect(() => {
    if (unselectTrigger === true) setValue(name, false);
  }, [unselectTrigger, setValue, name]);

  useEffect(() => {
    if (isSelected && onSelectSideEffect) {
      onSelectSideEffect();
    }
  }, [isSelected, onSelectSideEffect]);

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
            {...props}
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
        <span className="flex items-center ml-4 pt-1 font-normal text-xs text-mono opacity-70">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          {isSelectedMessage}
        </span>
      )}
    </div>
  );
};

export const VestUserInputCheckbox = () => {
  const { control, setValue } = useFormContext();
  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });

  return (
    <Checkbox
      name="vestUserInput"
      label="Input vesting amount manually"
      unselectTrigger={vestAllFromAccount || vestAllFromSwap}
      onSelectSideEffect={() => setValue("amount", "")}
      disabled={vestUserInput}
    />
  );
};

export const VestAllFromSwapCheckbox = () => {
  const { control, setValue } = useFormContext();
  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });

  return (
    <Checkbox
      name="vestAllFromSwap"
      label="Use all tokens from swap"
      unselectTrigger={vestAllFromAccount || vestUserInput}
      isSelectedMessage="The token buy amount may vary after the order due to price changes."
      disabled={vestAllFromSwap}
      onSelectSideEffect={() => setValue("amount", undefined)}
    />
  );
};

export const VestAllFromAccountCheckbox = () => {
  const { control, setValue } = useFormContext();
  const vestUserInput = useWatch({ control, name: "vestUserInput" });
  const vestAllFromSwap = useWatch({ control, name: "vestAllFromSwap" });
  const vestAllFromAccount = useWatch({ control, name: "vestAllFromAccount" });

  return (
    <Checkbox
      name="vestAllFromAccount"
      label="Use all your tokens after swap"
      unselectTrigger={vestAllFromSwap || vestUserInput}
      isSelectedMessage="The token buy amount may vary after the order due to price changes."
      disabled={vestAllFromAccount}
      onSelectSideEffect={() => setValue("amount", undefined)}
    />
  );
};
