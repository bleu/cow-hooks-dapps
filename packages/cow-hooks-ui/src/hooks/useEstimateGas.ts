import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from "@cowprotocol/cow-sdk";
import type { CowHook } from "@cowprotocol/hook-dapp-lib";
import { useCallback } from "react";
import type { Address } from "viem";
import { useIFrameContext } from "../context/iframe";
import { retryAsync } from "../utils/retry";

// First-time COWShed proxy deployment (CREATE2 + storage init via
// COWShedFactory._initializeProxy) consumes ~247k gas that
// eth_estimateGas systematically undershoots. Padded to 300k to absorb
// state variance and minor future contract changes. Measured against
// Arbitrum tx 0xed5e611659a7461a9c5aeb4c072de45e4b11427d3581d251a208a6c9b1c28534.
const COW_SHED_DEPLOY_GAS_BUFFER = BigInt(300_000);

export function useEstimateGas() {
  const { context, actions, publicClient, cowShedProxy } = useIFrameContext();
  return useCallback(
    async (hook: Omit<CowHook, "gasLimit" | "dappId">) => {
      if (!context || !actions || !publicClient)
        throw new Error("Missing context");

      const baseline = await retryAsync<bigint>(() =>
        publicClient.estimateGas({
          account: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[
            context.chainId
          ] as `0x${string}`,
          to: hook.target as Address,
          value: BigInt("0"),
          data: hook.callData as `0x${string}`,
        }),
      );

      if (!cowShedProxy) return baseline + COW_SHED_DEPLOY_GAS_BUFFER;
      const code = await publicClient
        .getBytecode({ address: cowShedProxy })
        .catch(() => undefined);
      const needsDeploy = !code || code === "0x";
      return needsDeploy ? baseline + COW_SHED_DEPLOY_GAS_BUFFER : baseline;
    },
    [context, actions, publicClient, cowShedProxy],
  );
}
