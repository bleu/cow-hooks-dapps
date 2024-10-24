import {
  ButtonPrimary,
  type HookDappContextAdjusted,
} from "@bleu/cow-hooks-ui";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const Button = ({
  context,
  isOutOfFunds,
  isBuildingHook,
  disabled,
  tokenSymbol,
}: {
  context: HookDappContextAdjusted;
  isOutOfFunds: boolean;
  isBuildingHook: boolean;
  disabled: boolean;
  tokenSymbol?: string | undefined;
}) => {
  return (
    <ButtonPrimary type="submit" disabled={disabled}>
      <ButtonText
        context={context}
        isOutOfFunds={isOutOfFunds}
        isBuildingHook={isBuildingHook}
        tokenSymbol={tokenSymbol}
      />
    </ButtonPrimary>
  );
};

const ButtonText = ({
  context,
  isOutOfFunds,
  isBuildingHook,
  tokenSymbol,
}: {
  context: HookDappContextAdjusted;
  isOutOfFunds: boolean;
  isBuildingHook: boolean;
  tokenSymbol?: string | undefined;
}) => {
  if (isOutOfFunds)
    return (
      <span className="flex items-center justify-center gap-2">
        <ExclamationTriangleIcon className="w-6 h-6" />
        Insufficient {tokenSymbol ? `${tokenSymbol} ` : ""}balance
      </span>
    );

  if (isBuildingHook)
    return (
      <span className="flex items-center justify-center gap-2">
        Building post-hook...
      </span>
    );

  if (context?.hookToEdit && context?.isPreHook)
    return <span>Update pre-hook</span>;
  if (context?.hookToEdit && !context?.isPreHook)
    return <span>Update post-hook</span>;
  if (!context?.hookToEdit && context?.isPreHook)
    return <span>Add pre-hook</span>;
  if (!context?.hookToEdit && !context?.isPreHook)
    return <span>Add post-hook</span>;
};
