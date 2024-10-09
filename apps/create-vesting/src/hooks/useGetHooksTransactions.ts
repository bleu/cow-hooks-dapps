import { IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useCallback } from "react";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { Address, parseUnits } from "viem";
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";
import { createVestingSchema } from "#/utils/schema";
import { Token } from "@uniswap/sdk-core";

import { isERC20Permit } from "#/utils/isERC20Permit";

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

      const isTokenERC20Permit =
        jsonRpcProvider && (await isERC20Permit(tokenAddress, jsonRpcProvider));

      const transferFromTx = isTokenERC20Permit
        ? // token is permittable
          TransactionFactory.createRawTx(
            TRANSACTION_TYPES.ERC20PERMIT_TRANSFER_FROM,
            {
              type: TRANSACTION_TYPES.ERC20PERMIT_TRANSFER_FROM,
              token: tokenAddress,
              from: context?.account,
              to: cowShedProxy,
              amount: amountWei,
              symbol: tokenSymbol,
            }
          )
        : // token is not permittable
          TransactionFactory.createRawTx(
            TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
            {
              type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
              token: tokenAddress,
              from: context?.account,
              to: cowShedProxy,
              amount: amountWei,
              symbol: tokenSymbol,
            }
          );

      const txs = await Promise.all([
        // Transfer to proxy
        transferFromTx,
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
