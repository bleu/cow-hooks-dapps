import type { IPool } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import type { IHooksInfo } from "#/types";
import { multiplyValueByPct } from "#/utils/math";
// import { useGetBalancerGaugeArgs } from "./useGetBalancerGaugeArgs";
import { useGetPoolWithdrawArgs } from "./useGetPoolWithdrawArgs";

export function useGetHookInfo(pool?: IPool) {
  const getPoolWithdrawArgs = useGetPoolWithdrawArgs(pool);
  // Removed gauge related code
  // const getBalancerGaugeArgs = useGetBalancerGaugeArgs(pool);

  return useCallback(
    async (withdrawPct: number): Promise<IHooksInfo | undefined> => {
      if (!pool) return;

      const bptAmount = multiplyValueByPct(
        pool.userBalance.walletBalance,
        withdrawPct,
      );
      // const balancerGaugeArgs = getBalancerGaugeArgs(bptAmount);
      const poolWithdrawArgs = await getPoolWithdrawArgs(bptAmount);
      if (!poolWithdrawArgs) return;

      // const argsArray = [...balancerGaugeArgs, ...poolWithdrawArgs];

      const txs = await Promise.all(
        poolWithdrawArgs.map((arg) => {
          return TransactionFactory.createRawTx(arg.type, arg);
        }),
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
    [getPoolWithdrawArgs, pool],
  );
}
