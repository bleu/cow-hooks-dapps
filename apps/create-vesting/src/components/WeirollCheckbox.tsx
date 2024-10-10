import { useTokenAmountTypeContext } from "#/context/TokenAmountType";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export const WeirollCheckbox = () => {
  const { vestAllFromSwap, setVestAllFromSwap } = useTokenAmountTypeContext();
  const { setValue } = useFormContext();

  useEffect(() => {
    console.log(vestAllFromSwap);
    vestAllFromSwap ? setValue("amount", 1) : setValue("amount", 0);
  }, [vestAllFromSwap]);

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="vestAllFromSwap"
        checked={vestAllFromSwap}
        onChange={() => setVestAllFromSwap(!vestAllFromSwap)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label
        htmlFor="vestAllFromSwap"
        className="text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        Use all tokens from swap
      </label>
    </div>
  );
};
