import { useMemo } from "react";
import type { HookDappContextAdjusted } from "../../types";

export function useHookDeadline({
  context,
}: {
  context: HookDappContextAdjusted | undefined;
}) {
  return useMemo(() => {
    const currentTimestamp = new Date().getTime() / 1000;

    if (
      !context?.orderParams?.validTo ||
      context?.orderParams?.validTo < currentTimestamp
    )
      return BigInt(currentTimestamp.toFixed() + 60 * 60);
    return BigInt(context?.orderParams.validTo);
  }, [context?.orderParams?.validTo]);
}
