import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from "@cowprotocol/cow-sdk";
import type { CowHook } from "@cowprotocol/hook-dapp-lib";
import { useCallback } from "react";
import type { Address } from "viem";
import { useIFrameContext } from "../context/iframe";
import { retryAsync } from "../utils/retry";

// eth_estimateGas is structurally optimistic for the CoW-Shed hook flow:
// every nested CALL only forwards 63/64 of remaining gas (EIP-150) and
// reserves ~2.3k per frame for the reentrancy sentry. Across ~14 nested
// levels (Trampoline -> Factory -> COWShed -> ... -> token.transfer), the
// minimum gas budget that actually completes execution is materially higher
// than the estimator's return value. To find it accurately, we binary-search
// via eth_call.
const BINARY_SEARCH_TOLERANCE = BigInt(5000);
const UPPER_BOUND_MULTIPLIER = BigInt(5);

export function useEstimateGas() {
  const { context, actions, publicClient } = useIFrameContext();
  return useCallback(
    async (hook: Omit<CowHook, "gasLimit" | "dappId">) => {
      if (!context || !actions || !publicClient)
        throw new Error("Missing context");

      const callParams = {
        account: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[
          context.chainId
        ] as `0x${string}`,
        to: hook.target as Address,
        value: BigInt("0"),
        data: hook.callData as `0x${string}`,
      };

      const baseline = await retryAsync<bigint>(() =>
        publicClient.estimateGas(callParams),
      );

      const canExecute = async (gas: bigint): Promise<boolean> => {
        try {
          await publicClient.call({ ...callParams, gas });
          return true;
        } catch {
          return false;
        }
      };

      const searchMax = baseline * UPPER_BOUND_MULTIPLIER;
      let hi = baseline * BigInt(2);
      while (hi < searchMax && !(await canExecute(hi))) {
        hi = (hi * BigInt(3)) / BigInt(2);
      }
      if (hi >= searchMax || !(await canExecute(hi))) return searchMax;

      let lo = baseline;
      while (hi - lo > BINARY_SEARCH_TOLERANCE) {
        const mid = (lo + hi) / BigInt(2);
        if (await canExecute(mid)) hi = mid;
        else lo = mid;
      }
      return hi;
    },
    [context, actions, publicClient],
  );
}
