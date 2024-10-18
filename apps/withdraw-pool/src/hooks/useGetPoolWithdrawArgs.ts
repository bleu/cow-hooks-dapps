import { useCallback } from "react";
import {
  IPool,
  minimalPoolToPoolState,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { BigNumber } from "ethers";
import {
  type BalancerWithdrawArgs,
  type ERC20TransferFromArgs,
  TRANSACTION_TYPES,
} from "@bleu/utils/transactionFactory/";

export function useGetPoolWithdrawArgs(
  pool?: IPool
): (
  bptAMount: BigNumber
) => (ERC20TransferFromArgs | BalancerWithdrawArgs)[] | undefined {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    (bptAmount: BigNumber) => {
      if (!context?.account || !cowShedProxy || !pool) return;
      const poolState = minimalPoolToPoolState(pool);
      const bptWalletAmount = bptAmount.gte(pool.userBalance.walletBalance)
        ? pool.userBalance.walletBalance
        : bptAmount;

      const transferBptArg =
        bptWalletAmount === BigInt(0)
          ? undefined
          : {
              type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
              token: pool.address,
              from: context.account,
              to: cowShedProxy,
              decimals: pool.decimals,
              amount: BigNumber.from(bptWalletAmount).toBigInt(),
              symbol: pool.symbol,
            };
      return [
        transferBptArg,
        {
          type: TRANSACTION_TYPES.BALANCER_WITHDRAW,
          poolState,
          bptAmount,
          chainId: context.chainId,
          decimals: pool.decimals,
          sender: cowShedProxy,
          recipient: context.account,
        },
      ].filter((arg) => arg) as (
        | ERC20TransferFromArgs
        | BalancerWithdrawArgs
      )[];
    },
    [context, cowShedProxy, pool]
  );
}
