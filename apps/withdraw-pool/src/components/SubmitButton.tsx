import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Button } from "@bleu.builders/ui";
import { useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

export function SubmitButton({ poolId }: { poolId?: string }) {
  const { control } = useFormContext();
  const { context } = useIFrameContext();

  const { isSubmitting, isSubmitSuccessful } = useFormState({ control });

  const withdrawPct = useWatch({ control, name: "withdrawPct" });
  const buttonProps = useMemo(() => {
    if (!withdrawPct || Number(withdrawPct) === 0)
      return { disabled: true, message: "Define percentage" };
    return {
      disabled: false,
      message: context?.hookToEdit ? "Update pre-hook" : "Add pre-hook",
    };
  }, [withdrawPct, context?.hookToEdit]);

  if (!poolId) return;

  return (
    <div className="flex w-full">
      <Button
        type="submit"
        className="my-2 w-full rounded-2xl text-lg h-[58px]"
        disabled={buttonProps.disabled}
        loading={isSubmitting || isSubmitSuccessful}
        loadingText="Creating hook..."
      >
        {buttonProps.message}
      </Button>
    </div>
  );
}
