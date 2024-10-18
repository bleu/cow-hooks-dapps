import { SigningScheme } from "@cowprotocol/contracts";
import type { CowShedHooks, ICoWShedCall } from "@cowprotocol/cow-sdk";
import type { Signer } from "ethers";
import { useCallback } from "react";
import { getCowShedNonce } from "./getCowShedNonce";
import { useHookDeadline } from "./useHookDeadline";

import type { BaseTransaction, HookDappContextAdjusted } from "../../types";

export function useCowShedSignature({
  cowShed,
  signer,
  context,
}: {
  cowShed: CowShedHooks | undefined;
  signer: Signer | undefined;
  context: HookDappContextAdjusted | undefined;
}) {
  const hookDeadline = useHookDeadline({ context });

  return useCallback(
    async (txs: BaseTransaction[]) => {
      if (!cowShed || !signer || !context?.account) return;
      const cowShedCalls: ICoWShedCall[] = txs.map((tx) => {
        return {
          target: tx.to,
          value: BigInt(tx.value),
          callData: tx.callData,
          allowFailure: false,
          isDelegateCall: !!tx.isDelegateCall,
        };
      });
      const nonce = getCowShedNonce();
      const signature = await cowShed
        .signCalls(
          cowShedCalls,
          nonce,
          hookDeadline,
          signer,
          SigningScheme.EIP712,
        )
        .catch(() => {
          throw new Error("User rejected signature");
        });
      return cowShed.encodeExecuteHooksForFactory(
        cowShedCalls,
        nonce,
        hookDeadline,
        context.account,
        signature,
      );
    },
    [hookDeadline, cowShed, signer, context],
  );
}
