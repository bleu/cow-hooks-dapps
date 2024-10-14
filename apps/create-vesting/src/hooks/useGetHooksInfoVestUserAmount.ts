import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { GetHooksTransactionsParams } from "./useGetHooksTransactions";
import { IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import { Address, parseUnits } from "viem";

export const useGetHooksInfoVestUserAmount = () => {
  const { context, cowShedProxy, jsonRpcProvider } = useIFrameContext();

  return useCallback(
    async (
      params: GetHooksTransactionsParams
    ): Promise<IHooksInfo | undefined> => {
      const {
        token,
        vestingEscrowFactoryAddress,
        formData: { period, periodScale, amount, recipient },
      } = params;

      if (!context?.account || !cowShedProxy) return;

      const periodInSeconds = period * scaleToSecondsMapping[periodScale];
      const amountWei = parseUnits(
        amount.toFixed(token.decimals),
        token.decimals
      );
      const tokenAddress = token.address as Address;
      const tokenSymbol = token.symbol ?? "";

      const txs = await Promise.all([
        // Transfer to proxy
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_TRANSFER_FROM, {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
          token: tokenAddress,
          from: context?.account!,
          to: cowShedProxy,
          amount: amountWei,
          symbol: tokenSymbol,
        }),
        // Proxy approves Vesting Escrow Factory
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: vestingEscrowFactoryAddress,
          amount: amountWei,
        }),
        // Create vesting
        TransactionFactory.createRawTx(TRANSACTION_TYPES.CREATE_VESTING, {
          type: TRANSACTION_TYPES.CREATE_VESTING,
          token: tokenAddress,
          recipient: recipient,
          amount: amountWei,
          vestingDuration: BigInt(periodInSeconds),
          vestingEscrowFactoryAddress: vestingEscrowFactoryAddress,
        }),
      ]);

      const permitData = [
        {
          tokenAddress: tokenAddress,
          amount: amountWei,
          tokenSymbol: tokenSymbol,
        },
      ];

      return { txs, permitData };
    },
    [context?.account, cowShedProxy, jsonRpcProvider]
  );
};
