import { CowHook, CoWHookDappActions } from "@cowprotocol/hook-dapp-lib";
import { HookDappContextAdjusted } from "../types";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { PublicClient } from "viem";

export function useSubmitHook({
  actions,
  context,
  publicClient,
}: {
  actions: CoWHookDappActions | undefined;
  context: HookDappContextAdjusted | undefined;
  publicClient: PublicClient | undefined;
}) {
  return useCallback(
    async (hook: Omit<CowHook, "gasLimit">) => {
      if (!context || !actions) return;

      const estimatedGas = await publicClient?.estimateGas({
        account: context.account,
        to: hook.target as `0x${string}`,
        value: BigInt(0),
        data: hook.callData as `0x${string}`,
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
        });
      }

      actions.addHook({ hook: hookWithGasLimit });
    },
    [actions, context]
  );
}
