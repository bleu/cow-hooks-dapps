import { Checkbox } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

export const AmountFromUserInputCheckbox = () => {
  const { setValue } = useFormContext();

  return (
    <Checkbox
      name="amountFromUserInput"
      label="Input deposit amount manually"
      onSelectSideEffect={() => {
        setValue("amountFromSwap", false);
        setValue("amountFromAccount", false);
      }}
    />
  );
};
