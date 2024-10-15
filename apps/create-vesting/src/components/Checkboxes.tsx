import { Input, Label } from "@bleu/ui";
import { ReactNode, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

export const Checkbox = ({
  name,
  label,
  isSelectedMessage,
  unselectTrigger,
}: {
  name: string;
  label?: string;
  isSelectedMessage?: string | ReactNode;
  unselectTrigger?: boolean;
}) => {
  const { register, watch, setValue } = useFormContext();
  const isSelected = watch(name);

  useEffect(() => {
    if (unselectTrigger === true) setValue(name, false);
  }, [unselectTrigger]);

  return (
    <div className="flex flex-col items-start justify-start">
      <div className="flex items-center space-x-2">
        <Input
          type="checkbox"
          id={name}
          {...register(name)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <Label
          htmlFor={name}
          className="text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          {label}
        </Label>
      </div>
      {isSelected && isSelectedMessage}
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
    />
  );
};
