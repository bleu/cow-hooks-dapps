import {
  type BaseTransaction,
  type MorphoMarket,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { morphoPublicAllocatorAbi } from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { type Address, encodeFunctionData, parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { buildReallocations } from "#/utils/borrowReallocation";
import { publicAllocatorMap } from "#/utils/publicAllocatorMap";
import { useBorrowReallocation } from "./useBorrowReallocation";

export const useGetBorrowReallocationTxs = (
  market: MorphoMarket | undefined,
) => {
  const { context, cowShedProxy } = useIFrameContext();
  const { markets } = useMorphoContext();

  const { possibleReallocations } = useBorrowReallocation(market);

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
        !possibleReallocations ||
        !borrowAmount
      )
        return;

      const amountBigNumber = BigNumber.from(
        parseUnits(borrowAmount.toString(), market.loanAsset.decimals),
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
    [
      context?.account,
      context?.chainId,
      cowShedProxy,
      markets,
      possibleReallocations,
    ],
  );
};
