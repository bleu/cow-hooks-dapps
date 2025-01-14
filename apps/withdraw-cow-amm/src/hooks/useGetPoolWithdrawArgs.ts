import {
  type IPool,
  fetchPoolState,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import {
  type BalancerWithdrawArgs,
  type ERC20TransferFromAllWeirollArgs,
  type ERC20TransferFromArgs,
  TRANSACTION_TYPES,
} from "@bleu/utils/transactionFactory/";
import { BigNumber } from "ethers";
import { useCallback } from "react";

export function useGetPoolWithdrawArgs(): (
  pool: IPool,
  bptAMount: BigNumber,
) => Promise<
  | (
      | ERC20TransferFromArgs
      | BalancerWithdrawArgs
      | ERC20TransferFromAllWeirollArgs
    )[]
  | undefined
> {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async (pool: IPool, bptAmount: BigNumber) => {
      if (!context?.account || !cowShedProxy || !pool) return;
      const poolState = await fetchPoolState(pool.id, context.chainId);
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

      const transferFromProxyToUserTokens = pool.poolTokens.map((token) => {
        const tokenAddress = token.address;

        return {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL,
          token: tokenAddress,
          from: cowShedProxy,
          to: context.account,
          decimals: token.decimals,
          symbol: token.symbol,
        } as ERC20TransferFromAllWeirollArgs;
      });

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
        ...transferFromProxyToUserTokens,
      ].filter((arg) => arg) as (
        | ERC20TransferFromArgs
        | BalancerWithdrawArgs
        | ERC20TransferFromAllWeirollArgs
      )[];
    },
    [context, cowShedProxy],
  );
}
