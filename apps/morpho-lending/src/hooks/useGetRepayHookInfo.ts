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

export const useGetRepayHookInfo = () => {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async ({
      market,
      repayAmount,
      isMaxRepay,
    }: MorphoSupplyFormData): Promise<IHooksInfo | undefined> => {
      if (
        !context?.account ||
        !context?.chainId ||
        !cowShedProxy ||
        !repayAmount
      )
        return;

      const amountBigNumber = BigNumber.from(
        parseUnits(repayAmount.toString(), market.loanAsset.decimals),
      ).toBigInt();

      const tokenAddress = market.loanAsset.address;
      const tokenSymbol = market.loanAsset.symbol;

      const repayArgs = isMaxRepay
        ? {
            type: TRANSACTION_TYPES.MORPHO_REPAY as const,
            marketParams: getMarketParams(market),
            assets: BigInt(0),
            shares: market.position.borrowShares,
            recipient: context.account,
          }
        : {
            type: TRANSACTION_TYPES.MORPHO_REPAY as const,
            marketParams: getMarketParams(market),
            assets: amountBigNumber,
            shares: BigInt(0),
            recipient: context.account,
          };

      const transferDustTx = isMaxRepay
        ? [
            await TransactionFactory.createRawTx(
              TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL,
              {
                type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL,
                token: tokenAddress,
                from: cowShedProxy,
                to: context.account,
                symbol: tokenSymbol,
              },
            ),
          ]
        : [];

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
        // Approve repay amount
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: MORPHO_ADDRESS,
          amount: amountBigNumber,
        }),
        // Repay (has buffer)
        TransactionFactory.createRawTx(
          TRANSACTION_TYPES.MORPHO_REPAY,
          repayArgs,
        ),
        // Send dust back to user
        ...transferDustTx,
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
