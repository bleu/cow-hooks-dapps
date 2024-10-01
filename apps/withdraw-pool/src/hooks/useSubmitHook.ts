import { useIFrameContext } from "#/context/iframe";
import {
  CowHook,
  CowHookCreation,
  CowHookDetails,
} from "@cowprotocol/hook-dapp-lib";
import { BigNumber } from "ethers";
import { useCallback } from "react";

export function useSubmitHook() {
  const { actions, context, publicClient } = useIFrameContext();

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
