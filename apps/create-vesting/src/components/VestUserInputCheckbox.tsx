import { useFormContext } from "react-hook-form";
import { Checkbox } from "@bleu/cow-hooks-ui";

export const VestUserInputCheckbox = () => {
  const { setValue } = useFormContext();

  return (
    <Checkbox
      name="vestUserInput"
      label="Input vesting amount manually"
      onSelectSideEffect={() => {
        setValue("amount", undefined);
        setValue("vestAllFromSwap", false);
        setValue("vestAllFromAccount", false);
      }}
    />
  );
};
