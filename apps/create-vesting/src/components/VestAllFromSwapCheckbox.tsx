import { Checkbox, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

export const VestAllFromSwapCheckbox = () => {
  const { setValue } = useFormContext();
  const { context } = useIFrameContext();

  return (
    <Checkbox
      name="vestAllFromSwap"
      label="Use all tokens from swap"
      isSelectedMessage={
        //@ts-ignore
        context?.orderParams?.kind === "sell"
          ? "The token buy amount may vary due to price changes."
          : undefined
      }
      onSelectSideEffect={() => {
        setValue("amount", undefined);
        setValue("vestUserInput", false);
        setValue("vestAllFromAccount", false);
      }}
    />
  );
};
