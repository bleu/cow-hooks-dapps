import { Checkbox, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";

export const VestAllFromAccountCheckbox = () => {
  const { setValue } = useFormContext();
  const { context } = useIFrameContext();

  return (
    <Checkbox
      name="vestAllFromAccount"
      label="Use all your tokens after swap"
      isSelectedMessage={
        //@ts-ignore
        context?.orderParams?.kind === "sell"
          ? "The token buy amount may vary due to price changes."
          : undefined
      }
      onSelectSideEffect={() => {
        setValue("amount", undefined);
        setValue("vestUserInput", false);
        setValue("vestAllFromSwap", false);
      }}
    />
  );
};
