import type { CowHook } from "@cowprotocol/hook-dapp-lib";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { useIFrameContext } from "../context/iframe";
import { useEstimateGas } from "./useEstimateGas";

export function useSubmitHook({
  recipientOverride,
  defaultGasLimit,
}: {
  recipientOverride?: string;
  defaultGasLimit?: bigint;
}) {
  const { context, actions } = useIFrameContext();
  const estimateGas = useEstimateGas();
  return useCallback(
    async (hook: Omit<CowHook, "gasLimit" | "dappId">) => {
      if (!context || !actions) throw new Error("Missing context");

      const estimatedGas = await estimateGas(hook).catch(() => {
        console.error("Failed to estimated hook gas", {
          chainId: context.chainId,
          calldata: hook.callData,
          target: hook.target,
        });
        if (defaultGasLimit) return defaultGasLimit;
        throw new Error("Failed to estimated hook gas");
      });

      const gasLimit = BigNumber.from(estimatedGas)
        .mul(120)
        .div(100)
        .toString();

      const hookWithGasLimit = {
        ...hook,
        gasLimit,
      };

      if (context.hookToEdit) {
        actions.editHook({
          hook: hookWithGasLimit,
          uuid: context.hookToEdit.uuid,
          recipientOverride,
        });
        return;
      }

      actions.addHook({ hook: hookWithGasLimit, recipientOverride });
    },
    [actions, context, recipientOverride, estimateGas, defaultGasLimit],
  );
}
