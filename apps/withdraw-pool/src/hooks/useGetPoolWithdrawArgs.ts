import { IMinimalPool } from "#/types";
import { useCallback } from "react";
import { useIFrameContext } from "#/context/iframe";
import { minimalPoolToPoolState } from "#/utils/poolDataConverter";
import { TRANSACTION_TYPES } from "#/utils/transactionFactory/types";
import { BalancerWithdrawArgs } from "#/utils/transactionFactory/balancerPool";
import { BigNumber } from "ethers";
import { ERC20TransferFromArgs } from "#/utils/transactionFactory/erc20";

export function useGetPoolWithdrawArgs(
  pool?: IMinimalPool
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
        bptWalletAmount === "0"
          ? undefined
          : {
              type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
              token: pool.address,
              from: context.account,
              to: cowShedProxy,
              decimals: pool.decimals,
              amount: BigNumber.from(bptWalletAmount).toBigInt(),
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
