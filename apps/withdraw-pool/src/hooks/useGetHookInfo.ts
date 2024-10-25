import type { IHooksInfo, IPool } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { useGetPoolWithdrawArgs } from "./useGetPoolWithdrawArgs";
import { multiplyValueByPct } from "@bleu/utils";

export function useGetHookInfo() {
  const getPoolWithdrawArgs = useGetPoolWithdrawArgs();

  return useCallback(
    async (
      pool: IPool,
      withdrawPct: number
    ): Promise<IHooksInfo | undefined> => {
      if (!pool) return;

      const bptAmount = multiplyValueByPct(
        pool.userBalance.walletBalance,
        withdrawPct
      );
      const poolWithdrawArgs = await getPoolWithdrawArgs(pool, bptAmount);
      if (!poolWithdrawArgs) return;

      const txs = await Promise.all(
        poolWithdrawArgs.map((arg) => {
          return TransactionFactory.createRawTx(arg.type, arg);
        })
      );

      const permitData = poolWithdrawArgs
        .filter((arg) => arg.type === TRANSACTION_TYPES.ERC20_TRANSFER_FROM)
        .map((arg) => {
          return {
            tokenAddress: arg.token,
            amount: arg.amount,
            tokenSymbol: arg.symbol,
          };
        });
      return {
        txs,
        permitData: permitData,
      };
    },
    [getPoolWithdrawArgs]
  );
}
