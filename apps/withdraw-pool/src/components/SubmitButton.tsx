import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Button } from "@bleu/ui";
import { useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

export function SubmitButton({ poolId }: { poolId?: string }) {
  const { control } = useFormContext();
  const { context } = useIFrameContext();

  const { isSubmitting } = useFormState({ control });

  const withdrawPct = useWatch({ control, name: "withdrawPct" });
  const buttonProps = useMemo(() => {
    if (!withdrawPct || Number(withdrawPct) === 0)
      return { disabled: true, message: "Define percentage" };
    return {
      disabled: false,
      message: context?.hookToEdit ? "Update pre-hook" : "Add pre-hook",
    };
  }, [withdrawPct, poolId, context?.hookToEdit]);

  if (!poolId) return;

  return (
    <Button
      type="submit"
      className="my-2 rounded-2xl text-lg min-h-[58px]"
      disabled={buttonProps.disabled}
      loading={isSubmitting}
      loadingText="Creating hook..."
    >
      {buttonProps.message}
    </Button>
  );
}
