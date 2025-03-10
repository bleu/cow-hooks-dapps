import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { useHookDeadline } from "@bleu/cow-hooks-ui";
import type { IPool } from "@bleu/cow-hooks-ui";
import { uniswapRouterMap } from "@bleu/utils";
import {
  type ERC20ApproveArgs,
  type ERC20TransferFromArgs,
  TRANSACTION_TYPES,
  type UniswapWithdrawArgs,
} from "@bleu/utils/transactionFactory/";
import { BigNumber } from "ethers";
import { useCallback } from "react";

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
        ? BigNumber.from(pool.userBalance.walletBalance)
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

      const amountAMin = BigNumber.from(bptWalletAmount)
        .mul(pool.poolTokens[0].reserve ?? "0")
        .div(pool?.totalSupply ?? "1")
        .mul(98000)
        .div(100000); // 2% slippage

      const amountBMin = BigNumber.from(bptWalletAmount)
        .mul(pool.poolTokens[1].reserve ?? "0")
        .div(pool?.totalSupply ?? "1")
        .mul(98000)
        .div(100000); // 2% slippage

      return [
        transferBptArg,
        approveRouterToUseBptArg,
        {
          type: TRANSACTION_TYPES.UNISWAP_WITHDRAW,
          uniswapRouterAddress: uniswapRouterMap[context.chainId],
          tokenA: pool.poolTokens[0].address,
          tokenB: pool.poolTokens[1].address,
          liquidity: BigNumber.from(bptWalletAmount).toBigInt(),
          amountAMin,
          amountBMin,
          recipient: context.account,
          deadline: deadline,
        },
      ] as (ERC20TransferFromArgs | UniswapWithdrawArgs | ERC20ApproveArgs)[];
    },
    [context, cowShedProxy, deadline],
  );
}
