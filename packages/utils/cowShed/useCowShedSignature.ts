import { useCallback } from "react";
import { useHookDeadline } from "./useHookDeadline";
import { type CowShedHooks, type ICoWShedCall } from "@cowprotocol/cow-sdk";
import { getCowShedNonce } from "./getCowShedNonce";
import { SigningScheme } from "@cowprotocol/contracts";
import type { Signer } from "ethers";

import type { HookDappContextAdjusted, BaseTransaction } from "./types";

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
          isDelegateCall: false,
        };
      });
      const nonce = getCowShedNonce();
      const signature = await cowShed.signCalls(
        cowShedCalls,
        nonce,
        hookDeadline,
        signer,
        SigningScheme.EIP712
      );
      return cowShed.encodeExecuteHooksForFactory(
        cowShedCalls,
        nonce,
        hookDeadline,
        context.account,
        signature
      );
    },
    [hookDeadline, cowShed, signer, context]
  );
}
