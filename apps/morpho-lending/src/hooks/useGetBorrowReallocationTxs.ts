import { type BaseTransaction, useIFrameContext } from "@bleu/cow-hooks-ui";
import { morphoPublicAllocatorAbi } from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { type Address, encodeFunctionData, parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import {
  buildReallocations,
  getPossibleReallocations,
} from "#/utils/borrowReallocation";
import { isZeroOrEmpty } from "#/utils/isZeroOrEmpty";
import { publicAllocatorMap } from "#/utils/publicAllocatorMap";

export const useGetBorrowReallocationTxs = () => {
  const { context, cowShedProxy } = useIFrameContext();
  const { markets, allMarkets } = useMorphoContext();

  return useCallback(
    async ({
      market,
      borrowAmount,
    }: MorphoSupplyFormData): Promise<BaseTransaction[] | undefined> => {
      if (
        !allMarkets ||
        !markets ||
        !context?.account ||
        !context?.chainId ||
        !cowShedProxy ||
        isZeroOrEmpty(borrowAmount)
      )
        return;

      const possibleReallocations = getPossibleReallocations(
        market,
        allMarkets,
      );

      const amountBigNumber = BigNumber.from(
        parseUnits(borrowAmount, market.loanAsset.decimals),
      ).toBigInt();

      const reallocations = buildReallocations(
        market,
        amountBigNumber,
        possibleReallocations,
      );

      const publicAllocatorAddress = publicAllocatorMap[context.chainId];

      const txs: BaseTransaction[] = reallocations.map((reallocation) => ({
        to: publicAllocatorAddress,
        value: BigInt(0),
        callData: encodeFunctionData({
          abi: morphoPublicAllocatorAbi,
          functionName: "reallocateTo",
          args: [
            reallocation.vault as Address,
            [
              {
                amount: reallocation.amount,
                marketParams: reallocation.from,
              },
            ],
            reallocation.to,
          ],
        }),
      }));

      return txs;
    },
    [context?.account, context?.chainId, cowShedProxy, markets, allMarkets],
  );
};
