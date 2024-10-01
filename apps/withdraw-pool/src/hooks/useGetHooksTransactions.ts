import { IMinimalPool } from "#/types";
import { useCallback } from "react";
import { useGetBalancerGaugeArgs } from "./useGetBalancerGaugeArgs";
import { useGetPoolWithdrawArgs } from "./useGetPoolWithdrawArgs";
import { multiplyValueByPct } from "#/utils/math";
import { TransactionFactory } from "#/utils/transactionFactory/factory";

export function useGetHooksTransactions(pool?: IMinimalPool) {
  const getPoolWithdrawArgs = useGetPoolWithdrawArgs(pool);
  const getBalancerGaugeArgs = useGetBalancerGaugeArgs(pool);

  return useCallback(
    async (withdrawPct: number) => {
      if (!pool) return;

      const bptAmount = multiplyValueByPct(
        pool.userBalance.totalBalance,
        withdrawPct
      );
      const balancerGaugeArgs = getBalancerGaugeArgs(bptAmount);
      const poolWithdrawArgs = getPoolWithdrawArgs(bptAmount);
      if (!poolWithdrawArgs) return;

      const argsArray = [...balancerGaugeArgs, ...poolWithdrawArgs];

      return await Promise.all(
        argsArray.map((arg) => {
          return TransactionFactory.createRawTx(arg.type, arg);
        })
      );
    },
    [getPoolWithdrawArgs, getBalancerGaugeArgs, pool]
  );
}
