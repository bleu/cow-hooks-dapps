import { CowHook, CoWHookDappActions } from "@cowprotocol/hook-dapp-lib";
import { HookDappContextAdjusted } from "../types";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Address, PublicClient } from "viem";
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from "@cowprotocol/cow-sdk";

export function useSubmitHook({
  actions,
  context,
  publicClient,
  recipientOverride,
  defaultGasLimit,
}: {
  actions: CoWHookDappActions | undefined;
  context: HookDappContextAdjusted | undefined;
  publicClient: PublicClient | undefined;
  recipientOverride?: string;
  defaultGasLimit?: bigint;
}) {
  return useCallback(
    async (hook: Omit<CowHook, "gasLimit">) => {
      if (!context || !actions || !publicClient)
        throw new Error("Missing context");

      const estimatedGas = await publicClient
        .estimateGas({
          account: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[
            context.chainId
          ] as `0x${string}`,
          to: hook.target as Address,
          value: BigInt(0),
          data: hook.callData as `0x${string}`,
        })
        .catch(() => {
          console.log(hook.target, hook.callData);
          throw new Error("Failed to estimate hook gas");
          // return defaultGasLimit || BigInt(0);
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
    [actions, context]
  );
}
