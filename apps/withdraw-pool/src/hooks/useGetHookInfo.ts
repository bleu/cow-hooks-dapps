import { IHooksInfo } from "#/types";
import { useCallback } from "react";
import { useGetBalancerGaugeArgs } from "./useGetBalancerGaugeArgs";
import { useGetPoolWithdrawArgs } from "./useGetPoolWithdrawArgs";
import { multiplyValueByPct } from "#/utils/math";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { IPool } from "@bleu/cow-hooks-ui";

export function useGetHookInfo(pool?: IPool) {
  const getPoolWithdrawArgs = useGetPoolWithdrawArgs(pool);
  const getBalancerGaugeArgs = useGetBalancerGaugeArgs(pool);

  return useCallback(
    async (withdrawPct: number): Promise<IHooksInfo | undefined> => {
      if (!pool) return;

      const bptAmount = multiplyValueByPct(
        pool.userBalance.totalBalance,
        withdrawPct
      );
      const balancerGaugeArgs = getBalancerGaugeArgs(bptAmount);
      const poolWithdrawArgs = getPoolWithdrawArgs(bptAmount);
      if (!poolWithdrawArgs) return;

      const argsArray = [...balancerGaugeArgs, ...poolWithdrawArgs];

      const txs = await Promise.all(
        argsArray.map((arg) => {
          return TransactionFactory.createRawTx(arg.type, arg);
        })
      );

      const permitData = argsArray
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
    [getPoolWithdrawArgs, getBalancerGaugeArgs, pool]
  );
}
