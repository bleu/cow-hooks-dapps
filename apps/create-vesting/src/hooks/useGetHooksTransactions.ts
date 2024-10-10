import { IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useCallback } from "react";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { Address, maxUint256, parseUnits } from "viem";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import { createVestingSchema } from "#/utils/schema";
import { Token } from "@uniswap/sdk-core";

interface GetHooksTransactionsParams {
  token: Token;
  vestingEscrowFactoryAddress: Address;
  formData: typeof createVestingSchema._type;
}

export function useGetHooksTransactions() {
  const { context, cowShedProxy, jsonRpcProvider } = useIFrameContext();

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
      const tokenSymbol = token.symbol ?? "";

      const txs = await Promise.all([
        // Proxy approves Vesting Escrow Factory
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: tokenAddress,
          spender: vestingEscrowFactoryAddress,
          amount: maxUint256,
        }),
        // Create vesting (weiroll)
        TransactionFactory.createRawTx(TRANSACTION_TYPES.CREATE_VESTING, {
          type: TRANSACTION_TYPES.CREATE_VESTING,
          token: tokenAddress,
          recipient: recipient,
          cowShedProxy,
          vestingDuration: BigInt(periodInSeconds),
          vestingEscrowFactoryAddress: vestingEscrowFactoryAddress,
        }),
      ]);

      return {
        txs,
      };
    },
    [context?.account, cowShedProxy]
  );
}
