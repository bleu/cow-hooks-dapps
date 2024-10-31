import {
  AddLiquidity,
  AddLiquidityKind,
  type AddLiquidityProportionalInput,
  MAX_UINT256,
} from "@balancer/sdk";
import {
  type IHooksInfo,
  type IPool,
  fetchPoolState,
  useIFrameContext,
  useTokensAllowances,
} from "@bleu/cow-hooks-ui";
import {
  type BalancerDepositArgs,
  type ERC20ApproveArgs,
  type ERC20TransferFromAllWeirollArgs,
  type ERC20TransferFromArgs,
  RPC_URL_MAPPING,
  TRANSACTION_TYPES,
  TransactionFactory,
} from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback, useMemo } from "react";
import { type Address, maxUint256, parseUnits } from "viem";
import type { FormType } from "#/types";

const addLiquidity = new AddLiquidity();

export function useGetHookInfo(pool?: IPool) {
  const { cowShedProxy, context } = useIFrameContext();
  const tokenAllowances = useTokensAllowances({
    tokenAddresses: pool?.allTokens.map((token) => token.address) || [],
    spender: cowShedProxy,
  });

  const defaultPermitData = useMemo(() => {
    return pool?.allTokens.map((token) => {
      return {
        tokenAddress: token.address,
        amount: maxUint256,
        tokenSymbol: token.symbol,
      };
    });
  }, [pool]);

  const getPermitData = useCallback(
    (params: FormType) => {
      if (!pool) throw new Error("Missing pool");

      if (!tokenAllowances) return defaultPermitData;

      // Check needed allowance with 5% buffer
      const amountsWithBuffer = pool.allTokens.map((token) => {
        const tokenAddress = token.address.toLowerCase();
        const amount = params.amounts[tokenAddress];
        const amountBigNumber = BigNumber.from(
          parseUnits(amount.toString(), token.decimals),
        );
        return {
          tokenAddress,
          amount: amountBigNumber.toBigInt(),
          tokenSymbol: token.symbol,
        };
      });

      // Filter tokens that need approval and build max permit data
      return (
        amountsWithBuffer
          .filter((permitInfo) => {
            const allowance = tokenAllowances[permitInfo.tokenAddress];
            return (
              !allowance || BigNumber.from(allowance).lt(permitInfo.amount)
            );
          })
          .map((permitInfo) => {
            return {
              tokenAddress: permitInfo.tokenAddress,
              amount: maxUint256,
              tokenSymbol: permitInfo.tokenSymbol,
            };
          }) || []
      );
    },
    [pool, tokenAllowances, defaultPermitData],
  );

  const getPoolDepositTxs = useCallback(
    async (params: FormType) => {
      if (!pool || !context || !context.account || !cowShedProxy)
        throw new Error("Missing context");
      const poolState = await fetchPoolState(pool.id, context.chainId);

      const referenceTokenDecimals = pool.allTokens.find(
        (token) =>
          token.address.toLowerCase() ===
          params.referenceTokenAddress.toLowerCase(),
      )?.decimals;

      if (!referenceTokenDecimals) throw new Error("Invalid reference token");

      const addLiquidityInput: AddLiquidityProportionalInput = {
        chainId: context.chainId,
        rpcUrl: RPC_URL_MAPPING[context.chainId],
        referenceAmount: {
          rawAmount: parseUnits(
            params.amounts[
              params.referenceTokenAddress.toLowerCase()
            ].toString(),
            referenceTokenDecimals,
          ),
          decimals: referenceTokenDecimals,
          address: params.referenceTokenAddress as Address,
        },
        kind: AddLiquidityKind.Proportional,
      };
      const query = await addLiquidity.query(addLiquidityInput, poolState);

      const depositArg: BalancerDepositArgs = {
        type: TRANSACTION_TYPES.BALANCER_DEPOSIT,
        query,
        chainId: context.chainId,
        sender: cowShedProxy,
        recipient: context.account,
      };

      const transferFromUserToProxyArgs = query.amountsIn.map((tokenAmount) => {
        return {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
          token: tokenAmount.token.address,
          from: context.account,
          to: cowShedProxy,
          amount: tokenAmount.amount,
          symbol: tokenAmount.token.symbol,
        } as ERC20TransferFromArgs;
      });

      const approveArgs = pool.allTokens.map((token) => {
        return {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: token.address as Address,
          spender: pool.address,
          amount: MAX_UINT256,
        } as ERC20ApproveArgs;
      });

      return Promise.all(
        [...transferFromUserToProxyArgs, ...approveArgs, depositArg].map(
          (arg) => TransactionFactory.createRawTx(arg.type, arg),
        ),
      );
    },
    [context, cowShedProxy, pool],
  );

  const getWeirollTransferFromProxyToUserTxs = useCallback(() => {
    if (!pool || !context?.account || !cowShedProxy)
      throw new Error("Missing context");

    const weirollTransferFromProxyArgs = pool.allTokens.map((token) => {
      const tokenAddress = token.address.toLowerCase();
      return {
        type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL,
        token: tokenAddress as Address,
        from: cowShedProxy,
        to: context.account,
        symbol: token.symbol,
      } as ERC20TransferFromAllWeirollArgs;
    });

    return Promise.all(
      weirollTransferFromProxyArgs.map((arg) => {
        return TransactionFactory.createRawTx(arg.type, arg);
      }),
    );
  }, [context?.account, cowShedProxy, pool]);

  return useCallback(
    async (args: FormType): Promise<IHooksInfo> => {
      const [permitData, poolDepositTxs] = await Promise.all([
        getPermitData(args),
        getPoolDepositTxs(args),
        getWeirollTransferFromProxyToUserTxs(),
      ]);

      return {
        permitData: permitData || [],
        txs: [...poolDepositTxs],
      };
    },
    [getPermitData, getPoolDepositTxs, getWeirollTransferFromProxyToUserTxs],
  );
}
