import { useTokenAmountTypeContext } from "#/context/TokenAmountType";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export const FormCheckbox = ({
  name,
  state,
  setState,
  label,
}: {
  name: string;
  state: boolean;
  setState: (state: boolean) => void;
  label?: string;
}) => {
  const { setValue } = useFormContext();

  useEffect(() => {
    console.log("state", state);
    state ? setValue("amount", 1) : setValue("amount", 0);
    setValue(name, state);
  }, [state]);

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={state}
        onChange={() => setState(!state)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        {label}
      </label>
    </div>
  );
};

export const VestAllFromSwapCheckbox = () => {
  const { vestAllFromSwap, setVestAllFromSwap } = useTokenAmountTypeContext();
  return (
    <FormCheckbox
      name="vestAllFromSwap"
      state={vestAllFromSwap}
      setState={setVestAllFromSwap}
      label="Use all tokens from swap"
    />
  );
};

export const VestAllCheckbox = () => {
  const { vestAll, setVestAll } = useTokenAmountTypeContext();
  return (
    <FormCheckbox
      name="vestAll"
      state={vestAll}
      setState={setVestAll}
      label="Use all your tokens after swap"
    />
  );
};
