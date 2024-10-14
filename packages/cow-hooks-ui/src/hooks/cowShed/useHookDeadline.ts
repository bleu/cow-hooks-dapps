import { useMemo } from "react";
import type { HookDappContextAdjusted } from "../../types";

export function useHookDeadline({
  context,
}: {
  context: HookDappContextAdjusted | undefined;
}) {
  return useMemo(() => {
    const now = new Date();
    const validToOnTimezone = context?.orderParams?.validTo || 0;
    const validToTimestamp = validToOnTimezone + now.getTimezoneOffset() * 60;
    const currentTimestamp = new Date().getTime() / 1000;
    const oneHourAfter = BigInt(currentTimestamp.toFixed() + 60 * 60);

    if (validToTimestamp < oneHourAfter) return BigInt(oneHourAfter);
    return BigInt(validToTimestamp);
  }, [context?.orderParams?.validTo]);
}
