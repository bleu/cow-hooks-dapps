import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { GetHooksTransactionsParams } from "./useGetHooksTransactions";
import {
  BaseTransaction,
  IHooksInfo,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import { Address, maxUint256, parseUnits } from "viem";

export const useGetHooksInfoVestAllFromSwap = () => {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    async (
      params: GetHooksTransactionsParams
    ): Promise<IHooksInfo | undefined> => {
      const {
        token,
        vestingEscrowFactoryAddress,
        formData: { period, periodScale, recipient },
      } = params;

      if (!context?.account || !cowShedProxy) return;

      const periodInSeconds = period * scaleToSecondsMapping[periodScale];
      const tokenAddress = token.address as Address;

      const txs = await Promise.all([
        // Proxy approves Vesting Escrow Factory
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: vestingEscrowFactoryAddress,
          amount: maxUint256,
        }),
        // Create vesting (weiroll)
        TransactionFactory.createRawTx(
          TRANSACTION_TYPES.CREATE_VESTING_WEIROLL,
          {
            type: TRANSACTION_TYPES.CREATE_VESTING_WEIROLL,
            token: tokenAddress,
            recipient: recipient,
            cowShedProxy,
            vestingDuration: BigInt(periodInSeconds),
            vestingEscrowFactoryAddress: vestingEscrowFactoryAddress,
          }
        ),
      ]);

      return { txs };
    },
    [context?.account, cowShedProxy]
  );
};
