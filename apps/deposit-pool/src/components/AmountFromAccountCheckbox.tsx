import { Checkbox } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

export const AmountFromAccountCheckbox = () => {
  const { setValue } = useFormContext();

  return (
    <Checkbox
      name="amountFromAccount"
      label="Use all your tokens after swap"
      onSelectSideEffect={() => {
        setValue("amountFromUserInput", false);
        setValue("amountFromSwap", false);
      }}
    />
  );
};
