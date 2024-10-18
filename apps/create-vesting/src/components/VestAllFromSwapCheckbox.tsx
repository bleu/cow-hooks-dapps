import { Checkbox } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

export const VestAllFromSwapCheckbox = () => {
  const { setValue } = useFormContext();

  return (
    <Checkbox
      name="vestAllFromSwap"
      label="Use all tokens from swap"
      isSelectedMessage="The token buy amount may vary after the order due to price changes."
      onSelectSideEffect={() => {
        setValue("amount", undefined);
        setValue("vestUserInput", false);
        setValue("vestAllFromAccount", false);
      }}
    />
  );
};
