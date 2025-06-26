import { type IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { MORPHO_ADDRESS } from "@bleu/utils/transactionFactory/morpho";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { getMarketParams } from "#/utils/getMarketParams";
import { isZeroOrEmpty } from "#/utils/isZeroOrEmpty";

export const useGetSupplyHookInfo = () => {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async ({
      market,
      supplyAmount,
    }: MorphoSupplyFormData): Promise<IHooksInfo | undefined> => {
      if (
        !context?.account ||
        !context?.chainId ||
        !cowShedProxy ||
        isZeroOrEmpty(supplyAmount)
      )
        return;

      const amountBigNumber = BigNumber.from(
        parseUnits(supplyAmount, market.collateralAsset.decimals),
      ).toBigInt();

      const tokenAddress = market.collateralAsset.address;
      const tokenSymbol = market.collateralAsset.symbol;

      const txs = await Promise.all([
        // Transfer from user to proxy
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_TRANSFER_FROM, {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
          token: tokenAddress,
          from: context.account,
          to: cowShedProxy,
          amount: amountBigNumber,
          symbol: tokenSymbol,
        }),
        // Approve deposit amount
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: MORPHO_ADDRESS,
          amount: amountBigNumber,
        }),
        // Deposit
        TransactionFactory.createRawTx(TRANSACTION_TYPES.MORPHO_SUPPLY, {
          type: TRANSACTION_TYPES.MORPHO_SUPPLY,
          marketParams: getMarketParams(market),
          amount: amountBigNumber,
          recipient: context.account,
        }),
      ]);

      const permitData = [
        {
          tokenAddress: tokenAddress,
          amount: amountBigNumber,
          tokenSymbol: tokenSymbol,
        },
      ];

      return { txs, permitData };
    },
    [context?.account, context?.chainId, cowShedProxy],
  );
};
