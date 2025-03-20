import { type IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { type Address, maxUint256 } from "viem";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import type { GetHooksTransactionsParams } from "./useGetHooksTransactions";

export const useGetHooksInfoVestAllFromAccount = () => {
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
      const tokenSymbol = token.symbol ?? "";

      const txs = await Promise.all([
        // Approve create vesting
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: vestingEscrowFactoryAddress,
          amount: maxUint256,
        }),
        // transfer from user to proxy and create vesting (weiroll)
        TransactionFactory.createRawTx(
          TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_USER,
          {
            type: TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_USER,
            token: tokenAddress,
            recipient: recipient as Address,
            cowShedProxy,
            vestingDuration: BigInt(periodInSeconds),
            vestingEscrowFactoryAddress: vestingEscrowFactoryAddress,
            user: context.account,
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

      const permitData = [
        {
          tokenAddress: tokenAddress,
          amount: maxUint256,
          tokenSymbol: tokenSymbol,
        },
      ];

      return { txs, permitData };
    },
    [context?.account, cowShedProxy],
  );
};
