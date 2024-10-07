import { IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useCallback } from "react";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { Address, parseUnits } from "viem";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import { createVestingSchema } from "#/utils/schema";

interface GetHooksTransactionsParams {
  tokenAddress: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  vestingEscrowFactoryAddress: Address;
  formData: typeof createVestingSchema._type;
}

export function useGetHooksTransactions() {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async (
      params: GetHooksTransactionsParams
    ): Promise<IHooksInfo | undefined> => {
      const {
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        vestingEscrowFactoryAddress,
        formData: { period, periodScale, amount, recipient },
      } = params;

      if (!context?.account || !cowShedProxy) return;

      const periodInSeconds = period * scaleToSecondsMapping[periodScale];
      const amountWei = parseUnits(String(amount), tokenDecimals); // TODO: Implement logic

      const txs = await Promise.all([
        // Transfer to proxy
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_TRANSFER_FROM, {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
          token: tokenAddress,
          from: context?.account,
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

      return {
        txs,
        permitData: permitData,
      };
    },
    [context?.account, cowShedProxy]
  );
}
