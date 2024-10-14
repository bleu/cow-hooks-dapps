import type { CoWHookDappActions, CowHook } from "@cowprotocol/hook-dapp-lib";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import type { PublicClient } from "viem";
import type { HookDappContextAdjusted } from "../types";

export function useSubmitHook({
  actions,
  context,
  publicClient,
  recipientOverride,
}: {
  actions: CoWHookDappActions | undefined;
  context: HookDappContextAdjusted | undefined;
  publicClient: PublicClient | undefined;
  recipientOverride?: string;
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
          recipientOverride,
        });
        return;
      }

      actions.addHook({ hook: hookWithGasLimit, recipientOverride });
    },
    [actions, context, recipientOverride, publicClient?.estimateGas],
  );
}
