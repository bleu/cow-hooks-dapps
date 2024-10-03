import { TRANSACTION_TYPES, TransactionFactory } from "../transactionFactory";
import type { Signer } from "ethers";
import { useCallback } from "react";
import type { Address } from "viem";
import { MAX_UINT256 } from "@balancer/sdk";

export function useHandleTokenApprove({
  signer,
  cowShedProxy,
}: {
  signer: Signer | undefined;
  cowShedProxy: Address | undefined;
}) {
  return useCallback(
    async (tokenAddress: Address) => {
      if (!signer || !cowShedProxy) {
        throw new Error("Missing context");
      }

      const approveArgs = {
        type: TRANSACTION_TYPES.ERC20_APPROVE,
        token: tokenAddress,
        spender: cowShedProxy,
        amount: MAX_UINT256,
      } as const;
      const txData = await TransactionFactory.createRawTx(
        approveArgs.type,
        approveArgs
      );

      const transaction = await signer.sendTransaction({
        to: tokenAddress,
        value: "0",
        data: txData.callData,
      });

      console.log(transaction);

      const receipt = await transaction.wait();

      console.log(receipt);
      return receipt;
    },
    [signer, cowShedProxy]
  );
}
