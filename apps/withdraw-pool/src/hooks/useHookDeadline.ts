import { useIFrameContext } from "#/context/iframe";
import { useMemo } from "react";

export function useHookDeadline() {
  const { context } = useIFrameContext();
  return useMemo(() => {
    return BigInt(
      context?.orderParams?.validTo || generateTimestampOnNextHour()
    ); // TODO check valid to parameter
  }, [context?.orderParams?.validTo]);
}

const generateTimestampOnNextHour = () => {
  const currentTimestamp = new Date().getTime() / 1000;
  return currentTimestamp.toFixed() + 60 * 60;
};
