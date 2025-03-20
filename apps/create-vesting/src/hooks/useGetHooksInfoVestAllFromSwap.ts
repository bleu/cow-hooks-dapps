import { type IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { type Address, maxUint256 } from "viem";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import type { GetHooksTransactionsParams } from "./useGetHooksTransactions";

export const useGetHooksInfoVestAllFromSwap = () => {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async (
      params: GetHooksTransactionsParams,
    ): Promise<IHooksInfo | undefined> => {
      const {
        token,
        vestingEscrowFactoryAddress,
        formData: { period, periodScale, recipient },
      } = params;

      if (!context?.account || !cowShedProxy) return;

      const periodInSeconds = Math.ceil(
        period * scaleToSecondsMapping[periodScale],
      );
      const tokenAddress = token.address as Address;

      const txs = await Promise.all([
        // Proxy approves Vesting Escrow Factory
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: vestingEscrowFactoryAddress,
          amount: maxUint256,
        }),
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
        // Reset approvals
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: vestingEscrowFactoryAddress,
          amount: BigInt(0),
        }),
      ]);

      return { txs, recipientOverride: cowShedProxy };
    },
    [context?.account, cowShedProxy],
  );
};
