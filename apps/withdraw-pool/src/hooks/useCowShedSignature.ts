import { useIFrameContext } from "#/context/iframe";
import { useCallback, useMemo } from "react";
import { useHookDeadline } from "./useHookDeadline";
import { ICoWShedCall } from "@cowprotocol/cow-sdk";
import { BaseTransaction } from "#/utils/transactionFactory/types";
import { getCowShedNonce } from "#/utils/cowShed/getCowShedNonce";
import { SigningScheme } from "@cowprotocol/contracts";

export function useCowShedSignature() {
  const { cowShed, signer, context } = useIFrameContext();

  const hookDeadline = useHookDeadline();

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
