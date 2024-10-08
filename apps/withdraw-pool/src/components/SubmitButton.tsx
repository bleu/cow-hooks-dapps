import { Button } from "@bleu/ui";
import { useMemo } from "react";
import { useFormContext, useFormState } from "react-hook-form";

export function SubmitButton({
  withdrawPct,
  poolId,
}: {
  withdrawPct?: number;
  poolId?: string;
}) {
  const { control } = useFormContext();

  const { isSubmitSuccessful, isSubmitting } = useFormState({ control });
  const buttonProps = useMemo(() => {
    if (!withdrawPct || Number(withdrawPct) === 0)
      return { disabled: true, message: "Define percentage" };
    return { disabled: false, message: "Add pre-hook" };
  }, [withdrawPct, poolId]);

  if (!poolId) return;

  return (
    <Button
      type="submit"
      className="my-2 rounded-xl text-lg min-h-[58px]"
      disabled={buttonProps.disabled}
      loading={isSubmitting || isSubmitSuccessful}
      loadingText="Creating hook..."
    >
      {buttonProps.message}
    </Button>
  );
}
