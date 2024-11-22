import { useIFrameContext } from "@bleu/cow-hooks-ui";
import type { IPool } from "#/types";
import {
  type UniswapWithdrawArgs,
  type ERC20TransferFromArgs,
  type ERC20ApproveArgs,
  TRANSACTION_TYPES,
} from "@bleu/utils/transactionFactory/";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { useHookDeadline } from "@bleu/cow-hooks-ui";
import { uniswapRouterMap } from "#/utils/uniswapRouterMap";

export function useGetPoolWithdrawArgs(): (
  pool: IPool,
  bptAMount: BigNumber,
) => Promise<
  (ERC20TransferFromArgs | UniswapWithdrawArgs | ERC20ApproveArgs)[] | undefined
> {
  const { context, cowShedProxy } = useIFrameContext();
  const deadline = useHookDeadline({ context });

  return useCallback(
    async (pool: IPool, bptAmount: BigNumber) => {
      if (!context?.account || !cowShedProxy || !pool) return;

      const bptWalletAmount = bptAmount.gte(pool.userBalance.walletBalance)
        ? pool.userBalance.walletBalance
        : bptAmount;

      const transferBptArg = bptWalletAmount.eq(BigNumber.from("0"))
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

      const approveRouterToUseBptArg = {
        type: TRANSACTION_TYPES.ERC20_APPROVE,
        token: pool.id,
        spender: uniswapRouterMap[context.chainId],
        amount: BigNumber.from(bptWalletAmount).toBigInt(),
      };

      return [
        transferBptArg,
        approveRouterToUseBptArg,
        {
          type: TRANSACTION_TYPES.UNISWAP_WITHDRAW,
          uniswapRouterAddress: uniswapRouterMap[context.chainId],
          tokenA: pool.allTokens[0].address,
          tokenB: pool.allTokens[1].address,
          liquidity: pool.userBalance.walletBalance,
          amountAMin: pool.allTokens[0].userBalance,
          amountBMin: pool.allTokens[1].userBalance,
          recipient: context.account,
          deadline: deadline,
        },
      ] as (ERC20TransferFromArgs | UniswapWithdrawArgs | ERC20ApproveArgs)[];
    },
    [context, cowShedProxy, deadline],
  );
}
