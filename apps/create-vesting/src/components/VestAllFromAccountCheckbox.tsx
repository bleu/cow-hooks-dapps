import { useFormContext } from "react-hook-form";
import { Checkbox } from "@bleu/cow-hooks-ui";

export const VestAllFromAccountCheckbox = () => {
  const { setValue } = useFormContext();

  return (
    <Checkbox
      name="vestAllFromAccount"
      label="Use all your tokens after swap"
      isSelectedMessage="The token buy amount may vary after the order due to price changes."
      onSelectSideEffect={() => {
        setValue("amount", undefined);
        setValue("vestUserInput", false);
        setValue("vestAllFromSwap", false);
      }}
    />
  );
};
