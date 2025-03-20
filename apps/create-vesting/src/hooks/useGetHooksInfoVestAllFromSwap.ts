import { type IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { type Address, erc20Abi, maxUint256 } from "viem";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import type { GetHooksTransactionsParams } from "./useGetHooksTransactions";

export const useGetHooksInfoVestAllFromSwap = () => {
  const { context, cowShedProxy, publicClient } = useIFrameContext();

  return useCallback(
    async (
      params: GetHooksTransactionsParams,
    ): Promise<IHooksInfo | undefined> => {
      const {
        token,
        vestingEscrowFactoryAddress,
        formData: { period, periodScale, recipient },
      } = params;

      if (!context?.account || !cowShedProxy || !publicClient) return;

      const periodInSeconds = Math.ceil(
        period * scaleToSecondsMapping[periodScale],
      );
      const tokenAddress = token.address as Address;

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [cowShedProxy, vestingEscrowFactoryAddress],
      });

      const approveTxs =
        allowance < maxUint256
          ? [
              TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
                type: TRANSACTION_TYPES.ERC20_APPROVE,
                token: tokenAddress as Address,
                spender: vestingEscrowFactoryAddress,
                amount: BigInt(0),
              }),
              TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
                type: TRANSACTION_TYPES.ERC20_APPROVE,
                token: tokenAddress as Address,
                spender: vestingEscrowFactoryAddress,
                amount: maxUint256,
              }),
            ]
          : [];

      const txs = await Promise.all([
        // Proxy approves Vesting Escrow Factory
        ...approveTxs,
        // Create vesting (weiroll)
        TransactionFactory.createRawTx(
          TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_PROXY,
          {
            type: TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_PROXY,
            token: tokenAddress,
            recipient: recipient as Address,
            cowShedProxy,
            vestingDuration: BigInt(periodInSeconds),
            vestingEscrowFactoryAddress: vestingEscrowFactoryAddress,
          },
        ),
      ]);

      return { txs, recipientOverride: cowShedProxy };
    },
    [context?.account, cowShedProxy, publicClient],
  );
};
