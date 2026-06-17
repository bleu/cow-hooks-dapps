import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from "@cowprotocol/cow-sdk";
import type { CowHook } from "@cowprotocol/hook-dapp-lib";
import { useCallback } from "react";
import type { Address } from "viem";
import { useIFrameContext } from "../context/iframe";
import { retryAsync } from "../utils/retry";

export function useEstimateGas() {
  const { context, actions, publicClient } = useIFrameContext();
  return useCallback(
    async (hook: Omit<CowHook, "gasLimit" | "dappId">) => {
      if (!context || !actions || !publicClient)
        throw new Error("Missing context");

      return await retryAsync<bigint>(() => {
        return publicClient.estimateGas({
          account: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[
            context.chainId
          ] as `0x${string}`,
          to: hook.target as Address,
          value: BigInt("0"),
          data: hook.callData as `0x${string}`,
        });
      });
    },
    [context, actions, publicClient],
  );
}
