import { type IHooksInfo, useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  TRANSACTION_TYPES,
  TransactionFactory,
  morphoVaultAbi,
} from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import useSWR from "swr";
import { type Address, parseUnits } from "viem";
import type { DepositMorphoFormData } from "#/contexts/form";

export interface DepositMorphoHookParams {
  assetAddress: Address;
  assetSymbol: string;
  vaultAddress: Address;
  amount: bigint;
  minShares: bigint;
}

export const useGetHookInfo = ({ vault, amount }: DepositMorphoFormData) => {
  const { context, cowShedProxy, publicClient } = useIFrameContext();

  const getMinShares = useCallback(async () => {
    if (!publicClient || !vault?.address || !vault?.asset?.decimals || !amount)
      throw new Error("missing params");

    const amountBigNumber = BigNumber.from(
      parseUnits(amount.toString(), vault.asset.decimals)
    ).toBigInt();

    const minShares = await publicClient.readContract({
      address: vault.address,
      abi: morphoVaultAbi,
      functionName: "convertToShares",
      args: [amountBigNumber],
    });

    return (minShares * BigInt(9900)) / BigInt(10000); // 1% splippage
  }, [publicClient, vault, amount]);

  const { data: minShares } = useSWR(
    ["minShares", context?.chainId, context?.account, vault],
    getMinShares,
    {}
  );

  return useCallback(
    async ({
      vault,
      amount,
    }: DepositMorphoFormData): Promise<IHooksInfo | undefined> => {
      if (!context?.account || !cowShedProxy || !amount || !minShares) return;

      // TODO: create a mapping
      const morphoBundlerAddress = "0x23055618898e202386e6c13955a58D3C68200BFB";

      const amountBigNumber = BigNumber.from(
        parseUnits(amount.toString(), vault.asset.decimals)
      ).toBigInt();

      const txs = await Promise.all([
        // Transfer from user to proxy
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_TRANSFER_FROM, {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
          token: vault.asset.address,
          from: context.account,
          to: cowShedProxy,
          amount: amountBigNumber,
          symbol: vault.asset.symbol,
        }),
        // Approve deposit amount
        TransactionFactory.createRawTx(TRANSACTION_TYPES.ERC20_APPROVE, {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: vault.asset.address,
          spender: morphoBundlerAddress,
          amount: amountBigNumber,
        }),
        // Deposit
        TransactionFactory.createRawTx(TRANSACTION_TYPES.MORPHO_DEPOSIT, {
          type: TRANSACTION_TYPES.MORPHO_DEPOSIT,
          vaultAddress: vault.address,
          assetAddress: vault.asset.address,
          morphoBundlerAddress,
          amount: amountBigNumber,
          recipient: context.account,
          minShares,
        }),
      ]);

      const permitData = [
        {
          tokenAddress: vault.asset.address,
          amount: amountBigNumber,
          tokenSymbol: vault.asset.symbol,
        },
      ];

      return { txs, permitData };
    },
    [context?.account, cowShedProxy, minShares]
  );
};
