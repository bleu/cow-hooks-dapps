import { type IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
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

export const useGetWithdrawHookInfo = () => {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async ({
      market,
      withdrawAmount,
    }: MorphoSupplyFormData): Promise<IHooksInfo | undefined> => {
      if (
        !context?.account ||
        !context?.chainId ||
        !cowShedProxy ||
        isZeroOrEmpty(withdrawAmount)
      )
        return;

      const amountBigNumber = BigNumber.from(
        parseUnits(withdrawAmount, market.collateralAsset.decimals),
      ).toBigInt();

      const tx = [
        await TransactionFactory.createRawTx(
          TRANSACTION_TYPES.MORPHO_WITHDRAW,
          {
            type: TRANSACTION_TYPES.MORPHO_WITHDRAW as const,
            marketParams: getMarketParams(market),
            assets: amountBigNumber,
            recipient: context.account,
          },
        ),
      ];

      return { txs: tx };
    },
    [context?.account, context?.chainId, cowShedProxy],
  );
};
