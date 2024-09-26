import { IMinimalPool } from "#/types";
import { useCallback, useMemo } from "react";
import { useGetBalancerGaugeArgs } from "./useGetBalancerGaugeArgs";
import {
  PriceImpact,
  RemoveLiquidity,
  RemoveLiquidityKind,
  RemoveLiquidityProportionalInput,
  Slippage,
} from "@balancer/sdk";
import { useIFrameContext } from "#/context/iframe";
import { RPC_URL_MAPPING } from "#/utils/rpcs";
import { multiplyValueByPct } from "#/utils/math";
import { Address } from "viem";
import { minimalPoolToPoolState } from "#/utils/poolDataConverter";
import { BaseTransaction } from "#/utils/transactionFactory/types";

const removeLiquidity = new RemoveLiquidity();

export function useBuildWithdrawCall(
  pool: IMinimalPool
): (withdrawPct: number) => Promise<BaseTransaction | undefined> {
  const { context, cowShedProxy } = useIFrameContext();

  const poolState = useMemo(() => minimalPoolToPoolState(pool), [pool]);

  return useCallback(
    async (withdrawPct: number) => {
      if (!context?.account || !cowShedProxy) return;
      const bptInAmount = multiplyValueByPct(
        pool.userBalance.totalBalance,
        withdrawPct
      );
      const removeLiquidityInput: RemoveLiquidityProportionalInput = {
        chainId: context?.chainId,
        rpcUrl: RPC_URL_MAPPING[context?.chainId],
        bptIn: {
          rawAmount: bptInAmount.toBigInt(),
          decimals: pool.decimals,
          address: pool.id as Address,
        },
        kind: RemoveLiquidityKind.Proportional,
      };

      const query = await removeLiquidity.query(
        removeLiquidityInput,
        poolState
      );
      const call = removeLiquidity.buildCall({
        ...query,
        slippage: Slippage.fromPercentage("0.2"), // TODO: check if this is the right value
        sender: cowShedProxy,
        recipient: context.account,
        chainId: context.chainId,
      });
      return call;
    },
    [context, poolState, cowShedProxy]
  );
}
