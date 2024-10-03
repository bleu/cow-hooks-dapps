import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import { useMemo } from "react";
import { Address } from "viem";
import type { HookDappContextAdjusted } from "./types";

export function useHookDeadline({
  context,
}: {
  context: HookDappContextAdjusted | undefined;
}) {
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
