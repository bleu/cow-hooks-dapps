import { MAX_UINT256 } from "@balancer/sdk";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import type { Signer } from "ethers";
import { useCallback } from "react";
import type { Address } from "viem";

export function useHandleTokenMaxApprove({
  signer,
  spender,
}: {
  signer: Signer | undefined;
  spender: Address | undefined;
}) {
  return useCallback(
    async (tokenAddress: Address) => {
      handleTokenApprove({
        signer,
        spender,
        tokenAddress,
        amount: MAX_UINT256,
      });
    },
    [signer, spender],
  );
}

export async function handleTokenApprove({
  signer,
  spender,
  tokenAddress,
  amount,
}: {
  signer: Signer | undefined;
  spender: Address | undefined;
  tokenAddress: Address;
  amount: bigint;
}) {
  if (!signer || !spender) {
    throw new Error("Missing context");
  }

  const approveArgs = {
    type: TRANSACTION_TYPES.ERC20_APPROVE,
    token: tokenAddress,
    spender: spender,
    amount,
  } as const;
  const txData = await TransactionFactory.createRawTx(
    approveArgs.type,
    approveArgs,
  );

  const transaction = await signer.sendTransaction({
    to: tokenAddress,
    value: "0",
    data: txData.callData,
  });

  const receipt = await transaction.wait();

  return receipt;
}
