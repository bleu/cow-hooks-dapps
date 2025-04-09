import { type BaseTransaction, useIFrameContext } from "@bleu/cow-hooks-ui";
import { morphoPublicAllocatorAbi } from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { type Address, encodeFunctionData, parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import {
  buildWithdrawals,
  getMaxReallocatableLiquidity,
} from "#/utils/borrowReallocation";
import { getMarketParams } from "#/utils/getMarketParams";

export const useGetBorrowReallocationTxs = () => {
  const { context, cowShedProxy } = useIFrameContext();

  const { markets } = useMorphoContext();

  return useCallback(
    async ({
      market,
      borrowAmount,
    }: MorphoSupplyFormData): Promise<BaseTransaction[] | undefined> => {
      if (
        !markets ||
        !context?.account ||
        !context?.chainId ||
        !cowShedProxy ||
        !borrowAmount
      )
        return;

      const { maxReallocatableLiquidity, possibleWithdrawals } =
        getMaxReallocatableLiquidity(market, markets);
      const amountBigNumber = BigNumber.from(
        parseUnits(borrowAmount.toString(), market.loanAsset.decimals),
      ).toBigInt();
      const withdrawals = buildWithdrawals(
        market,
        amountBigNumber,
        maxReallocatableLiquidity,
        possibleWithdrawals,
      );

      const publicAllocatorAddress =
        "0xA090dD1a701408Df1d4d0B85b716c87565f90467";

      const txs: BaseTransaction[] = withdrawals.map((withdrawal) => ({
        to: publicAllocatorAddress,
        value: BigInt(0),
        callData: encodeFunctionData({
          abi: morphoPublicAllocatorAbi,
          functionName: "reallocateTo",
          args: [
            withdrawal.commonVault as Address,
            [
              {
                amount: withdrawal.amount,
                marketParams: withdrawal.marketParams,
              },
            ],
            getMarketParams(market),
          ],
        }),
      }));

      return txs;
    },
    [context?.account, context?.chainId, cowShedProxy, markets],
  );
};
