import { Checkbox } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

export const AmountFromSwapCheckbox = () => {
  const { setValue } = useFormContext();
  return (
    <Checkbox
      name="amountFromSwap"
      label="Use all tokens from swap"
      onSelectSideEffect={() => {
        setValue("amountFromUserInput", false);
        setValue("amountFromAccount", false);
      }}
    />
  );
};
