import {
  type IHooksInfo,
  type MorphoMarket,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { getMarketParams } from "#/utils/getMarketParams";
import { isZeroOrEmpty } from "#/utils/isZeroOrEmpty";
import { useGetBorrowReallocationTxs } from "./useGetBorrowReallocationTxs";

export const useGetBorrowHookInfo = (market: MorphoMarket | undefined) => {
  const { context, cowShedProxy } = useIFrameContext();
  const getBorrowReallocationTxs = useGetBorrowReallocationTxs(market);

  return useCallback(
    async (data: MorphoSupplyFormData): Promise<IHooksInfo | undefined> => {
      const { market, borrowAmount } = data;

      if (
        !context?.account ||
        !context?.chainId ||
        !cowShedProxy ||
        isZeroOrEmpty(borrowAmount)
      )
        return;

      const amountBigNumber = BigNumber.from(
        parseUnits(borrowAmount, market.loanAsset.decimals),
      ).toBigInt();

      // When market doesn't have enough supply
      const reallocationTxs = await getBorrowReallocationTxs(data);

      const borrowTx = await TransactionFactory.createRawTx(
        TRANSACTION_TYPES.MORPHO_BORROW,
        {
          type: TRANSACTION_TYPES.MORPHO_BORROW,
          marketParams: getMarketParams(market),
          assets: amountBigNumber,
          shares: BigInt(0),
          recipient: context.account,
        },
      );
      const txs = [...(reallocationTxs ?? []), borrowTx];

      return { txs };
    },
    [
      context?.account,
      context?.chainId,
      cowShedProxy,
      getBorrowReallocationTxs,
    ],
  );
};
