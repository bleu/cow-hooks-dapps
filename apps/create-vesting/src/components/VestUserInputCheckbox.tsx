import { Checkbox } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

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
